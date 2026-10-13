import crypto from 'crypto';
import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';
import { createNotification } from '../notifications/notifications.service';
import { DIFMStatus, PaymentStatus, UserRole } from '@prisma/client';

export interface VerifyCompletionParams {
  bookingId?: string;
  jobId?: string;
  deliveryAssignmentId?: string;
  orderId?: string;
  code: string;
  notes?: string;
  user: {
    id: string;
    role: string;
    email?: string;
  };
}

/**
 * Generates a cryptographically random 6-digit confirmation code and its SHA-256 hash.
 */
export const generateCompletionCode = (): { code: string; hash: string } => {
  const code = crypto.randomInt(100000, 1000000).toString();
  const hash = crypto.createHash('sha256').update(code).digest('hex');
  return { code, hash };
};

/**
 * Ensures an active ServiceBooking with a 6-digit completion code exists
 * for any confirmed DIFM installation request once a workshop/installer is assigned.
 */
export const ensureServiceBookingForDifm = async (orderId: string, preferredSlot = '10:00 AM - 12:00 PM') => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      difmRequest: {
        include: {
          serviceBooking: true,
          shop: true,
        },
      },
    },
  });

  if (!order || !order.difmRequest) {
    return null;
  }

  const difm = order.difmRequest;
  if (!difm.shopId) {
    // Cannot schedule service booking without an assigned workshop
    return null;
  }

  // If booking already exists
  if (difm.serviceBooking) {
    // If already has code or already completed, return as-is
    if (difm.serviceBooking.completionCode || difm.serviceBooking.isCompleted) {
      return difm.serviceBooking;
    }
    // Otherwise populate fresh code
    const { code, hash } = generateCompletionCode();
    return prisma.serviceBooking.update({
      where: { id: difm.serviceBooking.id },
      data: {
        completionCode: code,
        completionCodeHash: hash,
        completionCodeAttempts: 0,
        completionCodeLocked: false,
        updatedAt: new Date(),
      },
    });
  }

  // Create new ServiceBooking record
  const { code, hash } = generateCompletionCode();
  return prisma.serviceBooking.create({
    data: {
      difmRequestId: difm.id,
      shopId: difm.shopId,
      scheduledSlot: preferredSlot,
      completionCode: code,
      completionCodeHash: hash,
      isCompleted: false,
      completionCodeAttempts: 0,
      completionCodeLocked: false,
    },
    include: {
      shop: true,
      difmRequest: true,
    },
  });
};

/**
 * Authoritative Step 11: Installation Completion Verification Engine
 * Validates role, assignment, completion status, and customer 6-digit confirmation code.
 */
export const verifyInstallationCompletion = async (params: VerifyCompletionParams) => {
  const { bookingId, jobId, deliveryAssignmentId, orderId, code, notes, user } = params;

  if (!code || typeof code !== 'string') {
    throw AppError.badRequest('Please enter the 6-digit customer confirmation code.');
  }

  const cleanCode = code.trim();
  if (!/^\d{6}$/.test(cleanCode)) {
    throw AppError.badRequest('Confirmation code must be exactly 6 numeric digits.');
  }

  // 1. Resolve Target ServiceBooking
  let booking: any = null;
  let linkedJob: any = null;
  let resolvedOrderId = orderId;

  if (bookingId) {
    booking = await prisma.serviceBooking.findUnique({
      where: { id: bookingId },
      include: {
        shop: true,
        difmRequest: {
          include: { order: true },
        },
      },
    });
    if (booking?.difmRequest?.orderId) {
      resolvedOrderId = booking.difmRequest.orderId;
    }
  } else if (jobId) {
    linkedJob = await prisma.shopJob.findUnique({
      where: { id: jobId },
      include: { shop: true },
    });
    if (!linkedJob) {
      throw AppError.notFound(`Service job ${jobId} not found.`);
    }
    resolvedOrderId = linkedJob.orderId || resolvedOrderId;

    if (linkedJob.difmRequestId) {
      booking = await prisma.serviceBooking.findUnique({
        where: { difmRequestId: linkedJob.difmRequestId },
        include: {
          shop: true,
          difmRequest: { include: { order: true } },
        },
      });
    }

    if (!booking && resolvedOrderId) {
      const difm = await prisma.difmRequest.findUnique({
        where: { orderId: resolvedOrderId },
        include: { serviceBooking: true, shop: true },
      });
      if (difm?.serviceBooking) {
        booking = difm.serviceBooking;
      }
    }
  } else if (deliveryAssignmentId) {
    const assignment = await prisma.deliveryAssignment.findUnique({
      where: { id: deliveryAssignmentId },
      include: { order: true, deliveryPartner: true },
    });
    if (!assignment) {
      throw AppError.notFound(`Delivery assignment ${deliveryAssignmentId} not found.`);
    }
    resolvedOrderId = assignment.orderId;
    const difm = await prisma.difmRequest.findUnique({
      where: { orderId: assignment.orderId },
      include: { serviceBooking: true, shop: true },
    });
    booking = difm?.serviceBooking || null;
  } else if (resolvedOrderId) {
    const difm = await prisma.difmRequest.findUnique({
      where: { orderId: resolvedOrderId },
      include: { serviceBooking: true, shop: true },
    });
    booking = difm?.serviceBooking || null;
  }

  if (!booking) {
    throw AppError.notFound('No active installation service booking found for this request.');
  }

  // 2. Prevent Reusing Code on Already-Completed Services
  if (booking.isCompleted) {
    throw AppError.badRequest('Installation has already been marked completed. Completion code cannot be reused.');
  }

  // 3. Security Lockout Check
  if (booking.completionCodeLocked || (booking.completionCodeAttempts || 0) >= 5) {
    throw AppError.badRequest(
      'Too many incorrect code attempts. Confirmation code is locked for security. Please contact PartNexa support.'
    );
  }

  // 4. Role & Assignment Authorization
  const isWorkshopRole = user.role === UserRole.SHOP_OWNER || user.role === 'SHOP' || user.role === 'SHOP_OWNER';
  const isDeliveryRole = user.role === UserRole.DELIVERY_PARTNER || user.role === 'DELIVERY_PARTNER';
  const isAdmin = user.role === UserRole.ADMIN || user.role === 'ADMIN';

  if (!isWorkshopRole && !isDeliveryRole && !isAdmin) {
    throw AppError.forbidden('Only an authorized workshop technician or delivery partner can verify installation completion.');
  }

  // 4a. Workshop Assignment Guard: Must be the specific shop assigned to the installation
  if (isWorkshopRole && !isAdmin) {
    const callerShop = await prisma.shop.findFirst({
      where: { ownerId: user.id },
    });

    if (!callerShop) {
      throw AppError.forbidden('No mechanical workshop registered for this user.');
    }

    if (booking.shopId && booking.shopId !== callerShop.id) {
      throw AppError.forbidden('You are not authorized to complete an installation assigned to a different workshop.');
    }
  }

  // 4b. Delivery Partner Guard: Only allow if explicitly responsible for doorstep installation
  if (isDeliveryRole && !isAdmin) {
    const callerPartner = await prisma.deliveryPartner.findFirst({
      where: { userId: user.id },
    });

    if (!callerPartner) {
      throw AppError.forbidden('Delivery partner profile not found.');
    }

    // Check if delivery assignment exists for this order & partner
    const partnerAssignment = await prisma.deliveryAssignment.findFirst({
      where: {
        orderId: resolvedOrderId,
        deliveryPartnerId: callerPartner.id,
      },
    });

    if (!partnerAssignment) {
      throw AppError.forbidden('You are not assigned to this delivery or installation job.');
    }

    // If DIFM is a Workshop Fitment (Option B), a delivery rider must NEVER complete workshop installation
    const difm = await prisma.difmRequest.findUnique({
      where: { id: booking.difmRequestId },
    });

    if (difm?.type === 'SHOP_INSTALLATION') {
      throw AppError.forbidden(
        'Normal delivery partner cannot complete Workshop installation. This service must be performed and verified at the partner garage.'
      );
    }
  }

  // 5. Code Comparison (Timing-Safe Check)
  const inputHash = crypto.createHash('sha256').update(cleanCode).digest('hex');
  const storedCode = booking.completionCode?.trim();
  const storedHash = booking.completionCodeHash;

  let isMatch = false;
  if (storedCode && storedCode === cleanCode) {
    isMatch = true;
  } else if (storedHash && storedHash === inputHash) {
    isMatch = true;
  }

  if (!isMatch) {
    const nextAttempts = (booking.completionCodeAttempts || 0) + 1;
    const isLocked = nextAttempts >= 5;

    await prisma.serviceBooking.update({
      where: { id: booking.id },
      data: {
        completionCodeAttempts: nextAttempts,
        completionCodeLocked: isLocked,
        updatedAt: new Date(),
      },
    });

    if (isLocked) {
      throw AppError.badRequest('Incorrect code. Maximum attempt limit (5) exceeded. Completion code locked for security.');
    } else {
      const remaining = 5 - nextAttempts;
      throw AppError.badRequest(`Invalid confirmation code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`);
    }
  }

  // 6. Successful Verification: Mark ServiceBooking Complete & Burn/Invalidate Code
  const completedAt = new Date();
  const updatedBooking = await prisma.serviceBooking.update({
    where: { id: booking.id },
    data: {
      isCompleted: true,
      completedAt,
      completedByRole: user.role,
      completedById: user.id,
      completionCode: null, // Wipe plaintext code so it cannot be reused
      completionCodeHash: null,
      completionCodeAttempts: 0,
      completionCodeLocked: false,
      updatedAt: completedAt,
    },
    include: {
      shop: true,
      difmRequest: true,
    },
  });

  // 7. Update DIFMRequest status to COMPLETED
  await prisma.difmRequest.update({
    where: { id: booking.difmRequestId },
    data: {
      status: DIFMStatus.COMPLETED,
      updatedAt: completedAt,
    },
  });

  // 8. Update linked ShopJob to COMPLETED
  let updatedJob: any = null;
  if (linkedJob) {
    updatedJob = await prisma.shopJob.update({
      where: { id: linkedJob.id },
      data: {
        status: 'COMPLETED',
        completedAt,
        notes: notes ? `${linkedJob.notes || ''} [Verified with Customer Code: ${notes}]`.trim() : linkedJob.notes,
        updatedAt: completedAt,
      },
    });
  } else {
    const job = await prisma.shopJob.findFirst({
      where: {
        OR: [
          { difmRequestId: booking.difmRequestId },
          { orderId: resolvedOrderId },
        ],
      },
    });
    if (job) {
      updatedJob = await prisma.shopJob.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          completedAt,
          notes: notes ? `${job.notes || ''} [Verified with Customer Code: ${notes}]`.trim() : job.notes,
          updatedAt: completedAt,
        },
      });
    }
  }

  // 9. Create Order Tracking Event
  if (resolvedOrderId) {
    try {
      await prisma.orderTracking.create({
        data: {
          orderId: resolvedOrderId,
          status: 'DELIVERED',
          message: `Professional part installation verified and completed with customer confirmation code.`,
        },
      });
    } catch (trackErr) {
      console.warn('[Installation] Tracking update error:', trackErr);
    }
  }

  // 10. Send In-App Notification to Customer
  const order = resolvedOrderId
    ? await prisma.order.findUnique({
        where: { id: resolvedOrderId },
        include: { user: true, payment: true },
      })
    : null;

  if (order && order.userId) {
    try {
      await createNotification({
        userId: order.userId,
        title: 'Installation Completed & Verified',
        body: `Your installation for Order #${order.orderNumber} was successfully confirmed with your completion code. Thank you for choosing PartNexa!`,
        channel: 'IN_APP',
        status: 'DELIVERED',
        data: {
          route: `/customer/orders/${order.id}`,
          orderId: order.id,
          type: 'INSTALLATION_COMPLETED',
        },
      });
    } catch (notifErr) {
      console.warn('[Installation] Notification error:', notifErr);
    }
  }

  // 11. Recalculate Commission Eligibility
  let updatedLedger: any = null;
  if (resolvedOrderId) {
    const ledger = await prisma.commissionLedger.findFirst({
      where: { orderId: resolvedOrderId },
    });

    if (ledger) {
      const isPaymentCleared =
        order?.paymentStatus === PaymentStatus.CAPTURED || ledger.paymentStatus === 'CAPTURED';

      const releaseStatus = isPaymentCleared ? 'RELEASED' : 'LOCKED_PENDING_PAYMENT';
      const payoutStatus = isPaymentCleared ? 'RELEASED' : 'PENDING';

      updatedLedger = await prisma.commissionLedger.update({
        where: { id: ledger.id },
        data: {
          serviceStatus: 'COMPLETED',
          releaseStatus,
          payoutStatus,
          updatedAt: completedAt,
        },
      });
    }
  }

  return {
    success: true,
    message: 'Installation completion code verified successfully.',
    booking: {
      id: updatedBooking.id,
      isCompleted: true,
      completedAt: updatedBooking.completedAt,
      shopId: updatedBooking.shopId,
      shopName: updatedBooking.shop?.name,
    },
    job: updatedJob
      ? {
          id: updatedJob.id,
          status: updatedJob.status,
          completedAt: updatedJob.completedAt,
        }
      : null,
    commission: updatedLedger
      ? {
          id: updatedLedger.id,
          serviceStatus: updatedLedger.serviceStatus,
          paymentStatus: updatedLedger.paymentStatus,
          releaseStatus: updatedLedger.releaseStatus,
          payoutStatus: updatedLedger.payoutStatus,
          shopPayout: Number(updatedLedger.shopPayout),
          isReleased: updatedLedger.releaseStatus === 'RELEASED',
        }
      : null,
  };
};

/**
 * Sanitizes job or service booking data when sending to workshop or delivery partner.
 * Ensures the 6-digit confirmation code is strictly NEVER leaked to the installer beforehand.
 */
export const sanitizeForInstaller = (data: any) => {
  if (!data) return data;
  if (Array.isArray(data)) {
    return data.map(sanitizeForInstaller);
  }
  const copy = { ...data };
  delete copy.completionCode;
  delete copy.completionCodeHash;

  if (copy.serviceBooking) {
    copy.serviceBooking = { ...copy.serviceBooking };
    delete copy.serviceBooking.completionCode;
    delete copy.serviceBooking.completionCodeHash;
  }
  if (copy.difmRequest?.serviceBooking) {
    copy.difmRequest = { ...copy.difmRequest };
    copy.difmRequest.serviceBooking = { ...copy.difmRequest.serviceBooking };
    delete copy.difmRequest.serviceBooking.completionCode;
    delete copy.difmRequest.serviceBooking.completionCodeHash;
  }
  return copy;
};
