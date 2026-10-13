import prisma from '../../config/prisma';
import { OrderStatus, PaymentStatus, DIFMType, DIFMStatus, DeliveryAssignmentStatus } from '@prisma/client';
import { createNotification } from '../notifications/notifications.service';
import { ensureServiceBookingForDifm } from '../services/installationCompletion.service';

export interface PropagateOrderResult {
  orderId: string;
  deliveryAssignmentId?: string;
  shopJobId?: string;
  shopDeliveryId?: string;
  commissionLedgerId?: string;
}

/**
 * Authoritative Order Propagation Engine:
 * When an order is created or confirmed (via Cash on Delivery or Razorpay captured payment),
 * this engine propagates the order across all connected entities in the PostgreSQL database:
 * 1. Customer: Order confirmation, tracking timeline entry.
 * 2. Delivery Partner: DeliveryAssignment record for the fleet (appears in Available Jobs).
 * 3. Workshop: ShopJob, ShopDelivery manifest, and CommissionLedger records.
 * 4. Admin: Appears in Orders Management & Deliveries Logistics Oversight tables.
 */
export const propagateOrderConfirmed = async (orderId: string): Promise<PropagateOrderResult> => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
          shop: true,
        },
      },
      address: true,
      user: true,
      payment: true,
      difmRequest: {
        include: {
          shop: true,
        },
      },
      deliveryAssignments: true,
    },
  });

  if (!order) {
    throw new Error(`Order ${orderId} not found for propagation.`);
  }

  const result: PropagateOrderResult = { orderId: order.id };

  // Resolve active delivery partner (Rajesh or any active rider)
  let activePartner = await prisma.deliveryPartner.findFirst({
    where: {
      user: {
        status: 'ACTIVE',
      },
    },
  });

  if (!activePartner) {
    activePartner = await prisma.deliveryPartner.findFirst();
  }

  // ============================================================================
  // 1. DELIVERY ASSIGNMENT PROPAGATION
  // ============================================================================
  let existingAssignment = await prisma.deliveryAssignment.findFirst({
    where: { orderId: order.id },
  });

  if (!existingAssignment && activePartner) {
    const isHomeVisit = order.difmType === DIFMType.HOME_INSTALLATION;
    const estDistance = isHomeVisit ? 6.4 : 3.8;
    const fee = Number(order.deliveryFee || 50);

    existingAssignment = await prisma.deliveryAssignment.create({
      data: {
        orderId: order.id,
        deliveryPartnerId: activePartner.id,
        status: DeliveryAssignmentStatus.ASSIGNED,
        distanceKm: estDistance,
        deliveryFee: fee,
        notes: `Order #${order.orderNumber}. Doorstep delivery to ${order.address?.city || 'customer'}.`,
        assignedAt: new Date(),
      },
    });

    result.deliveryAssignmentId = existingAssignment.id;

    // Push tracking notification
    await prisma.orderTracking.create({
      data: {
        orderId: order.id,
        status: OrderStatus.CONFIRMED,
        message: `Order assigned to logistics fleet. Dispatching via partner ${activePartner.vehicleType || 'Courier'}.`,
      },
    });

    // Authoritative Customer and Partner In-App Notifications
    try {
      const existingCustNotifs = await prisma.notification.findMany({
        where: { userId: order.userId },
        take: 20,
      });

      // 1. Customer: Order Confirmed
      if (!existingCustNotifs.some((n: any) => n.data?.orderId === order.id && n.data?.type === 'ORDER_CONFIRMED')) {
        await createNotification({
          userId: order.userId,
          title: 'Order Confirmed',
          body: `Your Order #${order.orderNumber} for ₹${Number(order.total).toLocaleString('en-IN')} has been confirmed.`,
          channel: 'IN_APP',
          status: 'DELIVERED',
          data: {
            route: `/customer/orders/${order.id}`,
            orderId: order.id,
            type: 'ORDER_CONFIRMED',
          },
        });
      }

      // 2. Customer: Delivery Assigned
      if (!existingCustNotifs.some((n: any) => n.data?.orderId === order.id && n.data?.type === 'DELIVERY_ASSIGNED')) {
        await createNotification({
          userId: order.userId,
          title: 'Delivery Assigned',
          body: `A delivery partner (${activePartner.vehicleType || 'Courier'}) has been assigned to Order #${order.orderNumber}.`,
          channel: 'IN_APP',
          status: 'DELIVERED',
          data: {
            route: `/customer/orders/${order.id}`,
            orderId: order.id,
            type: 'DELIVERY_ASSIGNED',
          },
        });
      }

      // 3. Delivery Partner: New assignment
      if (activePartner?.userId) {
        const partnerNotifs = await prisma.notification.findMany({
          where: { userId: activePartner.userId },
          take: 20,
        });
        if (!partnerNotifs.some((n: any) => n.data?.orderId === order.id && n.data?.type === 'NEW_DELIVERY_ASSIGNMENT')) {
          await createNotification({
            userId: activePartner.userId,
            title: 'New Delivery Assignment',
            body: `New delivery job for Order #${order.orderNumber} (${order.address?.city || 'Bangalore'}). Fee: ₹${fee}.`,
            channel: 'IN_APP',
            status: 'DELIVERED',
            data: {
              route: '/delivery/jobs',
              orderId: order.id,
              assignmentId: existingAssignment.id,
              type: 'NEW_DELIVERY_ASSIGNMENT',
            },
          });
        }
      }
    } catch (notifErr) {
      console.warn('[Propagation] Notification error:', notifErr);
    }
  } else if (existingAssignment) {
    result.deliveryAssignmentId = existingAssignment.id;
  }

  // ============================================================================
  // 2. WORKSHOP (MECHANICAL SHOP) PROPAGATION
  // ============================================================================
  // Resolve assigned shop for DIFM or parts seller
  let targetShopId = order.difmRequest?.shopId || order.items?.[0]?.shopId;
  if (!targetShopId) {
    const defaultShop = await prisma.shop.findFirst({ where: { isActive: true } });
    targetShopId = defaultShop?.id;
  }

  if (targetShopId) {
    // If DIFM requested, ensure DIFMRequest is accepted and linked
    if (order.difmType && order.difmType !== DIFMType.NO_INSTALLATION) {
      if (order.difmRequest) {
        if (!order.difmRequest.shopId || order.difmRequest.status === DIFMStatus.PENDING) {
          await prisma.difmRequest.update({
            where: { id: order.difmRequest.id },
            data: {
              shopId: targetShopId,
              status: DIFMStatus.ACCEPTED,
              updatedAt: new Date(),
            },
          });
        }
      }

      // 2a. ShopJob (Workshop service calendar & job)
      let shopJob = await prisma.shopJob.findFirst({ where: { orderId: order.id } });
      if (!shopJob) {
        const custName =
          order.address?.fullName ||
          `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() ||
          'Valued Customer';
        const custPhone = order.address?.phone || order.user?.phone || '9876543210';
        const installFee = Number(order.installationFee || 199);
        const schedDate = order.difmRequest?.preferredDate || new Date(Date.now() + 86400000 * 2);

        shopJob = await prisma.shopJob.create({
          data: {
            shopId: targetShopId,
            orderId: order.id,
            difmRequestId: order.difmRequest?.id,
            orderNumber: order.orderNumber,
            customerName: custName,
            customerPhone: custPhone,
            vehicleInfo: 'Customer Registered Vehicle',
            vehicleNumber: 'KA-01-MJ-2024',
            serviceName:
              order.difmType === DIFMType.SHOP_INSTALLATION
                ? 'Workshop Part Installation & Fitment'
                : 'Doorstep Part Installation',
            jobType:
              order.difmType === DIFMType.SHOP_INSTALLATION
                ? 'DIFM_SHOP_VISIT'
                : 'DIFM_DOORSTEP_VISIT',
            locationType: order.difmType === DIFMType.SHOP_INSTALLATION ? 'SHOP' : 'DOORSTEP',
            status: 'SCHEDULED',
            totalServiceAmount: installFee,
            serviceFee: installFee,
            installationFee: installFee,
            scheduledDate: schedDate,
            scheduledSlot: '10:00 AM - 12:00 PM',
            notes: order.notes || `Part installation scheduled for Order #${order.orderNumber}.`,
          },
        });
      }
      result.shopJobId = shopJob.id;

      // 2a-ii. ServiceBooking (Customer Installation Confirmation Code)
      try {
        await ensureServiceBookingForDifm(order.id, shopJob.scheduledSlot || '10:00 AM - 12:00 PM');
      } catch (sbErr) {
        console.warn('[Propagation] Failed to ensure service booking with code:', sbErr);
      }

      // 2b. ShopDelivery (Workshop parts manifest)
      let shopDelivery = await prisma.shopDelivery.findFirst({ where: { orderId: order.id } });
      if (!shopDelivery) {
        shopDelivery = await prisma.shopDelivery.create({
          data: {
            shopId: targetShopId,
            orderId: order.id,
            trackingNumber: `TRK-${order.orderNumber}`,
            status: 'IN_TRANSIT',
            eta: '1-2 business days',
            items: order.items.map((it: any) => ({
              id: it.productId,
              name: it.product?.name || 'Automotive Component',
              partNumber: it.product?.partNumber || '',
              quantity: it.quantity,
              price: Number(it.unitPrice),
            })),
          },
        });
      }
      result.shopDeliveryId = shopDelivery.id;

      // 2c. CommissionLedger (Workshop payout & platform earnings)
      let ledger = await prisma.commissionLedger.findFirst({ where: { orderId: order.id } });
      if (!ledger) {
        const installFee = Number(order.installationFee || 250);
        const commRate = 12; // 12% platform fee
        const commAmount = Number((installFee * 0.12).toFixed(2));
        const payout = Number((installFee - commAmount).toFixed(2));
        const isPaid = order.paymentStatus === PaymentStatus.CAPTURED;

        ledger = await prisma.commissionLedger.create({
          data: {
            orderId: order.id,
            shopId: targetShopId,
            jobId: shopJob?.id,
            grossAmount: installFee,
            commissionRate: commRate,
            commissionAmount: commAmount,
            platformCut: commAmount,
            shopPayout: payout,
            payoutStatus: 'PENDING',
            releaseStatus: isPaid ? 'LOCKED_PENDING_COMPLETION' : 'LOCKED_PENDING_PAYMENT',
            serviceStatus: 'PENDING',
            paymentStatus: isPaid ? 'CAPTURED' : 'PENDING',
          },
        });
      } else {
        // If payment just captured, update release lock
        if (order.paymentStatus === PaymentStatus.CAPTURED && ledger.paymentStatus !== 'CAPTURED') {
          await prisma.commissionLedger.update({
            where: { id: ledger.id },
            data: {
              paymentStatus: 'CAPTURED',
              releaseStatus:
                ledger.serviceStatus === 'COMPLETED' ? 'RELEASED' : 'LOCKED_PENDING_COMPLETION',
              payoutStatus: ledger.serviceStatus === 'COMPLETED' ? 'RELEASED' : 'PENDING',
              updatedAt: new Date(),
            },
          });
        }
      }
      result.commissionLedgerId = ledger?.id;
    } else {
      // No installation, but parts purchased from shop -> create shop delivery fulfillment
      const sellerShopId = order.items?.[0]?.shopId || targetShopId;
      if (sellerShopId) {
        let shopDelivery = await prisma.shopDelivery.findFirst({ where: { orderId: order.id } });
        if (!shopDelivery) {
          shopDelivery = await prisma.shopDelivery.create({
            data: {
              shopId: sellerShopId,
              orderId: order.id,
              trackingNumber: `TRK-${order.orderNumber}`,
              status: 'IN_TRANSIT',
              eta: '1-2 business days',
              items: order.items.map((it: any) => ({
                id: it.productId,
                name: it.product?.name || 'Automotive Component',
                partNumber: it.product?.partNumber || '',
                quantity: it.quantity,
                price: Number(it.unitPrice),
              })),
            },
          });
        }
        result.shopDeliveryId = shopDelivery.id;
      }
    }
  }

  // 3. Workshop & Admin In-App Notifications
  try {
    if (result.shopJobId && targetShopId) {
      const targetShop = await prisma.shop.findUnique({ where: { id: targetShopId } });
      const shopOwnerId = targetShop?.ownerId || 'shop-owner-1';
      if (shopOwnerId) {
        const existingShopNotifs = await prisma.notification.findMany({
          where: { userId: shopOwnerId },
          take: 20,
        });
        if (!existingShopNotifs.some((n: any) => n.data?.orderId === order.id && n.data?.type === 'SHOP_NEW_JOB')) {
          await createNotification({
            userId: shopOwnerId,
            title: 'New Service Job',
            body: `New installation job #${order.orderNumber} scheduled for customer.`,
            channel: 'IN_APP',
            status: 'DELIVERED',
            data: {
              route: '/shop/calendar',
              orderId: order.id,
              jobId: result.shopJobId,
              type: 'SHOP_NEW_JOB',
            },
          });
        }
      }

      // Customer notification for workshop assigned
      const custNotifs = await prisma.notification.findMany({
        where: { userId: order.userId },
        take: 20,
      });
      if (!custNotifs.some((n: any) => n.data?.orderId === order.id && n.data?.type === 'WORKSHOP_ASSIGNED')) {
        await createNotification({
          userId: order.userId,
          title: 'Workshop Assigned',
          body: `Workshop ${targetShop?.name || 'Partner Workshop'} has been assigned for Order #${order.orderNumber}.`,
          channel: 'IN_APP',
          status: 'DELIVERED',
          data: {
            route: `/customer/orders/${order.id}`,
            orderId: order.id,
            type: 'WORKSHOP_ASSIGNED',
          },
        });
      }
    }

    // Operational notice for Admins
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
      take: 2,
    });
    for (const adm of admins) {
      const admNotifs = await prisma.notification.findMany({
        where: { userId: adm.id },
        take: 10,
      });
      if (!admNotifs.some((n: any) => n.data?.orderId === order.id && n.data?.type === 'ADMIN_NEW_ORDER')) {
        await createNotification({
          userId: adm.id,
          title: 'New Order Received',
          body: `Order #${order.orderNumber} confirmed for ₹${Number(order.total).toLocaleString('en-IN')}.`,
          channel: 'IN_APP',
          status: 'DELIVERED',
          data: {
            route: '/admin/orders',
            orderId: order.id,
            type: 'ADMIN_NEW_ORDER',
          },
        });
      }
    }
  } catch (err) {
    console.warn('[Propagation] Workshop/Admin notification error:', err);
  }

  return result;
};

/**
 * Synchronizes all confirmed orders in the database that are missing delivery assignments or shop jobs.
 */
export const syncAllConfirmedOrders = async () => {
  const confirmedOrders = await prisma.order.findMany({
    where: {
      OR: [
        { status: OrderStatus.CONFIRMED },
        { status: OrderStatus.PROCESSING },
        { status: OrderStatus.SHIPPED },
        { status: OrderStatus.OUT_FOR_DELIVERY },
        { paymentStatus: PaymentStatus.CAPTURED },
      ],
    },
    select: { id: true, orderNumber: true },
  });

  const results = [];
  for (const o of confirmedOrders) {
    try {
      const res = await propagateOrderConfirmed(o.id);
      results.push(res);
    } catch (err: any) {
      console.warn(`Sync error for order ${o.orderNumber}:`, err.message);
    }
  }

  return results;
};
