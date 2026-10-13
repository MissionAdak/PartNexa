import { Router, Request, Response, NextFunction } from 'express';
import * as deliveryService from './delivery.service';
import prisma from '../../config/prisma';
import { successResponse } from '../../utils/response';
import { authenticate } from '../../middleware/auth.middleware';
import { AuthenticatedRequest } from '../../types';

const router = Router();

// ============================================================================
// PUBLIC ROUTES
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
// AUTHENTICATED DELIVERY PORTAL ROUTES
// ============================================================================

// Partner Profile
router.get('/profile', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await deliveryService.getDeliveryProfile(req.user!.id);
    return successResponse(res, profile);
  } catch (error) {
    next(error);
  }
});

router.put('/profile', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
router.put('/duty', authenticate, handleDutyToggle);
router.patch('/duty', authenticate, handleDutyToggle);

import multer from 'multer';
import AppError from '../../utils/AppError';
import {
  verifySignedKycToken,
  retrieveKycFileBuffer,
  MAX_FILE_SIZE_BYTES,
} from './deliveryKycStorage.service';

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
// KYC MANAGEMENT & VERIFICATION
// ============================================================================

router.get('/kyc', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const kyc = await deliveryService.getKycDetails(req.user!.id);
    return successResponse(res, kyc);
  } catch (error) {
    next(error);
  }
});

// Multipart file upload for KYC document
router.post('/kyc/upload', authenticate, handleFileUpload, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw AppError.badRequest('No file uploaded. Please select an image or PDF document.');
    }
    const result = await deliveryService.uploadKycDocumentFile({
      userId: req.user!.id,
      documentType: req.body.documentType || 'OTHER',
      file: req.file,
      idNumber: req.body.idNumber,
      vehicleType: req.body.vehicleType,
      vehicleNum: req.body.vehicleNum,
    });
    return successResponse(res, result, 'KYC document uploaded successfully.', 201);
  } catch (error) {
    next(error);
  }
});

// Legacy JSON document metadata endpoint
router.post('/kyc/document', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await deliveryService.uploadKycDocument({
      userId: req.user!.id,
      ...req.body,
    });
    return successResponse(res, result, 'KYC document uploaded successfully.');
  } catch (error) {
    next(error);
  }
});

// Remove document before review
router.delete('/kyc/document/:id', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await deliveryService.removeKycDocument(req.user!.id, req.params.id as string);
    return successResponse(res, result, 'KYC document removed.');
  } catch (error) {
    next(error);
  }
});

// Serve private KYC document with HMAC signature validation (no credentials in URL required if valid token)
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
    const fileResult = retrieveKycFileBuffer(key);
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

// Authenticated private document stream with strict RBAC (ADMIN or owning partner only)
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

router.post('/kyc/submit', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await deliveryService.submitKycForReview(req.user!.id);
    return successResponse(res, result, 'KYC submitted for admin verification.');
  } catch (error) {
    next(error);
  }
});

// Admin verification (strictly ADMIN / SUPER_ADMIN only; Customer, Workshop, or other partner get 403)
router.post('/kyc/verify', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const role = req.user?.role;
    if (role !== 'ADMIN' && (req.user as any)?.role !== 'SUPER_ADMIN') {
      throw AppError.forbidden('Forbidden: Only platform administrators can verify and approve/reject KYC.');
    }
    const targetUserId = req.body.userId;
    if (!targetUserId) {
      throw AppError.badRequest('Target userId is required for KYC verification.');
    }
    const result = await deliveryService.adminVerifyKyc(targetUserId, {
      status: req.body.status || 'APPROVED',
      rejectionReason: req.body.rejectionReason,
    });
    return successResponse(res, result, `KYC status updated to ${req.body.status || 'APPROVED'}.`);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// DASHBOARD & JOBS (WITH STRICT ISOLATION ACCESS CONTROL)
// ============================================================================

router.get('/dashboard', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = await deliveryService.getDeliveryDashboard(req.user!.id);
    return successResponse(res, data);
  } catch (error) {
    next(error);
  }
});

// Available open jobs feed
router.get('/jobs/available', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const jobs = await deliveryService.listAvailableJobs(req.user!.id);
    return successResponse(res, jobs);
  } catch (error) {
    next(error);
  }
});

// Create delivery job
router.post('/jobs', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const job = await prisma.deliveryAssignment.create({ data: req.body });
    return successResponse(res, job, 'Delivery job created successfully.', 201);
  } catch (error) {
    next(error);
  }
});

// Partner's claimed / assigned jobs
router.get('/jobs/my', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

// Single job detail with navigation info (strict partner check)
router.get('/jobs/:id', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const job = await deliveryService.getJobById(req.user!.id, req.params.id as string);
    return successResponse(res, job);
  } catch (error) {
    next(error);
  }
});

// Claim / Accept job
router.post('/jobs/:id/accept', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const accepted = await deliveryService.acceptJob(req.user!.id, req.params.id as string);
    return successResponse(res, accepted, 'Delivery job accepted successfully.');
  } catch (error) {
    next(error);
  }
});

import { verifyInstallationCompletion } from '../services/installationCompletion.service';

// Update delivery status (PICKED_UP -> IN_TRANSIT -> DELIVERED)
router.put('/jobs/:id/status', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { status, notes } = req.body;
    const updated = await deliveryService.updateJobStatus(req.user!.id, req.params.id as string, status, notes);
    return successResponse(res, updated, `Delivery status updated to ${status}.`);
  } catch (error) {
    next(error);
  }
});

// Step 11: Verify installation completion (Only permitted if delivery partner is explicitly assigned installation)
router.post('/jobs/:id/verify-installation', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
// CASH ON DELIVERY (COD) & RECONCILIATION
// ============================================================================

// Collect COD Cash
router.post('/jobs/:id/cod', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { amount } = req.body;
    const result = await deliveryService.recordCodCollection(req.user!.id, req.params.id as string, amount);
    return successResponse(res, result, 'Cash on Delivery collection recorded successfully.');
  } catch (error) {
    next(error);
  }
});

router.post('/jobs/:id/collect-cod', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { amount } = req.body;
    const result = await deliveryService.recordCodCollection(req.user!.id, req.params.id as string, amount);
    return successResponse(res, result, 'Cash on Delivery collection recorded successfully.');
  } catch (error) {
    next(error);
  }
});

// Settle / Reconcile cash at hub
router.post('/reconcile', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await deliveryService.reconcileCodCash(req.user!.id, req.body);
    return successResponse(res, result, 'COD cash reconciled and deposited successfully.');
  } catch (error) {
    next(error);
  }
});

// Reconciliations history
router.get('/reconciliations', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const list = await deliveryService.listReconciliations(req.user!.id);
    return successResponse(res, list);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// USED-PART DOORSTEP VERIFICATION
// ============================================================================

router.post('/jobs/:id/verify-used-part', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await deliveryService.performUsedPartVerification(req.user!.id, req.params.id as string, req.body);
    return successResponse(res, result, 'Doorstep used-part inspection recorded successfully.');
  } catch (error) {
    next(error);
  }
});

export default router;
