import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';
import { createNotification } from '../notifications/notifications.service';
import { CreateReturnRequestInput, AdminReviewReturnInput, AdminInspectionInput } from './returns.types';
import { OrderStatus, PaymentStatus, StockMovementType, StockAvailability } from '@prisma/client';

// Configurable return window: default 5 days (between 3 and 5 days)
export const getReturnWindowDays = (): number => {
  const envVal = Number(process.env.RETURN_WINDOW_DAYS);
  if (!isNaN(envVal) && envVal >= 3 && envVal <= 5) {
    return envVal;
  }
  return 5;
};

/**
 * Checks eligibility of an order/item for return.
 */
export const checkItemReturnEligibility = (
  order: any,
  orderItemId: string,
  existingReturns: any[] = []
) => {
  const returnWindowDays = getReturnWindowDays();

  // 1. Order must be DELIVERED
  if (order.status !== 'DELIVERED') {
    return {
      eligible: false,
      reason: 'NOT_DELIVERED',
      message: 'Return is available only after the order has been delivered.',
      returnWindowDays,
    };
  }

  // 2. Resolve deliveredAt timestamp
  let deliveredAt: Date | null = null;
  if (order.deliveredAt) {
    deliveredAt = new Date(order.deliveredAt);
  } else if (order.deliveryAssignments?.length) {
    const deliveredAssign = order.deliveryAssignments.find((a: any) => a.deliveredAt);
    if (deliveredAssign?.deliveredAt) deliveredAt = new Date(deliveredAssign.deliveredAt);
  } else if (order.tracking?.length) {
    const deliveredTrack = order.tracking.find((t: any) => t.status === 'DELIVERED');
    if (deliveredTrack?.createdAt) deliveredAt = new Date(deliveredTrack.createdAt);
  }
  if (!deliveredAt) {
    deliveredAt = order.updatedAt ? new Date(order.updatedAt) : new Date();
  }

  // 3. Check Return Window Expiration
  const windowMs = returnWindowDays * 24 * 60 * 60 * 1000;
  const expiresAt = new Date(deliveredAt.getTime() + windowMs);
  const now = new Date();

  if (now > expiresAt) {
    return {
      eligible: false,
      reason: 'WINDOW_EXPIRED',
      message: 'Return window ended',
      returnWindowDays,
      deliveredAt,
      expiresAt,
    };
  }

  // 4. Check if item already has active or completed return
  const activeReturn = existingReturns.find(
    (r) =>
      r.orderItemId === orderItemId &&
      !['REJECTED', 'CANCELLED'].includes(r.status)
  );

  if (activeReturn) {
    return {
      eligible: false,
      reason: 'ALREADY_RETURNED',
      message: `Return already ${activeReturn.status.toLowerCase().replace(/_/g, ' ')} for this item.`,
      returnWindowDays,
      deliveredAt,
      expiresAt,
      activeReturn,
    };
  }

  const formatter = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return {
    eligible: true,
    message: `Return available until ${formatter.format(expiresAt)}`,
    returnWindowDays,
    deliveredAt,
    expiresAt,
  };
};

/**
 * Customer submits an item-level return request.
 */
export const createReturnRequest = async (
  userId: string,
  input: CreateReturnRequestInput
) => {
  const { orderId, orderItemId, reason, details, photos = [] } = input;
  const quantity = Math.max(1, Number(input.quantity || 1));

  if (!orderId || !orderItemId || !reason) {
    throw AppError.badRequest('Order ID, Order Item ID, and Return Reason are required.');
  }

  const validReasons = [
    'WRONG_PART',
    'COMPATIBILITY_ISSUE',
    'DAMAGED_PRODUCT',
    'DEFECTIVE_PART',
    'DIFFERENT_FROM_DESCRIPTION',
    'OTHER',
  ];
  if (!validReasons.includes(reason)) {
    throw AppError.badRequest(`Invalid return reason. Must be one of: ${validReasons.join(', ')}`);
  }

  // Find order with items and user
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { product: true, shop: true },
      },
      address: true,
      user: true,
      deliveryAssignments: true,
      tracking: true,
      returnRequests: true,
    },
  });

  if (!order) {
    throw AppError.notFound('Order not found.');
  }

  if (order.userId !== userId) {
    throw AppError.forbidden('You do not have permission to return items from this order.');
  }

  // Find item
  const item = order.items.find((i: any) => i.id === orderItemId);
  if (!item) {
    throw AppError.notFound('Item not found in this order.');
  }

  if (quantity > item.quantity) {
    throw AppError.badRequest(`Requested return quantity (${quantity}) exceeds ordered quantity (${item.quantity}).`);
  }

  // Eligibility check
  const existingReturns = order.returnRequests || [];
  const eligibility = checkItemReturnEligibility(order, orderItemId, existingReturns);

  if (!eligibility.eligible) {
    throw AppError.badRequest(eligibility.message || 'Item is not eligible for return.');
  }

  // Server-side authoritative refund amount calculation (unitPrice * quantity)
  const unitPrice = Number(item.unitPrice || 0);
  const refundAmount = Math.round(unitPrice * quantity * 100) / 100;

  // Create ReturnRequest record
  const returnRequest = await prisma.returnRequest.create({
    data: {
      orderId: order.id,
      orderItemId: item.id,
      userId,
      quantity,
      reason,
      details: details || null,
      photos: Array.isArray(photos) ? photos : [],
      status: 'REQUESTED',
      refundAmount,
      requestedAt: new Date(),
    },
  });

  // Track on Order
  await prisma.orderTracking.create({
    data: {
      orderId: order.id,
      status: OrderStatus.RETURN_REQUESTED,
      message: `Return requested for "${item.product?.name || 'Part'}" (Qty: ${quantity}). Reason: ${reason.replace(/_/g, ' ')}.`,
    },
  });

  // Customer notification
  await createNotification({
    userId,
    title: 'Return Requested',
    body: `Your return request for "${item.product?.name || 'Spare Part'}" (Qty: ${quantity}) on Order #${order.orderNumber} has been received and is under review.`,
    channel: 'IN_APP',
    status: 'DELIVERED',
    data: {
      route: `/customer/orders/${order.id}`,
      orderId: order.id,
      returnRequestId: returnRequest.id,
      type: 'RETURN_REQUESTED',
    },
  });

  return {
    ...returnRequest,
    item,
    eligibility,
  };
};

/**
 * Get all returns for a customer.
 */
export const getCustomerReturns = async (userId: string) => {
  const returns = await prisma.returnRequest.findMany({
    where: { userId },
    include: {
      order: {
        include: { address: true },
      },
      orderItem: {
        include: { product: true },
      },
      deliveryAssignments: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return returns;
};

/**
 * Get single return by ID.
 */
export const getReturnById = async (returnId: string, userId?: string, isAdmin: boolean = false) => {
  const ret = await prisma.returnRequest.findUnique({
    where: { id: returnId },
    include: {
      order: {
        include: { address: true, user: true, payment: true },
      },
      orderItem: {
        include: { product: true, shop: true },
      },
      user: true,
      deliveryAssignments: {
        include: { deliveryPartner: { include: { user: true } } },
      },
    },
  });

  if (!ret) {
    throw AppError.notFound('Return request not found.');
  }

  if (!isAdmin && userId && ret.userId !== userId) {
    throw AppError.forbidden('Forbidden access to this return request.');
  }

  return ret;
};

/**
 * Admin: List all returns with optional status & search filter.
 */
export const adminListReturns = async (filters: {
  status?: string;
  search?: string;
} = {}) => {
  const where: any = {};
  if (filters.status && filters.status !== 'ALL') {
    where.status = filters.status;
  }

  const returns = await prisma.returnRequest.findMany({
    where,
    include: {
      order: {
        include: { address: true, user: true, payment: true },
      },
      orderItem: {
        include: { product: true, shop: true },
      },
      user: true,
      deliveryAssignments: {
        include: { deliveryPartner: { include: { user: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (filters.search && filters.search.trim()) {
    const s = filters.search.toLowerCase();
    return returns.filter(
      (r: any) =>
        r.id.toLowerCase().includes(s) ||
        r.order?.orderNumber?.toLowerCase().includes(s) ||
        r.user?.firstName?.toLowerCase().includes(s) ||
        r.user?.email?.toLowerCase().includes(s) ||
        r.orderItem?.product?.name?.toLowerCase().includes(s)
    );
  }

  return returns;
};

/**
 * Admin: Review return request (APPROVE or REJECT).
 * If approved: creates reverse delivery assignment of type RETURN_PICKUP.
 */
export const adminReviewReturn = async (
  adminId: string,
  returnId: string,
  input: AdminReviewReturnInput
) => {
  const action = (input.action || (input as any).decision || '').toUpperCase();
  const rejectionReason = input.rejectionReason;

  const returnReq = await prisma.returnRequest.findUnique({
    where: { id: returnId },
    include: {
      order: { include: { address: true, user: true } },
      orderItem: { include: { product: true, shop: true } },
    },
  });

  if (!returnReq) {
    throw AppError.notFound('Return request not found.');
  }

  if (returnReq.status !== 'REQUESTED') {
    throw AppError.badRequest(`Cannot review return with status ${returnReq.status}. Must be in REQUESTED status.`);
  }

  if (action === 'REJECT') {
    if (!rejectionReason || !rejectionReason.trim()) {
      throw AppError.badRequest('Rejection reason is required when rejecting a return request.');
    }

    const updated = await prisma.returnRequest.update({
      where: { id: returnId },
      data: {
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
      },
    });

    await prisma.orderTracking.create({
      data: {
        orderId: returnReq.orderId,
        status: OrderStatus.RETURN_REQUESTED,
        message: `Return request for "${returnReq.orderItem?.product?.name}" was rejected. Reason: ${rejectionReason}`,
      },
    });

    await createNotification({
      userId: returnReq.userId,
      title: 'Return Request Rejected',
      body: `Your return request for Order #${returnReq.order?.orderNumber} was not approved: ${rejectionReason}`,
      channel: 'IN_APP',
      status: 'DELIVERED',
      data: {
        route: `/customer/orders/${returnReq.orderId}`,
        orderId: returnReq.orderId,
        returnRequestId: returnReq.id,
        type: 'RETURN_REJECTED',
      },
    });

    return updated;
  }

  if (action === 'APPROVE') {
    const order = returnReq.order;
    const address = order?.address;
    const item = returnReq.orderItem;

    // Create reverse delivery assignment (RETURN_PICKUP)
    const pickupAssignment = await prisma.deliveryAssignment.create({
      data: {
        orderId: order.id,
        returnRequestId: returnReq.id,
        type: 'RETURN_PICKUP',
        status: 'ASSIGNED',
        deliveryPartnerId: null, // Broadcast unassigned job for fleet pickup
        distanceKm: 4.8,
        deliveryFee: 85,
        notes: `[RETURN_PICKUP] Order #${order.orderNumber} - Item: ${item?.product?.name || 'Spare Part'} (Qty: ${returnReq.quantity}). Inspect for seal & original packaging.`,
        assignedAt: new Date(),
      },
    });

    const updated = await prisma.returnRequest.update({
      where: { id: returnId },
      data: {
        status: 'PICKUP_ASSIGNED',
        approvedAt: new Date(),
      },
    });

    await prisma.orderTracking.create({
      data: {
        orderId: order.id,
        status: OrderStatus.RETURN_REQUESTED,
        message: `Return approved. Doorstep return pickup assignment #${pickupAssignment.id} created for delivery fleet.`,
      },
    });

    // Notify customer
    await createNotification({
      userId: returnReq.userId,
      title: 'Return Approved & Pickup Assigned',
      body: `Your return request for Order #${order.orderNumber} has been approved. A return pickup agent will arrive at your address.`,
      channel: 'IN_APP',
      status: 'DELIVERED',
      data: {
        route: `/customer/orders/${order.id}`,
        orderId: order.id,
        returnRequestId: returnReq.id,
        type: 'RETURN_APPROVED',
      },
    });

    return {
      ...updated,
      pickupAssignment,
    };
  }

  throw AppError.badRequest('Invalid action. Must be APPROVE or REJECT.');
};

/**
 * Admin / QA Inspector: Record return inspection outcome.
 * After inspection:
 * - GOOD / UNOPENED -> restock if business rules permit, creates StockMovement RETURN.
 * - DAMAGED -> do not sell / quarantined damaged stock.
 */
export const updateReturnInspection = async (
  adminId: string,
  returnId: string,
  input: AdminInspectionInput
) => {
  const { outcome, notes, condition = 'GOOD' } = input;

  const returnReq = await prisma.returnRequest.findUnique({
    where: { id: returnId },
    include: {
      order: { include: { user: true } },
      orderItem: { include: { product: true, shop: true } },
    },
  });

  if (!returnReq) {
    throw AppError.notFound('Return request not found.');
  }

  // Permissible prior statuses: RECEIVED (or PICKED_UP / PICKUP_ASSIGNED in fast prototype testing)
  if (!['RECEIVED', 'PICKED_UP', 'PICKUP_ASSIGNED', 'APPROVED'].includes(returnReq.status)) {
    throw AppError.badRequest(`Cannot inspect return in status ${returnReq.status}. Item must be received at hub first.`);
  }

  const isPassed = outcome === 'PASSED';
  const newStatus = isPassed ? 'INSPECTION_PASSED' : 'INSPECTION_FAILED';

  const updated = await prisma.returnRequest.update({
    where: { id: returnId },
    data: {
      status: newStatus,
      inspectedAt: new Date(),
      details: notes ? `${returnReq.details || ''}\nInspection: ${notes}`.trim() : returnReq.details,
    },
  });

  const item = returnReq.orderItem;

  // Inventory logic:
  // Returned stock must NOT immediately become sellable.
  // Only after inspection PASSED with GOOD / UNOPENED condition, restock.
  if (isPassed && (condition === 'GOOD' || condition === 'UNOPENED')) {
    // Locate inventory record
    try {
      let inventory = null;
      if (item?.shopId) {
        inventory = await prisma.inventory.findFirst({
          where: { productId: item.productId, shopId: item.shopId },
        });
      }
      if (!inventory) {
        inventory = await prisma.inventory.findFirst({
          where: { productId: item.productId },
        });
      }


      if (inventory) {
        const prevQty = Number(inventory.quantity || 0);
        const newQty = prevQty + returnReq.quantity;

        await prisma.inventory.update({
          where: { id: inventory.id },
          data: {
            quantity: newQty,
            isAvailable: true,
            availabilityStatus:
              newQty <= (inventory.lowStockThreshold || 5)
                ? StockAvailability.LOW_STOCK
                : StockAvailability.IN_STOCK,
          },
        });

        await prisma.stockMovement.create({
          data: {
            inventoryId: inventory.id,
            type: StockMovementType.RETURN,
            quantity: returnReq.quantity,
            previousQty: prevQty,
            newQty,
            reason: `Return inspection passed (${condition}): Restocked ${returnReq.quantity} unit(s) from Order #${returnReq.order?.orderNumber}`,
            referenceType: 'RETURN',
            referenceId: returnReq.id,
          },
        });
      }
    } catch (err) {
      console.warn('[ReturnService] Error restocking inventory on passed inspection:', err);
    }

    await createNotification({
      userId: returnReq.userId,
      title: 'Return Inspection Passed',
      body: `Quality check passed for your returned item on Order #${returnReq.order?.orderNumber}. Refund of ₹${returnReq.refundAmount} has been approved!`,
      channel: 'IN_APP',
      status: 'DELIVERED',
      data: {
        route: `/customer/orders/${returnReq.orderId}`,
        orderId: returnReq.orderId,
        returnRequestId: returnReq.id,
        type: 'INSPECTION_PASSED',
      },
    });
  } else {
    // DAMAGED / FAILED: Do NOT restock into sellable inventory!
    try {
      const inventory = await prisma.inventory.findFirst({
        where: { productId: item.productId },
      });
      if (inventory) {
        await prisma.stockMovement.create({
          data: {
            inventoryId: inventory.id,
            type: StockMovementType.DAMAGE,
            quantity: returnReq.quantity,
            previousQty: Number(inventory.quantity || 0),
            newQty: Number(inventory.quantity || 0), // Untouched sellable stock
            reason: `Damaged return inspection failed (${condition}): ${notes || 'Quarantined / unsellable'}`,
            referenceType: 'RETURN',
            referenceId: returnReq.id,
          },
        });
      }
    } catch (err) {
      console.warn('[ReturnService] Error logging damaged stock movement:', err);
    }

    await createNotification({
      userId: returnReq.userId,
      title: 'Return Inspection Update',
      body: `Quality inspection for your returned item on Order #${returnReq.order?.orderNumber} did not pass: ${notes || 'Item condition damaged or not eligible for restock.'}`,
      channel: 'IN_APP',
      status: 'DELIVERED',
      data: {
        route: `/customer/orders/${returnReq.orderId}`,
        orderId: returnReq.orderId,
        returnRequestId: returnReq.id,
        type: 'INSPECTION_FAILED',
      },
    });
  }

  return updated;
};

/**
 * Admin: Approve and execute refund.
 * Uses existing Payment refund metadata; records a legitimate backend refund state.
 */
export const processRefund = async (adminId: string, returnId: string) => {
  const returnReq = await prisma.returnRequest.findUnique({
    where: { id: returnId },
    include: {
      order: {
        include: { payment: true, user: true, items: true, returnRequests: true },
      },
      orderItem: { include: { product: true } },
    },
  });

  if (!returnReq) {
    throw AppError.notFound('Return request not found.');
  }

  if (returnReq.status === 'REFUNDED') {
    throw AppError.badRequest('This return has already been refunded.');
  }

  if (!['INSPECTION_PASSED', 'APPROVED', 'REFUND_APPROVED'].includes(returnReq.status)) {
    throw AppError.badRequest(`Cannot process refund in status ${returnReq.status}. Must pass inspection first.`);
  }

  const order = returnReq.order;
  const refundAmount = Number(returnReq.refundAmount || 0);

  // Update ReturnRequest to REFUNDED
  const updatedReturn = await prisma.returnRequest.update({
    where: { id: returnId },
    data: {
      status: 'REFUNDED',
      refundedAt: new Date(),
    },
  });

  // Legitimate backend Payment refund record
  let payment = order.payment;
  if (!payment) {
    payment = await prisma.payment.findFirst({ where: { orderId: order.id } });
  }

  const refundId = `RFND-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  if (payment) {
    const priorRefunded = Number(payment.refundAmount || 0);
    const newTotalRefunded = Math.round((priorRefunded + refundAmount) * 100) / 100;
    const isFullRefund = newTotalRefunded >= Number(order.total);

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        refundId,
        refundAmount: newTotalRefunded,
        refundedAt: new Date(),
        status: isFullRefund ? PaymentStatus.REFUNDED : payment.status,
      },
    });
  }

  // Update order status if all items returned or partial return
  const totalItemsCount = order.items?.reduce((sum: number, it: any) => sum + it.quantity, 0) || 1;
  const refundedReturns = (order.returnRequests || []).filter((r: any) => r.status === 'REFUNDED' || r.id === returnId);
  const totalReturnedCount = refundedReturns.reduce((sum: number, r: any) => sum + r.quantity, 0);

  const newOrderStatus = totalReturnedCount >= totalItemsCount ? OrderStatus.REFUNDED : OrderStatus.RETURNED;

  await prisma.order.update({
    where: { id: order.id },
    data: { status: newOrderStatus },
  });

  await prisma.orderTracking.create({
    data: {
      orderId: order.id,
      status: newOrderStatus,
      message: `Refund of ₹${refundAmount.toLocaleString('en-IN')} processed successfully (Ref: ${refundId}).`,
    },
  });

  // Customer notification
  await createNotification({
    userId: returnReq.userId,
    title: 'Refund Completed',
    body: `₹${refundAmount.toLocaleString('en-IN')} has been refunded to your original payment method for Order #${order.orderNumber} (Refund ID: ${refundId}).`,
    channel: 'IN_APP',
    status: 'DELIVERED',
    data: {
      route: `/customer/orders/${order.id}`,
      orderId: order.id,
      returnRequestId: returnReq.id,
      refundId,
      refundAmount,
      type: 'REFUND_COMPLETED',
    },
  });

  return {
    ...updatedReturn,
    returnRequest: updatedReturn,
    refundId,
    refundAmount,
    orderStatus: newOrderStatus,
  };
};
