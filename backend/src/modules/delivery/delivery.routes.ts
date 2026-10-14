import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { UserRole } from '@prisma/client';
import * as deliveryService from './delivery.service';
import prisma from '../../config/prisma';
import { successResponse } from '../../utils/response';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { AuthenticatedRequest } from '../../types';
import AppError from '../../utils/AppError';
import {
  verifySignedKycToken,
  retrieveKycFileBuffer,
  MAX_FILE_SIZE_BYTES,
} from './deliveryKycStorage.service';
import { verifyInstallationCompletion } from '../services/installationCompletion.service';

const router = Router();

// Middleware: Delivery Partner Role Requirement for Delivery Portal Endpoints
const requireDeliveryPartner = [authenticate, authorize(UserRole.DELIVERY_PARTNER)];
const requireAdmin = [authenticate, authorize(UserRole.ADMIN)];

// Multer storage for secure KYC document upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES, // 10 MB
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
    if (allowed.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new AppError('Invalid file format. Only JPEG, PNG, WebP images and PDF documents are allowed.', 400));
    }
  },
});

const handleFileUpload = (req: Request, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return next(AppError.badRequest('File must be less than 10 MB'));
      }
      return next(err);
    }
    next();
  });
};

// ============================================================================
// 1. PUBLIC ONBOARDING & AUTHENTICATION
// ============================================================================

// Delivery partner registration
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await deliveryService.registerDeliveryPartner(req.body);
    return successResponse(res, result, 'Delivery partner registered successfully. Please upload KYC documents.', 201);
  } catch (error) {
    next(error);
  }
});

// Delivery partner login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await deliveryService.loginDeliveryPartner(req.body);
    return successResponse(res, result, 'Delivery partner login successful.');
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// 2. PARTNER PROFILE & DUTY TOGGLE (STRICT DELIVERY_PARTNER RBAC)
// ============================================================================

router.get('/profile', requireDeliveryPartner, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await deliveryService.getDeliveryProfile(req.user!.id);
    return successResponse(res, profile);
  } catch (error) {
    next(error);
  }
});

router.put('/profile', requireDeliveryPartner, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const updated = await deliveryService.updateDeliveryProfile(req.user!.id, req.body);
    return successResponse(res, updated, 'Profile updated successfully.');
  } catch (error) {
    next(error);
  }
});

// Online / Offline Duty Status Toggle
const handleDutyToggle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { isOnline } = req.body;
    const updated = await deliveryService.toggleDutyStatus(req.user!.id, isOnline);
    return successResponse(res, updated, `Duty status set to ${isOnline ? 'ONLINE' : 'OFFLINE'}.`);
  } catch (error) {
    next(error);
  }
};
router.put('/duty', requireDeliveryPartner, handleDutyToggle);
router.patch('/duty', requireDeliveryPartner, handleDutyToggle);

// ============================================================================
// 3. KYC MANAGEMENT & UPLOADS
// ============================================================================

router.get('/kyc', requireDeliveryPartner, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const kyc = await deliveryService.getKycDetails(req.user!.id);
    return successResponse(res, kyc);
  } catch (error) {
    next(error);
  }
});

// Multipart file upload for KYC document
router.post('/kyc/upload', requireDeliveryPartner, handleFileUpload, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw AppError.badRequest('No file uploaded. Please select an image or PDF document.');
    }
    const result = await deliveryService.uploadKycDocumentFile({
      userId: req.user!.id,
      documentType: req.body.documentType || 'OTHER',
      file: req.file,
      idNumber: req.body.idNumber,
      licenseNumber: req.body.licenseNumber || req.body.dlNumber,
      vehicleType: req.body.vehicleType,
      vehicleNum: req.body.vehicleNum,
    });
    return successResponse(res, result, 'KYC document uploaded successfully.', 201);
  } catch (error) {
    next(error);
  }
});

// Remove document before review
router.delete('/kyc/document/:id', requireDeliveryPartner, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await deliveryService.removeKycDocument(req.user!.id, req.params.id as string);
    return successResponse(res, result, 'KYC document removed.');
  } catch (error) {
    next(error);
  }
});

// Submit all 5 required KYC documents for review
router.post('/kyc/submit', requireDeliveryPartner, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await deliveryService.submitKycForReview(req.user!.id, {
      licenseNumber: req.body.licenseNumber || req.body.dlNumber,
      vehicleNum: req.body.vehicleNum,
    });
    return successResponse(res, result, 'KYC submitted for admin verification.');
  } catch (error) {
    next(error);
  }
});

// Serve private KYC document with HMAC signature validation (short-lived URL token)
router.get('/kyc/secure-file', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key, expires, sig } = req.query as { key?: string; expires?: string; sig?: string };
    if (!key || !expires || !sig) {
      return res.status(403).json({ success: false, message: 'Forbidden: Missing secure signature parameters.' });
    }
    const isValid = verifySignedKycToken(key, expires, sig);
    if (!isValid) {
      return res.status(403).json({ success: false, message: 'Forbidden: Document link has expired or has an invalid signature.' });
    }
    const fileResult = await retrieveKycFileBuffer(key);
    if (!fileResult) {
      return res.status(404).json({ success: false, message: 'File not found on secure storage.' });
    }
    res.setHeader('Content-Type', fileResult.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${key.split('/').pop() || 'document'}"`);
    res.setHeader('Cache-Control', 'private, max-age=900');
    return res.send(fileResult.buffer);
  } catch (error) {
    next(error);
  }
});

// Authenticated private document stream with strict RBAC (ADMIN or owning partner only; others get 403)
router.get('/kyc/document/:id/file', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const fileData = await deliveryService.getKycDocumentFileStream(req.user!, req.params.id as string);
    res.setHeader('Content-Type', fileData.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${fileData.filename}"`);
    res.setHeader('Cache-Control', 'private, max-age=900');
    return res.send(fileData.buffer);
  } catch (error) {
    next(error);
  }
});

// Authenticated proxy route by objectKey (for owning partner or Admin)
router.get('/kyc/files/:key(*)', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const objectKey = Array.isArray(req.params.key) ? req.params.key.join('/') : String(req.params.key || '');
    const fileResult = await retrieveKycFileBuffer(objectKey);
    if (!fileResult) {
      return res.status(404).json({ success: false, message: 'File not found on secure storage.' });
    }
    // Security check: must be Admin or the user matching the key path
    const isAdmin = req.user?.role === 'ADMIN' || (req.user as any)?.role === 'SUPER_ADMIN';
    const isOwner = objectKey.includes(`/${req.user?.id}/`);
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to view this document.' });
    }
    res.setHeader('Content-Type', fileResult.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${objectKey.split('/').pop() || 'document'}"`);
    res.setHeader('Cache-Control', 'private, max-age=900');
    return res.send(fileResult.buffer);
  } catch (error) {
    next(error);
  }
});

// Dedicated Admin KYC verification endpoint (Admin only)
router.post('/kyc/verify', requireAdmin, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const targetUserId = req.body.userId;
    if (!targetUserId) {
      throw AppError.badRequest('Target userId is required for KYC verification.');
    }
    const result = await deliveryService.adminVerifyKyc(targetUserId, req.user!.id, {
      status: req.body.status || 'APPROVED',
      rejectionReason: req.body.rejectionReason,
    });
    return successResponse(res, result, `KYC status updated to ${req.body.status || 'APPROVED'}.`);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// 4. DASHBOARD & JOBS (STRICT DELIVERY_PARTNER RBAC)
// ============================================================================

router.get('/dashboard', requireDeliveryPartner, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = await deliveryService.getDeliveryDashboard(req.user!.id);
    return successResponse(res, data);
  } catch (error) {
    next(error);
  }
});

// Available open jobs feed
router.get('/jobs/available', requireDeliveryPartner, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const jobs = await deliveryService.listAvailableJobs(req.user!.id);
    return successResponse(res, jobs);
  } catch (error) {
    next(error);
  }
});

// Partner's claimed / assigned jobs
router.get('/jobs/my', requireDeliveryPartner, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const filter = {
      status: req.query.status as string | undefined,
      type: req.query.type as string | undefined,
    };
    const jobs = await deliveryService.listMyJobs(req.user!.id, filter);
    return successResponse(res, jobs);
  } catch (error) {
    next(error);
  }
});

// Single job detail with navigation info
router.get('/jobs/:id', requireDeliveryPartner, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const job = await deliveryService.getJobById(req.user!.id, req.params.id as string);
    return successResponse(res, job);
  } catch (error) {
    next(error);
  }
});

// Critical Security: Restrict direct manual job creation to Admin only
router.post('/jobs', requireAdmin, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const job = await prisma.deliveryAssignment.create({ data: req.body });
    return successResponse(res, job, 'Delivery job created successfully by administrator.', 201);
  } catch (error) {
    next(error);
  }
});

// Claim / Accept job
router.post('/jobs/:id/accept', requireDeliveryPartner, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const accepted = await deliveryService.acceptJob(req.user!.id, req.params.id as string);
    return successResponse(res, accepted, 'Delivery job accepted successfully.');
  } catch (error) {
    next(error);
  }
});

// Update delivery status (ACCEPTED -> PICKED_UP -> IN_TRANSIT -> DELIVERED)
router.put('/jobs/:id/status', requireDeliveryPartner, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { status, notes } = req.body;
    const updated = await deliveryService.updateJobStatus(req.user!.id, req.params.id as string, status, notes);
    return successResponse(res, updated, `Delivery status updated to ${status}.`);
  } catch (error) {
    next(error);
  }
});

// Verify installation completion (Only permitted if delivery partner is assigned doorstep installation)
router.post('/jobs/:id/verify-installation', requireDeliveryPartner, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await verifyInstallationCompletion({
      deliveryAssignmentId: req.params.id as string,
      code: req.body.code,
      notes: req.body.notes,
      user: req.user!,
    });
    return successResponse(res, result, 'Doorstep installation verified successfully!');
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// 5. CASH ON DELIVERY (COD) & RECONCILIATION (DELIVERY_PARTNER RBAC)
// ============================================================================

// Collect COD Cash
const handleCodCollection = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { amount } = req.body;
    const result = await deliveryService.recordCodCollection(req.user!.id, req.params.id as string, amount);
    return successResponse(res, result, 'Cash on Delivery collection recorded successfully.');
  } catch (error) {
    next(error);
  }
};
router.post('/jobs/:id/cod', requireDeliveryPartner, handleCodCollection);
router.post('/jobs/:id/collect-cod', requireDeliveryPartner, handleCodCollection);

// Settle / Reconcile cash at hub
router.post('/reconcile', requireDeliveryPartner, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await deliveryService.reconcileCodCash(req.user!.id, req.body);
    return successResponse(res, result, 'COD cash reconciled and deposited successfully.');
  } catch (error) {
    next(error);
  }
});

// Reconciliations history
router.get('/reconciliations', requireDeliveryPartner, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const list = await deliveryService.listReconciliations(req.user!.id);
    return successResponse(res, list);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// 6. USED-PART DOORSTEP PICKUP & HANDOVER (GARAGE-FIRST WORKFLOW)
// ============================================================================

router.post('/jobs/:id/verify-used-part', requireDeliveryPartner, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await deliveryService.performUsedPartVerification(req.user!.id, req.params.id as string, req.body);
    return successResponse(res, result, 'Doorstep used-part pickup recorded successfully.');
  } catch (error) {
    next(error);
  }
});

export default router;
