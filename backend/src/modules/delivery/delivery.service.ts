import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt';
import {
  KYCDocumentType,
  OrderStatus,
  PaymentStatus,
  DeliveryAssignmentStatus,
  UsedPartStatus,
  PayoutStatus,
} from '@prisma/client';
import { createNotification } from '../notifications/notifications.service';
import {
  saveKycDocumentFile,
  createSignedKycUrl,
  retrieveKycFileBuffer,
  deleteKycDocumentFile,
} from './deliveryKycStorage.service';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ============================================================================
// HELPER: RESOLVE PARTNER FROM USER
// ============================================================================
export const resolvePartnerByUser = async (userId: string) => {
  const partner = await prisma.deliveryPartner.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
          kyc: true,
        },
      },
    },
  });

  if (!partner) {
    throw AppError.notFound('No delivery partner profile associated with this account. Please register first.');
  }

  const isApproved =
    (partner.user as any)?.status === 'ACTIVE' &&
    (partner.user as any)?.kyc?.status === 'APPROVED';

  return {
    ...partner,
    isActivated: isApproved,
    verificationStatus: (partner.user as any)?.kyc?.status || 'NOT_SUBMITTED',
  };
};

// Helper to sanitize user object
const safeUser = (user: any) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  phone: user.phone,
  role: user.role,
  status: user.status,
});

// ============================================================================
// 1. ONBOARDING & AUTHENTICATION
// ============================================================================
export const registerDeliveryPartner = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  vehicleType?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleNum?: string;
  licenseNumber?: string;
  preferredCity?: string;
  emergencyContact?: string;
}) => {
  if (!data.email || !data.password || !data.firstName || !data.lastName || !data.phone) {
    throw AppError.badRequest('First name, last name, email, password, and phone number are required.');
  }

  if (data.password.length < 6) {
    throw AppError.badRequest('Password must be at least 6 characters long.');
  }

  // 1. Prevent duplicate email
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase().trim() },
  });

  if (existingUser) {
    throw AppError.conflict('An account with this email address already exists.');
  }

  // 2. Prevent duplicate phone
  if (data.phone && data.phone.trim()) {
    const cleanPhone = data.phone.trim();
    const existingPhone = await prisma.user.findFirst({
      where: { phone: cleanPhone },
    });
    if (existingPhone) {
      throw AppError.conflict('An account with this phone number already exists.');
    }
  }

  // 3. Prevent duplicate vehicle registration number where provided
  if (data.vehicleNum && data.vehicleNum.trim()) {
    const cleanVehicleNum = data.vehicleNum.trim().toUpperCase();
    const existingVehicle = await prisma.deliveryPartner.findFirst({
      where: { vehicleNum: cleanVehicleNum },
    });
    if (existingVehicle) {
      throw AppError.conflict('A vehicle with this registration number is already registered.');
    }
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  // 4. Create Delivery Partner User with initial PENDING_VERIFICATION status
  const newUser = await prisma.user.create({
    data: {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      phone: data.phone.trim(),
      role: 'DELIVERY_PARTNER',
      status: 'PENDING_VERIFICATION',
    },
  });

  // 5. Compose vehicle description if make and model are provided
  const baseVehicleType = data.vehicleType?.trim() || 'Bike';
  const makeModel = [data.vehicleMake?.trim(), data.vehicleModel?.trim()].filter(Boolean).join(' ');
  const formattedVehicle = makeModel ? `${baseVehicleType} (${makeModel})` : baseVehicleType;

  // 6. Create Partner Profile (Activation pending KYC verification)
  const newPartner = await prisma.deliveryPartner.create({
    data: {
      userId: newUser.id,
      vehicleType: formattedVehicle,
      vehicleNum: data.vehicleNum ? data.vehicleNum.trim().toUpperCase() : null,
      licenseNumber: data.licenseNumber ? data.licenseNumber.trim().toUpperCase() : null,
      isOnline: false,
      rating: 5.0,
      totalDeliveries: 0,
    },
  });

  // 7. Persist address record if provided
  if (data.address || data.city || data.state || data.postalCode) {
    try {
      await prisma.address.create({
        data: {
          userId: newUser.id,
          fullName: `${data.firstName.trim()} ${data.lastName.trim()}`,
          phone: data.phone.trim(),
          line1: data.address?.trim() || 'Operational Base',
          line2: data.emergencyContact ? `Emergency Contact: ${data.emergencyContact.trim()}` : null,
          city: data.city?.trim() || data.preferredCity?.trim() || 'Operational Area',
          state: data.state?.trim() || 'State',
          pincode: data.postalCode?.trim() || '000000',
          landmark: data.preferredCity ? `Preferred Zone: ${data.preferredCity.trim()}` : null,
          isDefault: true,
        },
      });
    } catch (addrErr) {
      console.warn('[registerDeliveryPartner] Optional address creation notice:', addrErr);
    }
  }

  // 8. Initialize KYC record container
  const newKyc = await prisma.kYC.create({
    data: {
      userId: newUser.id,
      status: 'NOT_SUBMITTED',
    },
  });

  // 9. Generate secure shared-platform tokens
  const accessToken = generateAccessToken({
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
  });

  const refreshToken = generateRefreshToken({ id: newUser.id });
  try {
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: newUser.id,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });
  } catch (tErr) {
    console.warn('[registerDeliveryPartner] Refresh token persistence warning:', tErr);
  }

  return {
    user: safeUser(newUser),
    partner: {
      ...newPartner,
      isActivated: false,
      verificationStatus: 'NOT_SUBMITTED',
    },
    kyc: newKyc,
    token: accessToken,
    accessToken,
    refreshToken,
  };
};

export const loginDeliveryPartner = async (data: { email: string; password: string }) => {
  if (!data.email || !data.password) {
    throw AppError.badRequest('Email and password are required.');
  }

  const user = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase().trim() },
  });

  if (!user) {
    throw AppError.unauthorized('Invalid email or password.');
  }

  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) {
    throw AppError.unauthorized('Invalid email or password.');
  }

  // Strictly resolve the authenticated user's own delivery partner profile
  const partner = await prisma.deliveryPartner.findUnique({
    where: { userId: user.id },
  });

  if (!partner) {
    throw AppError.forbidden('No delivery partner profile is registered for this account.');
  }

  const kyc = await prisma.kYC.findUnique({
    where: { userId: user.id },
    include: { documents: true },
  });

  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  });

  const refreshToken = generateRefreshToken({ id: user.id });
  try {
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });
  } catch (tErr) {
    console.warn('[loginDeliveryPartner] Refresh token persistence warning:', tErr);
  }

  const isApproved = user.status === 'ACTIVE' && (kyc as any)?.status === 'APPROVED';

  return {
    user: safeUser(user),
    partner: {
      ...partner,
      isActivated: isApproved,
      verificationStatus: (kyc as any)?.status || 'NOT_SUBMITTED',
    },
    kyc,
    token: accessToken,
    accessToken,
    refreshToken,
  };
};

// ============================================================================
// 2. KYC UPLOAD & ADMIN VERIFICATION
// ============================================================================
export const getKycDetails = async (userId: string) => {
  const kyc = await prisma.kYC.findUnique({
    where: { userId },
    include: { documents: true },
  });

  if (!kyc) {
    return {
      status: 'NOT_SUBMITTED',
      documents: [],
      panNumber: null,
      aadharNumber: null,
      rejectionReason: null,
    };
  }

  // Generate fresh, short-lived signed URLs for each private document
  const documentsWithSignedUrls = await Promise.all(
    (kyc.documents || []).map(async (doc: any) => {
      const signedUrl = await createSignedKycUrl(doc.objectKey);
      return {
        ...doc,
        fileUrl: signedUrl,
      };
    })
  );

  return {
    ...kyc,
    documents: documentsWithSignedUrls,
  };
};

export const uploadKycDocumentFile = async ({
  userId,
  documentType,
  file,
  idNumber,
  licenseNumber,
  vehicleType,
  vehicleNum,
}: {
  userId: string;
  documentType: string;
  file: Express.Multer.File;
  idNumber?: string;
  licenseNumber?: string;
  vehicleType?: string;
  vehicleNum?: string;
}) => {
  if (!file) {
    throw AppError.badRequest('Please select a file to upload.');
  }

  // Normalize document type
  const validTypes: string[] = [
    'AADHAAR_CARD',
    'PAN_CARD',
    'PASSPORT',
    'VOTER_ID',
    'DRIVING_LICENSE',
    'VEHICLE_RC',
    'PROFILE_PHOTO',
    'VEHICLE_PHOTO',
    'INSURANCE',
    'OTHER',
  ];

  const normalizedDocType = documentType.toUpperCase();
  const prismaDocType: KYCDocumentType = validTypes.includes(normalizedDocType)
    ? (normalizedDocType as KYCDocumentType)
    : KYCDocumentType.OTHER;

  // Check if KYC is locked under review
  const existingKyc = await prisma.kYC.findUnique({
    where: { userId },
    include: { documents: true },
  });

  if (existingKyc?.status === 'PENDING') {
    throw AppError.badRequest(
      'Your KYC is currently under review by compliance. Documents are locked until review is completed.'
    );
  }

  // 1. Process and securely store file (validates size, mime, magic bytes, uploads to Supabase)
  const savedFile = await saveKycDocumentFile({
    userId,
    documentType: prismaDocType,
    file,
  });

  // 2. Ensure KYC container exists
  const kyc = await prisma.kYC.upsert({
    where: { userId },
    create: {
      userId,
      status: 'NOT_SUBMITTED',
      panNumber: prismaDocType === 'PAN_CARD' ? idNumber : null,
      aadharNumber: prismaDocType === 'AADHAAR_CARD' ? idNumber : null,
    },
    update: {
      ...(prismaDocType === 'PAN_CARD' && idNumber && { panNumber: idNumber }),
      ...(prismaDocType === 'AADHAAR_CARD' && idNumber && { aadharNumber: idNumber }),
      ...(existingKyc?.status === 'REJECTED' && { status: 'NOT_SUBMITTED', rejectionReason: null }),
    },
  });

  // 3. Storage Cleanup: if a document of this type already exists, delete old private object
  const existingDoc = (existingKyc?.documents || []).find((d: any) => d.documentType === prismaDocType);
  if (existingDoc && existingDoc.objectKey && existingDoc.objectKey !== savedFile.objectKey) {
    await deleteKycDocumentFile(existingDoc.objectKey);
  }

  let doc;
  if (existingDoc) {
    doc = await prisma.kYCDocument.update({
      where: { id: existingDoc.id },
      data: {
        objectKey: savedFile.objectKey,
        fileUrl: savedFile.fileUrl,
        mimeType: savedFile.mimeType,
        fileSize: savedFile.fileSize,
        verificationStatus: 'PENDING',
        rejectionReason: null,
      },
    });
  } else {
    doc = await prisma.kYCDocument.create({
      data: {
        kycId: kyc.id,
        documentType: prismaDocType,
        objectKey: savedFile.objectKey,
        fileUrl: savedFile.fileUrl,
        mimeType: savedFile.mimeType,
        fileSize: savedFile.fileSize,
        verificationStatus: 'PENDING',
      },
    });
  }

  // 4. Persist Driving Licence number and Vehicle details on DeliveryPartner
  const cleanLicenseNum = licenseNumber?.trim() || (prismaDocType === 'DRIVING_LICENSE' && idNumber ? idNumber.trim() : undefined);
  const cleanVehicleNum = vehicleNum?.trim() || (prismaDocType === 'VEHICLE_RC' && idNumber ? idNumber.trim() : undefined);

  const existingPartner = await prisma.deliveryPartner.findUnique({ where: { userId } });
  if (existingPartner) {
    await prisma.deliveryPartner.update({
      where: { id: existingPartner.id },
      data: {
        ...(cleanLicenseNum && { licenseNumber: cleanLicenseNum.toUpperCase() }),
        ...(cleanVehicleNum && { vehicleNum: cleanVehicleNum.toUpperCase() }),
        ...(vehicleType && { vehicleType }),
        updatedAt: new Date(),
      },
    });
  }

  const updatedKyc = await getKycDetails(userId);

  return {
    document: doc,
    kyc: updatedKyc,
  };
};

export const removeKycDocument = async (userId: string, docId: string) => {
  const kyc = await prisma.kYC.findUnique({
    where: { userId },
    include: { documents: true },
  });

  if (!kyc) {
    throw AppError.notFound('KYC record not found.');
  }

  if (kyc.status === 'PENDING') {
    throw AppError.badRequest('Cannot remove documents while KYC is under review.');
  }

  const doc = kyc.documents.find((d: any) => d.id === docId);
  if (!doc) {
    throw AppError.notFound('KYC document not found.');
  }

  // Delete physical object from Supabase / local storage
  await deleteKycDocumentFile(doc.objectKey);

  await prisma.kYCDocument.delete({
    where: { id: docId },
  });

  return getKycDetails(userId);
};

export const getKycDocumentFileStream = async (user: any, docId: string) => {
  const doc = await prisma.kYCDocument.findUnique({
    where: { id: docId },
    include: { kyc: true },
  });

  if (!doc) {
    throw AppError.notFound('Document not found.');
  }

  // Strict Authorization: Only Admin or the owning partner
  const isAdmin = user.role === 'ADMIN' || (user.role as string) === 'SUPER_ADMIN';
  const isOwner = doc.kyc?.userId === user.id;

  if (!isAdmin && !isOwner) {
    throw AppError.forbidden('Forbidden: You do not have permission to access this private KYC document.');
  }

  const fileResult = await retrieveKycFileBuffer(doc.objectKey);
  if (!fileResult) {
    throw AppError.notFound('Document file data not found on secure storage.');
  }

  return {
    buffer: fileResult.buffer,
    mimeType: fileResult.mimeType || doc.mimeType || 'application/octet-stream',
    filename: doc.objectKey.split('/').pop() || 'kyc_document',
  };
};

/**
 * Validates and submits KYC for compliance review.
 * Enforces all 5 required document categories before allowing submission:
 * 1. Identity Proof (AADHAAR_CARD, PAN_CARD, PASSPORT, VOTER_ID)
 * 2. Driving Licence (DRIVING_LICENSE)
 * 3. Vehicle RC (VEHICLE_RC)
 * 4. Profile Photograph (PROFILE_PHOTO)
 * 5. Vehicle Photograph (VEHICLE_PHOTO)
 */
export const submitKycForReview = async (
  userId: string,
  extraData?: { licenseNumber?: string; vehicleNum?: string }
) => {
  const kyc = await prisma.kYC.findUnique({
    where: { userId },
    include: { documents: true },
  });

  if (!kyc || !kyc.documents || kyc.documents.length === 0) {
    throw AppError.badRequest('Please upload required KYC documents before submitting for review.');
  }

  const uploadedTypes = new Set(kyc.documents.map((d: any) => d.documentType));

  const identityTypes = ['AADHAAR_CARD', 'PAN_CARD', 'PASSPORT', 'VOTER_ID'];
  const hasIdentityProof = identityTypes.some((t) => uploadedTypes.has(t as any));
  const hasDrivingLicense = uploadedTypes.has(KYCDocumentType.DRIVING_LICENSE);
  const hasVehicleRc = uploadedTypes.has(KYCDocumentType.VEHICLE_RC);
  const hasProfilePhoto = uploadedTypes.has(KYCDocumentType.PROFILE_PHOTO);
  const hasVehiclePhoto = uploadedTypes.has(KYCDocumentType.VEHICLE_PHOTO);

  const missingCategories: string[] = [];
  if (!hasIdentityProof) missingCategories.push('Identity Proof (Aadhaar / PAN / Passport / Voter ID)');
  if (!hasDrivingLicense) missingCategories.push('Driving Licence');
  if (!hasVehicleRc) missingCategories.push('Vehicle RC');
  if (!hasProfilePhoto) missingCategories.push('Profile Photograph');
  if (!hasVehiclePhoto) missingCategories.push('Vehicle Photograph');

  if (missingCategories.length > 0) {
    throw AppError.badRequest(
      `Cannot submit KYC for review. Missing ${missingCategories.length} required document(s): ${missingCategories.join(', ')}. All 5 required documents must be uploaded.`
    );
  }

  // Update Driving Licence and Vehicle registration if supplied
  if (extraData?.licenseNumber || extraData?.vehicleNum) {
    const partner = await prisma.deliveryPartner.findUnique({ where: { userId } });
    if (partner) {
      await prisma.deliveryPartner.update({
        where: { id: partner.id },
        data: {
          ...(extraData.licenseNumber && { licenseNumber: extraData.licenseNumber.trim().toUpperCase() }),
          ...(extraData.vehicleNum && { vehicleNum: extraData.vehicleNum.trim().toUpperCase() }),
          updatedAt: new Date(),
        },
      });
    }
  }

  const updatedKyc = await prisma.kYC.update({
    where: { userId },
    data: {
      status: 'PENDING',
      rejectionReason: null,
      reviewedAt: null,
    },
  });

  // Also update associated documents to PENDING verification
  await prisma.kYCDocument.updateMany({
    where: { kycId: kyc.id },
    data: {
      verificationStatus: 'PENDING',
      rejectionReason: null,
    },
  });

  // Notify Admins
  try {
    const partner = await prisma.deliveryPartner.findUnique({
      where: { userId },
      include: { user: true },
    });
    const partnerName = partner?.user ? `${partner.user.firstName} ${partner.user.lastName}`.trim() : 'Delivery Partner';

    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        title: 'New Delivery KYC Submission',
        body: `${partnerName} has submitted all 5 required KYC documents for compliance review.`,
        channel: 'IN_APP',
        status: 'DELIVERED',
        data: {
          route: '/admin/delivery-partners',
          type: 'ADMIN_KYC_PENDING',
        },
      });
    }

    await createNotification({
      userId,
      title: 'KYC Submitted — Under Review',
      body: 'Your 5 required KYC documents have been submitted and are now queued for Admin verification.',
      channel: 'IN_APP',
      status: 'DELIVERED',
      data: {
        route: '/delivery/kyc',
        type: 'KYC_SUBMITTED',
      },
    });
  } catch (err) {
    console.warn('[DeliveryService] KYC notification warning:', err);
  }

  return getKycDetails(userId);
};

/**
 * Admin verification endpoint: approves or rejects delivery partner KYC.
 * Stores the actual Admin User ID in reviewedBy.
 */
export const adminVerifyKyc = async (
  userId: string,
  adminUserId: string,
  data: { status: 'APPROVED' | 'REJECTED'; rejectionReason?: string }
) => {
  if (!['APPROVED', 'REJECTED'].includes(data.status)) {
    throw AppError.badRequest('Verification status must be either APPROVED or REJECTED.');
  }

  if (data.status === 'REJECTED' && !data.rejectionReason?.trim()) {
    throw AppError.badRequest(
      'A specific rejection reason is required when rejecting KYC (e.g. "RC image is unreadable").'
    );
  }

  const isApproved = data.status === 'APPROVED';

  // Transaction-safe execution updating KYC, documents, User role status, and Partner duty
  const txResult = await prisma.$transaction(async (tx: any) => {
    // 1. Update KYC container with real Admin User ID
    const updatedKyc = await tx.kYC.update({
      where: { userId },
      data: {
        status: data.status,
        rejectionReason: isApproved ? null : data.rejectionReason || 'Documents did not meet compliance criteria.',
        reviewedAt: new Date(),
        reviewedBy: adminUserId || 'admin',
      },
      include: { documents: true },
    });

    // 2. Update associated documents
    await tx.kYCDocument.updateMany({
      where: { kycId: updatedKyc.id },
      data: {
        verificationStatus: data.status,
        rejectionReason: isApproved ? null : data.rejectionReason || 'Document rejected by compliance desk.',
      },
    });

    // 3. Update User account status (ACTIVE if approved, PENDING_VERIFICATION if rejected)
    await tx.user.update({
      where: { id: userId },
      data: {
        status: isApproved ? 'ACTIVE' : 'PENDING_VERIFICATION',
        updatedAt: new Date(),
      },
    });

    // 4. Update Partner: If rejected, force partner offline
    let partner = await tx.deliveryPartner.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (partner) {
      partner = await tx.deliveryPartner.update({
        where: { userId },
        data: {
          isOnline: isApproved ? partner.isOnline : false,
          updatedAt: new Date(),
        },
        include: { user: true },
      });
    }

    return {
      kyc: updatedKyc,
      partner: partner
        ? {
            ...partner,
            isActivated: isApproved,
            verificationStatus: data.status,
          }
        : null,
    };
  });

  // Notify delivery partner of KYC outcome
  try {
    await createNotification({
      userId,
      title: isApproved ? 'KYC Approved — Account Activated' : 'KYC Verification Rejected',
      body: isApproved
        ? 'Congratulations! Your delivery partner KYC has been approved. You are now authorized to go online and accept delivery jobs.'
        : `Your KYC submission was rejected: ${data.rejectionReason || 'Please review your uploaded documents.'}. You can replace rejected documents and resubmit.`,
      channel: 'IN_APP',
      status: 'DELIVERED',
      data: {
        route: '/delivery/kyc',
        type: isApproved ? 'KYC_APPROVED' : 'KYC_REJECTED',
        rejectionReason: data.rejectionReason || null,
      },
    });
  } catch (err) {
    console.warn('[DeliveryService] KYC notification warning:', err);
  }

  return txResult;
};

// ============================================================================
// 3. DUTY TOGGLE & PARTNER PROFILE
// ============================================================================
export const getDeliveryProfile = async (userId: string) => {
  const partner = await resolvePartnerByUser(userId);
  const kyc = await getKycDetails(partner.userId);

  return {
    ...partner,
    kyc,
  };
};

export const updateDeliveryProfile = async (userId: string, data: any) => {
  const partner = await resolvePartnerByUser(userId);

  const updated = await prisma.deliveryPartner.update({
    where: { id: partner.id },
    data: {
      ...(data.vehicleType && { vehicleType: data.vehicleType }),
      ...(data.vehicleNum && { vehicleNum: data.vehicleNum.toUpperCase() }),
      ...(data.licenseNumber && { licenseNumber: data.licenseNumber.toUpperCase() }),
      ...(data.currentLat !== undefined && { currentLat: Number(data.currentLat) }),
      ...(data.currentLng !== undefined && { currentLng: Number(data.currentLng) }),
    },
  });

  return updated;
};

export const toggleDutyStatus = async (userId: string, isOnline: boolean) => {
  const partner = await resolvePartnerByUser(userId);

  if (isOnline && !partner.isActivated) {
    throw AppError.badRequest(
      'Cannot go online. Your profile is pending KYC verification and Admin activation.'
    );
  }

  const updated = await prisma.deliveryPartner.update({
    where: { id: partner.id },
    data: { isOnline: Boolean(isOnline) },
  });

  return {
    ...updated,
    isActivated: partner.isActivated,
    verificationStatus: partner.verificationStatus,
  };
};

// ============================================================================
// ASSIGNMENT RELATIONS INCLUSION & FORMATTING
// ============================================================================
export const assignmentInclude = {
  order: {
    include: {
      address: true,
      user: {
        select: { id: true, firstName: true, lastName: true, phone: true, email: true },
      },
      items: {
        include: {
          product: { select: { id: true, name: true, partNumber: true } },
          shop: true,
        },
      },
      payment: true,
      difmRequest: {
        include: {
          shop: true,
        },
      },
    },
  },
  deliveryPartner: {
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, phone: true, email: true },
      },
    },
  },
  usedPartListing: {
    include: {
      seller: { select: { id: true, firstName: true, lastName: true, phone: true } },
      assignedShop: true,
    },
  },
};

export const formatDeliveryAssignment = (assignment: any) => {
  if (!assignment) return null;

  const order = assignment.order;
  const address = order?.address;
  const shop = order?.difmRequest?.shop || order?.items?.[0]?.shop;
  const isCod = order?.paymentMethod === 'CASH_ON_DELIVERY';
  const totalAmount = Number(order?.total || 0);

  const isReturn =
    assignment.type === 'RETURN_PICKUP' ||
    Boolean(assignment.returnRequestId) ||
    assignment.notes?.includes('[RETURN_PICKUP]');

  const isUsedPart =
    assignment.type === 'USED_PART_PICKUP' ||
    Boolean(assignment.usedPartListingId) ||
    assignment.notes?.includes('Used-Part') ||
    assignment.notes?.includes('USED_PART');

  // Derive type
  const type = isReturn
    ? 'RETURN_PICKUP'
    : isUsedPart
    ? 'USED_PART_PICKUP'
    : assignment.type || 'CUSTOMER_DELIVERY';

  // Derive order number
  const orderNumber =
    assignment.orderNumber ||
    order?.orderNumber ||
    assignment.notes?.match(/PS-\d+-\d+/)?.[0] ||
    `ORD-${assignment.id.slice(0, 8).toUpperCase()}`;

  // Derive Pickup Location (Real data only, no fabricated phone numbers or hub addresses)
  let pickupLocation: any;
  if (isReturn) {
    pickupLocation = {
      name: address?.fullName || (order?.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : 'Customer Doorstep (Return)'),
      address: address ? `${address.line1 || ''}, ${address.city || ''}, ${address.pincode || ''}` : 'Customer Pickup Address',
      contactPerson: address?.fullName || (order?.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : 'Customer'),
      phone: address?.phone || order?.user?.phone || null,
      lat: address?.latitude || null,
      lng: address?.longitude || null,
    };
  } else if (isUsedPart && assignment.usedPartListing) {
    const listing = assignment.usedPartListing;
    pickupLocation = {
      name: listing.seller ? `${listing.seller.firstName || ''} ${listing.seller.lastName || ''}`.trim() : 'Seller Doorstep',
      address: listing.pickupAddress || 'Seller pickup address',
      contactPerson: listing.seller ? `${listing.seller.firstName || ''} ${listing.seller.lastName || ''}`.trim() : 'Seller',
      phone: listing.seller?.phone || null,
      lat: null,
      lng: null,
    };
  } else {
    pickupLocation = {
      name: shop?.name || 'Partner Dispatch Hub',
      address: shop?.addressLine1 || shop?.address ? `${shop.addressLine1 || shop.address}, ${shop.city || ''}` : 'Pickup Location unavailable',
      contactPerson: shop?.ownerName || shop?.name || 'Hub Manager',
      phone: shop?.phone || null,
      lat: shop?.latitude || null,
      lng: shop?.longitude || null,
    };
  }

  // Derive Drop Destination
  let dropLocation: any;
  if (isReturn) {
    dropLocation = {
      name: 'PartNexa Returns Inspection Center',
      address: 'Central Logistics Hub',
      contactPerson: 'Returns Quality Officer',
      phone: null,
      lat: null,
      lng: null,
    };
  } else if (isUsedPart && assignment.usedPartListing?.assignedShop) {
    const garage = assignment.usedPartListing.assignedShop;
    dropLocation = {
      name: garage.name || 'Partner Garage for Bench Inspection',
      address: garage.addressLine1 || garage.address ? `${garage.addressLine1 || garage.address}, ${garage.city || ''}` : 'Partner Garage',
      contactPerson: garage.ownerName || 'Garage Inspection Desk',
      phone: garage.phone || null,
      lat: garage.latitude || null,
      lng: garage.longitude || null,
    };
  } else {
    dropLocation = {
      name: address?.fullName || (order?.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : 'Customer Destination'),
      address: address ? `${address.line1 || ''}, ${address.city || ''}, ${address.pincode || ''}` : 'Customer Delivery Address',
      contactPerson: address?.fullName || (order?.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : 'Customer'),
      phone: address?.phone || order?.user?.phone || null,
      lat: address?.latitude || null,
      lng: address?.longitude || null,
    };
  }

  // Derive COD collection status
  const codAmountToCollect = isCod ? totalAmount : 0;
  let codStatus = assignment.codStatus;
  if (!codStatus) {
    if (!isCod) {
      codStatus = 'NOT_APPLICABLE';
    } else if (assignment.notes?.includes('[COD_RECONCILED]')) {
      codStatus = 'RECONCILED';
    } else if (
      assignment.notes?.includes('[COD_COLLECTED]') ||
      assignment.status === 'DELIVERED' ||
      order?.paymentStatus === 'CAPTURED'
    ) {
      codStatus = 'COLLECTED';
    } else {
      codStatus = 'PENDING';
    }
  }

  const codAmountCollected = assignment.codAmountCollected
    ? Number(assignment.codAmountCollected)
    : codStatus === 'COLLECTED' || codStatus === 'RECONCILED'
    ? codAmountToCollect
    : 0;

  // Real telemetry or clear uncalculated indicators (never fabricate speeds/ETAs)
  const navigationInfo = {
    currentDistance: assignment.distanceKm ? `${assignment.distanceKm} km` : 'Distance not calculated',
    etaMinutes: assignment.status === 'DELIVERED' ? 0 : null,
    routeSummary:
      assignment.status === 'DELIVERED'
        ? 'Delivery completed'
        : `En route to ${dropLocation.name}`,
  };

  const items =
    assignment.items ||
    order?.items?.map((it: any) => ({
      id: it.productId,
      title: it.product?.name || 'Automotive Component',
      partNumber: it.product?.partNumber,
      quantity: it.quantity,
      price: Number(it.unitPrice),
    })) ||
    (assignment.usedPartListing
      ? [
          {
            id: assignment.usedPartListing.id,
            title: assignment.usedPartListing.title,
            condition: assignment.usedPartListing.condition,
            price: Number(assignment.usedPartListing.askingPrice),
          },
        ]
      : []);

  return {
    id: assignment.id,
    orderId: assignment.orderId,
    orderNumber,
    deliveryPartnerId: assignment.deliveryPartnerId,
    type,
    status: assignment.status,
    deliveryFee: Number(assignment.deliveryFee || 0),
    distanceKm: assignment.distanceKm ? Number(assignment.distanceKm) : null,
    paymentMethod: order?.paymentMethod || (isCod ? 'CASH_ON_DELIVERY' : 'ONLINE'),
    paymentStatus: order?.paymentStatus || 'PENDING',
    codAmountToCollect,
    codAmountCollected,
    codStatus,
    pickupLocation,
    dropLocation,
    navigationInfo,
    items,
    notes: assignment.notes,
    assignedAt: assignment.assignedAt,
    acceptedAt: assignment.acceptedAt,
    pickedUpAt: assignment.pickedUpAt,
    deliveredAt: assignment.deliveredAt,
    createdAt: assignment.createdAt,
    updatedAt: assignment.updatedAt,
  };
};

// ============================================================================
// 4. DELIVERY DASHBOARD & METRICS (SCALABLE PRISMA WHERE QUERIES)
// ============================================================================
export const getDeliveryDashboard = async (userId: string) => {
  const partner = await resolvePartnerByUser(userId);

  // Use targeted Prisma WHERE queries instead of fetching all assignments across the database
  const [activeTripsRaw, completedTripsRaw, availableJobsRaw, usedPartPickupsRaw, codUnreconciledRaw, kyc] =
    await Promise.all([
      // Partner's active trips
      prisma.deliveryAssignment.findMany({
        where: {
          deliveryPartnerId: partner.id,
          status: { in: ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'] },
        },
        include: assignmentInclude,
        orderBy: { updatedAt: 'desc' },
      }),
      // Partner's recent completed deliveries
      prisma.deliveryAssignment.findMany({
        where: {
          deliveryPartnerId: partner.id,
          status: 'DELIVERED',
        },
        include: assignmentInclude,
        orderBy: { deliveredAt: 'desc' },
        take: 10,
      }),
      // Available unclaimed jobs (only eligible if partner is activated and online)
      partner.isActivated && partner.isOnline
        ? prisma.deliveryAssignment.findMany({
            where: {
              status: 'ASSIGNED',
              OR: [{ deliveryPartnerId: null }, { deliveryPartnerId: partner.id }],
            },
            include: assignmentInclude,
            orderBy: { createdAt: 'desc' },
            take: 10,
          })
        : Promise.resolve([]),
      // Used part pickups for this partner
      prisma.deliveryAssignment.findMany({
        where: {
          deliveryPartnerId: partner.id,
          type: 'USED_PART_PICKUP',
        },
        include: assignmentInclude,
      }),
      // Unreconciled collected COD cash jobs
      prisma.deliveryAssignment.findMany({
        where: {
          deliveryPartnerId: partner.id,
          status: 'DELIVERED',
          OR: [{ codStatus: 'COLLECTED' }, { notes: { contains: '[COD_COLLECTED]' } }],
          NOT: { notes: { contains: '[COD_RECONCILED]' } },
        },
        include: assignmentInclude,
      }),
      // Partner KYC record
      prisma.kYC.findUnique({ where: { userId: partner.userId }, include: { documents: true } }),
    ]);

  const activeTrips = activeTripsRaw.map(formatDeliveryAssignment);
  const completedTrips = completedTripsRaw.map(formatDeliveryAssignment);
  const availableJobs = availableJobsRaw.map(formatDeliveryAssignment);
  const usedPartPickups = usedPartPickupsRaw.map(formatDeliveryAssignment);
  const codUnreconciledJobs = codUnreconciledRaw.map(formatDeliveryAssignment);

  const pendingCashInHand = codUnreconciledJobs.reduce(
    (sum: number, j: any) => sum + Number(j.codAmountCollected || 0),
    0
  );

  const totalTripEarnings = completedTrips.reduce(
    (sum: number, j: any) => sum + Number(j.deliveryFee || 0),
    0
  );

  return {
    partner: {
      id: partner.id,
      name: partner.user ? `${partner.user.firstName} ${partner.user.lastName}` : 'Rider',
      email: partner.user?.email,
      phone: partner.user?.phone,
      vehicleType: partner.vehicleType,
      vehicleNum: partner.vehicleNum,
      isOnline: partner.isOnline,
      isActivated: partner.isActivated,
      verificationStatus: partner.verificationStatus,
      rating: partner.rating,
      totalDeliveries: partner.totalDeliveries,
      cashInHand: pendingCashInHand,
    },
    metrics: {
      availableJobsCount: availableJobs.length,
      activeTripsCount: activeTrips.length,
      completedTripsCount: completedTrips.length,
      usedPartPickupsCount: usedPartPickups.length,
      pendingCashInHand,
      totalTripEarnings,
      unreconciledCodJobsCount: codUnreconciledJobs.length,
    },
    activeTrips,
    availableJobs: availableJobs.slice(0, 5),
    recentCompleted: completedTrips.slice(0, 5),
    unreconciledCodJobs: codUnreconciledJobs,
    kycStatus: kyc?.status || 'NOT_SUBMITTED',
  };
};

// ============================================================================
// 5. JOBS & STRICT ISOLATION ACCESS CONTROL
// ============================================================================
export const listAvailableJobs = async (userId: string) => {
  const partner = await resolvePartnerByUser(userId);

  // Unapproved or offline partners cannot view available jobs
  if (!partner.isActivated || !partner.isOnline) {
    return [];
  }

  const rawAssignments = await prisma.deliveryAssignment.findMany({
    where: {
      status: 'ASSIGNED',
      OR: [{ deliveryPartnerId: null }, { deliveryPartnerId: partner.id }],
    },
    include: assignmentInclude,
    orderBy: { createdAt: 'desc' },
  });

  return rawAssignments.map(formatDeliveryAssignment);
};

export const listMyJobs = async (userId: string, filter?: { status?: string; type?: string }) => {
  const partner = await resolvePartnerByUser(userId);

  const whereClause: any = { deliveryPartnerId: partner.id };
  if (filter?.status) {
    if (filter.status === 'ACTIVE') {
      whereClause.status = { in: ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'] };
    } else {
      whereClause.status = filter.status;
    }
  }
  if (filter?.type) {
    whereClause.type = filter.type;
  }

  const rawAssignments = await prisma.deliveryAssignment.findMany({
    where: whereClause,
    include: assignmentInclude,
    orderBy: { createdAt: 'desc' },
  });

  return rawAssignments.map(formatDeliveryAssignment);
};

export const getJobById = async (userId: string, jobId: string) => {
  const partner = await resolvePartnerByUser(userId);

  const rawAssignment = await prisma.deliveryAssignment.findUnique({
    where: { id: jobId },
    include: assignmentInclude,
  });

  if (!rawAssignment) {
    throw AppError.notFound('Delivery job not found.');
  }

  // STRICT ACCESS CONTROL: Only assigned partner or open unclaimed job
  if (rawAssignment.deliveryPartnerId && rawAssignment.deliveryPartnerId !== partner.id) {
    throw AppError.forbidden("Forbidden: You do not have permission to access another delivery partner's job.");
  }

  return formatDeliveryAssignment(rawAssignment);
};

export const acceptJob = async (userId: string, jobId: string) => {
  const partner = await resolvePartnerByUser(userId);

  if (!partner.isActivated) {
    throw AppError.badRequest('Cannot accept jobs. Your account must be KYC verified and activated by Admin.');
  }
  if (!partner.isOnline) {
    throw AppError.badRequest('You must be online (On Duty) to accept delivery jobs.');
  }

  const assignment = await prisma.deliveryAssignment.findUnique({
    where: { id: jobId },
  });

  if (!assignment) {
    throw AppError.notFound('Delivery job not found.');
  }

  if (assignment.deliveryPartnerId && assignment.deliveryPartnerId !== partner.id) {
    throw AppError.forbidden('Forbidden: This job has already been claimed by another delivery partner.');
  }

  if (assignment.status !== 'ASSIGNED') {
    throw AppError.badRequest(`Job cannot be accepted from current status: ${assignment.status}`);
  }

  await prisma.deliveryAssignment.update({
    where: { id: jobId },
    data: {
      deliveryPartnerId: partner.id,
      status: DeliveryAssignmentStatus.ACCEPTED,
      acceptedAt: new Date(),
    },
  });

  if (assignment.orderId) {
    await prisma.orderTracking.create({
      data: {
        orderId: assignment.orderId,
        status: OrderStatus.PROCESSING,
        message: `Delivery partner ${partner.user ? partner.user.firstName : 'Rider'} has accepted the delivery assignment.`,
      },
    });
  }

  const updatedRaw = await prisma.deliveryAssignment.findUnique({
    where: { id: jobId },
    include: assignmentInclude,
  });

  return formatDeliveryAssignment(updatedRaw);
};

/**
 * Strict Job Status State Machine:
 * Enforces: ASSIGNED -> ACCEPTED -> PICKED_UP -> IN_TRANSIT -> DELIVERED
 * Disallows invalid jumps (e.g. ACCEPTED -> DELIVERED)
 * Idempotently protects against repeated DELIVERED -> DELIVERED increments
 */
export const updateJobStatus = async (
  userId: string,
  jobId: string,
  status: 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED',
  notes?: string
) => {
  const partner = await resolvePartnerByUser(userId);

  const assignment = await prisma.deliveryAssignment.findUnique({
    where: { id: jobId },
  });

  if (!assignment) {
    throw AppError.notFound('Delivery job not found.');
  }

  // STRICT ACCESS CONTROL
  if (assignment.deliveryPartnerId !== partner.id) {
    throw AppError.forbidden('Forbidden: You cannot modify a job assigned to another delivery partner.');
  }

  // Idempotency check: if already DELIVERED
  if (assignment.status === 'DELIVERED') {
    if (status === 'DELIVERED') {
      return formatDeliveryAssignment(assignment);
    }
    throw AppError.badRequest('Delivery job is already completed and marked DELIVERED.');
  }

  // State Machine Validation:
  const allowedTransitions: Record<string, string[]> = {
    ASSIGNED: ['ACCEPTED'],
    ACCEPTED: ['PICKED_UP'],
    PICKED_UP: ['IN_TRANSIT'],
    IN_TRANSIT: ['DELIVERED'],
  };

  const allowedNext = allowedTransitions[assignment.status] || [];
  if (!allowedNext.includes(status)) {
    throw AppError.badRequest(
      `Invalid status transition from ${assignment.status} to ${status}. Allowed sequence: ACCEPTED -> PICKED_UP -> IN_TRANSIT -> DELIVERED.`
    );
  }

  const updatePayload: any = {
    status,
    ...(notes && { notes }),
    updatedAt: new Date(),
  };

  if (status === 'PICKED_UP') {
    updatePayload.pickedUpAt = new Date();
  } else if (status === 'DELIVERED') {
    updatePayload.deliveredAt = new Date();
    // Increment total deliveries for partner exactly once
    await prisma.deliveryPartner.update({
      where: { id: partner.id },
      data: { totalDeliveries: (partner.totalDeliveries || 0) + 1 },
    });
  }

  await prisma.deliveryAssignment.update({
    where: { id: jobId },
    data: updatePayload,
  });

  // Handle Reverse Return Pickups
  const isReturnJob =
    assignment.type === 'RETURN_PICKUP' ||
    Boolean(assignment.returnRequestId) ||
    assignment.notes?.includes('[RETURN_PICKUP]');

  if (isReturnJob) {
    const returnReqId = assignment.returnRequestId;
    const returnReq = await prisma.returnRequest.findFirst({
      where: returnReqId ? { id: returnReqId } : { orderId: assignment.orderId! },
      include: { order: true, orderItem: { include: { product: true } } },
    });

    if (returnReq) {
      if (status === 'PICKED_UP') {
        await prisma.returnRequest.update({
          where: { id: returnReq.id },
          data: { status: 'PICKED_UP', pickupAt: new Date() },
        });

        await prisma.orderTracking.create({
          data: {
            orderId: returnReq.orderId,
            status: OrderStatus.RETURN_REQUESTED,
            message: `Return item (${returnReq.orderItem?.product?.name || 'Spare part'}) picked up from customer. En route to hub.`,
          },
        });

        await createNotification({
          userId: returnReq.userId,
          title: 'Return Item Picked Up',
          body: `Our delivery partner has picked up your returned spare part for Order #${returnReq.order?.orderNumber}. It is on its way to our inspection warehouse.`,
          channel: 'IN_APP',
          status: 'DELIVERED',
          data: {
            route: `/customer/orders/${returnReq.orderId}`,
            orderId: returnReq.orderId,
            returnRequestId: returnReq.id,
            type: 'PICKED_UP',
          },
        });
      } else if (status === 'DELIVERED') {
        await prisma.returnRequest.update({
          where: { id: returnReq.id },
          data: { status: 'RECEIVED', receivedAt: new Date() },
        });

        await prisma.orderTracking.create({
          data: {
            orderId: returnReq.orderId,
            status: OrderStatus.RETURN_REQUESTED,
            message: `Return item safely received at PartNexa Central Inspection Hub. Queued for quality evaluation.`,
          },
        });

        await createNotification({
          userId: returnReq.userId,
          title: 'Return Item Received at Hub',
          body: `Your returned spare part for Order #${returnReq.order?.orderNumber} has arrived at our warehouse and is queued for quality inspection.`,
          channel: 'IN_APP',
          status: 'DELIVERED',
          data: {
            route: `/customer/orders/${returnReq.orderId}`,
            orderId: returnReq.orderId,
            returnRequestId: returnReq.id,
            type: 'ITEM_RECEIVED',
          },
        });
      }
    }
  } else if (assignment.orderId) {
    if (status === 'DELIVERED') {
      const order = await prisma.order.findUnique({ where: { id: assignment.orderId } });
      const isCod = order?.paymentMethod === 'CASH_ON_DELIVERY';

      await prisma.order.update({
        where: { id: assignment.orderId },
        data: {
          status: OrderStatus.DELIVERED,
          deliveredAt: new Date(),
          ...(isCod && { paymentStatus: PaymentStatus.CAPTURED }),
        },
      });

      if (isCod) {
        try {
          await prisma.payment.updateMany({
            where: { orderId: assignment.orderId },
            data: { status: PaymentStatus.CAPTURED, codCollectedAt: new Date() },
          });
        } catch {}
      }

      await prisma.orderTracking.create({
        data: {
          orderId: assignment.orderId,
          status: OrderStatus.DELIVERED,
          message: 'Package successfully delivered to customer doorstep by delivery partner.',
        },
      });

      if (order?.userId) {
        try {
          await createNotification({
            userId: order.userId,
            title: 'Order Delivered',
            body: `Your Order #${order.orderNumber} has been delivered successfully. Thank you for shopping with PartNexa!`,
            channel: 'IN_APP',
            status: 'DELIVERED',
            data: {
              route: `/customer/orders/${order.id}`,
              orderId: order.id,
              type: 'ORDER_DELIVERED',
            },
          });
        } catch (err) {
          console.warn('[DeliveryService] Delivery notification error:', err);
        }
      }
    } else if (status === 'PICKED_UP') {
      const order = await prisma.order.findUnique({ where: { id: assignment.orderId } });
      await prisma.order.update({
        where: { id: assignment.orderId },
        data: { status: OrderStatus.SHIPPED },
      });
      await prisma.orderTracking.create({
        data: {
          orderId: assignment.orderId,
          status: OrderStatus.SHIPPED,
          message: 'Package picked up by delivery partner and is en route for doorstep delivery.',
        },
      });
      try {
        await prisma.shopDelivery.updateMany({
          where: { orderId: assignment.orderId },
          data: { status: 'OUT_FOR_DELIVERY' },
        });
      } catch {}
      if (order?.userId) {
        try {
          await createNotification({
            userId: order.userId,
            title: 'Out for Delivery',
            body: `Your Order #${order.orderNumber} is on the way with our delivery partner.`,
            channel: 'IN_APP',
            status: 'DELIVERED',
            data: {
              route: `/customer/orders/${order.id}`,
              orderId: order.id,
              type: 'ORDER_OUT_FOR_DELIVERY',
            },
          });
        } catch {}
      }
    } else if (status === 'IN_TRANSIT') {
      const order = await prisma.order.findUnique({ where: { id: assignment.orderId } });
      await prisma.order.update({
        where: { id: assignment.orderId },
        data: { status: OrderStatus.OUT_FOR_DELIVERY },
      });
      await prisma.orderTracking.create({
        data: {
          orderId: assignment.orderId,
          status: OrderStatus.OUT_FOR_DELIVERY,
          message: 'Package is out for doorstep delivery. Approaching customer destination.',
        },
      });
      if (order?.userId) {
        try {
          await createNotification({
            userId: order.userId,
            title: 'Out for Delivery',
            body: `Your Order #${order.orderNumber} is approaching your location.`,
            channel: 'IN_APP',
            status: 'DELIVERED',
            data: {
              route: `/customer/orders/${order.id}`,
              orderId: order.id,
              type: 'ORDER_OUT_FOR_DELIVERY',
            },
          });
        } catch {}
      }
    }
  }

  const updatedRaw = await prisma.deliveryAssignment.findUnique({
    where: { id: jobId },
    include: assignmentInclude,
  });

  return formatDeliveryAssignment(updatedRaw);
};

// ============================================================================
// 6. CASH ON DELIVERY (COD) & RECONCILIATION
// ============================================================================
export const recordCodCollection = async (userId: string, jobId: string, amount?: number) => {
  const partner = await resolvePartnerByUser(userId);

  const assignment = await prisma.deliveryAssignment.findUnique({
    where: { id: jobId },
    include: { order: true },
  });

  if (!assignment) {
    throw AppError.notFound('Delivery job not found.');
  }

  // STRICT ACCESS CONTROL
  if (assignment.deliveryPartnerId !== partner.id) {
    throw AppError.forbidden("Forbidden: You cannot collect cash for another delivery partner's job.");
  }

  // Verify COD applicability
  if (assignment.order?.paymentMethod !== 'CASH_ON_DELIVERY') {
    throw AppError.badRequest('This job does not require Cash on Delivery collection.');
  }

  const expectedAmount = Number(assignment.order?.total || 0);

  // Validate exact amount matches order total if amount was supplied by frontend
  if (amount !== undefined && amount !== null) {
    const submittedAmount = Number(amount);
    if (Math.abs(submittedAmount - expectedAmount) > 0.01) {
      throw AppError.badRequest(
        `Submitted COD amount ₹${submittedAmount} does not match order outstanding COD amount ₹${expectedAmount}.`
      );
    }
  }

  // Idempotency: If COD is already collected, return current state without double-counting
  if (assignment.codStatus === 'COLLECTED' || assignment.notes?.includes('[COD_COLLECTED]')) {
    return formatDeliveryAssignment(assignment);
  }

  // Update assignment notes and COD fields
  const currentNotes = assignment.notes || '';
  const updatedNotes = currentNotes.includes('[COD_COLLECTED]')
    ? currentNotes
    : `${currentNotes} [COD_COLLECTED: ₹${expectedAmount}]`.trim();

  await prisma.deliveryAssignment.update({
    where: { id: jobId },
    data: {
      codStatus: 'COLLECTED',
      codAmountCollected: expectedAmount,
      notes: updatedNotes,
      updatedAt: new Date(),
    },
  });

  // Mark Customer Order payment as CAPTURED
  if (assignment.orderId) {
    try {
      await prisma.order.update({
        where: { id: assignment.orderId },
        data: { paymentStatus: PaymentStatus.CAPTURED },
      });
    } catch (ordErr) {
      console.warn('[recordCodCollection] Order status update notice:', ordErr);
    }

    try {
      if (typeof (prisma.payment as any)?.updateMany === 'function') {
        await prisma.payment.updateMany({
          where: { orderId: assignment.orderId },
          data: {
            status: PaymentStatus.CAPTURED,
            codCollectedAt: new Date(),
          },
        });
      } else if (typeof (prisma.payment as any)?.findFirst === 'function') {
        const p = await prisma.payment.findFirst({ where: { orderId: assignment.orderId } });
        if (p) {
          await prisma.payment.update({
            where: { id: p.id },
            data: { status: PaymentStatus.CAPTURED, codCollectedAt: new Date() },
          });
        }
      }
    } catch (payErr) {
      console.warn('[recordCodCollection] Payment record update notice:', payErr);
    }
  }

  const updatedRaw = await prisma.deliveryAssignment.findUnique({
    where: { id: jobId },
    include: assignmentInclude,
  });

  return formatDeliveryAssignment(updatedRaw);
};

export const reconcileCodCash = async (
  userId: string,
  data: {
    amount?: number;
    depositAmount?: number;
    jobIds?: string[];
    depositReference?: string;
    hubLocation?: string;
    depositCenter?: string;
    depositMethod?: string;
    receivingOfficer?: string;
    receivedBy?: string;
    notes?: string;
  }
) => {
  const partner = await resolvePartnerByUser(userId);

  // Retrieve collected, unreconciled jobs
  let collectedJobs = await prisma.deliveryAssignment.findMany({
    where: {
      deliveryPartnerId: partner.id,
      status: 'DELIVERED',
      OR: [{ codStatus: 'COLLECTED' }, { notes: { contains: '[COD_COLLECTED]' } }],
      NOT: { notes: { contains: '[COD_RECONCILED]' } },
    },
    include: assignmentInclude,
  });

  // If specific jobs were passed, reconcile only those jobs
  if (data.jobIds && data.jobIds.length > 0) {
    const selectedIds = new Set(data.jobIds);
    collectedJobs = collectedJobs.filter((j: any) => selectedIds.has(j.id));
  }

  if (collectedJobs.length === 0) {
    throw AppError.badRequest('No unreconciled collected COD jobs found to settle.');
  }

  const totalCalculated = collectedJobs.reduce((sum: number, j: any) => {
    const jobCollected = j.codAmountCollected ? Number(j.codAmountCollected) : Number(j.order?.total || 0);
    return sum + jobCollected;
  }, 0);

  // Strict Accounting: If deposit amount is specified, verify it matches the total of selected jobs
  const specifiedAmount = data.depositAmount !== undefined ? data.depositAmount : data.amount;
  if (specifiedAmount !== undefined && specifiedAmount !== null) {
    const depositAmount = Number(specifiedAmount);
    if (Math.abs(depositAmount - totalCalculated) > 0.01) {
      throw AppError.badRequest(
        `Deposit amount ₹${depositAmount} does not match total outstanding cash for the selected jobs (₹${totalCalculated}). Complete settlement is required.`
      );
    }
  }

  const settleAmount = specifiedAmount !== undefined ? Number(specifiedAmount) : totalCalculated;

  // Create authoritative reconciliation record
  const recon = await prisma.cODReconciliation.create({
    data: {
      deliveryPartnerId: partner.id,
      totalAmount: settleAmount,
      orderCount: collectedJobs.length,
      status: 'RECONCILED',
      depositMethod: data.depositMethod || 'CASH_AT_HUB',
      depositReference: data.depositReference || `HUB-DEP-${Date.now().toString().slice(-6)}`,
      hubLocation: data.depositCenter || data.hubLocation || 'Authorized Logistics Hub',
      receivedBy: data.receivingOfficer || data.receivedBy || 'Authorized Hub Cashier',
      notes: data.notes || `Reconciliation settled for ${collectedJobs.length} delivery jobs.`,
    },
  });

  // Tag assignments as RECONCILED in both codStatus and notes
  for (const job of collectedJobs) {
    const curNotes = job.notes || '';
    await prisma.deliveryAssignment.update({
      where: { id: job.id },
      data: {
        codStatus: 'RECONCILED',
        notes: `${curNotes} [COD_RECONCILED]`.trim(),
        updatedAt: new Date(),
      },
    });
  }

  return {
    reconciliation: recon,
    depositAmount: settleAmount,
    settledJobsCount: collectedJobs.length,
    settledAmount: settleAmount,
  };
};

export const listReconciliations = async (userId: string) => {
  const partner = await resolvePartnerByUser(userId);
  return prisma.cODReconciliation.findMany({
    where: { deliveryPartnerId: partner.id },
    orderBy: { createdAt: 'desc' },
  });
};

// ============================================================================
// 7. USED-PART DOORSTEP PICKUP & CHAIN OF CUSTODY (GARAGE-FIRST WORKFLOW)
// ============================================================================
export const performUsedPartVerification = async (
  userId: string,
  jobId: string,
  data: {
    conditionGrade?: string;
    inspectionChecklist?: Record<string, boolean>;
    photos?: string[];
    result: 'APPROVED' | 'REJECTED';
    notes?: string;
  }
) => {
  const partner = await resolvePartnerByUser(userId);

  const rawAssignment = await prisma.deliveryAssignment.findUnique({
    where: { id: jobId },
    include: assignmentInclude,
  });

  if (!rawAssignment) {
    throw AppError.notFound('Delivery job not found.');
  }

  // STRICT ACCESS CONTROL
  if (rawAssignment.deliveryPartnerId !== partner.id) {
    throw AppError.forbidden("Forbidden: You cannot perform inspection on another partner's job.");
  }

  const isApproved = data.result === 'APPROVED';

  // In the Garage-First workflow: Delivery Partner only handles physical pickup and chain of custody
  // Final certified rating and valuation belong to the Workshop / Partner Garage
  if (rawAssignment.usedPartListingId) {
    try {
      await prisma.usedPartListing.update({
        where: { id: rawAssignment.usedPartListingId },
        data: {
          status: isApproved ? UsedPartStatus.PENDING_VERIFICATION : UsedPartStatus.REJECTED,
          updatedAt: new Date(),
        },
      });
    } catch (upErr) {
      console.warn('[UsedPartPickup] Listing update notice:', upErr);
    }
  }

  // Update assignment status
  const updatedAssignment = await prisma.deliveryAssignment.update({
    where: { id: jobId },
    data: {
      status: isApproved ? DeliveryAssignmentStatus.PICKED_UP : DeliveryAssignmentStatus.FAILED,
      pickedUpAt: isApproved ? new Date() : null,
      notes: `${rawAssignment.notes || ''} [Doorstep Handover: ${isApproved ? 'VERIFIED' : 'REJECTED'}${data.notes ? ` - ${data.notes}` : ''}]`.trim(),
      updatedAt: new Date(),
    },
    include: assignmentInclude,
  });

  return {
    assignment: formatDeliveryAssignment(updatedAssignment),
    verificationResult: data.result,
    custodyTransferred: isApproved,
    destination: 'Partner Garage for Bench Testing & Final Valuation',
  };
};
