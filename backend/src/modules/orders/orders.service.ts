import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';
import { generateOrderNumber } from '../../utils/helpers';
import { OrderStatus, PaymentMethod, PaymentStatus, DIFMType, DIFMStatus } from '@prisma/client';
import {
  calculateAuthoritativePricing,
  findEligiblePartneredShops,
  evaluateCartDIFM,
  resolveItemUnitPrice,
  LocationPoint,
} from './difmEngine';
import { InventorySyncEngine } from '../inventory/inventorySync.service';
import { propagateOrderConfirmed } from './orderPropagation.service';
import { getReturnWindowDays } from '../returns/returns.service';
import { ensureServiceBookingForDifm } from '../services/installationCompletion.service';

export const listCustomerOrders = async (userId: string) => {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
              slug: true,
              brand: true,
              partNumber: true,
              images: { select: { id: true, url: true, isPrimary: true }, take: 1 },
            },
          },
          shop: { select: { name: true, city: true } },
        },
      },
      payment: true,
      difmRequest: {
        include: { shop: { select: { name: true, phone: true } } },
      },
      tracking: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getOrderById = async (userId: string, orderId: string) => {
  let order = await prisma.order.findFirst({
    where: {
      userId,
      OR: [
        { id: orderId },
        { orderNumber: orderId },
      ],
    },
    include: {
      items: {
        include: {
          product: {
            include: { images: true, brandRel: true },
          },
          shop: true,
        },
      },
      address: true,
      payment: true,
      difmRequest: {
        include: { shop: true, serviceBooking: true },
      },
      deliveryAssignments: {
        include: {
          deliveryPartner: {
            include: { user: true },
          },
        },
      },
      tracking: {
        orderBy: { createdAt: 'asc' },
      },
      statusHistory: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!order) {
    order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNumber: orderId },
        ],
      },
      include: {
        items: {
          include: {
            product: {
              include: { images: true, brandRel: true },
            },
            shop: true,
          },
        },
        address: true,
        payment: true,
        difmRequest: {
          include: { shop: true, serviceBooking: true },
        },
        deliveryAssignments: {
          include: {
            deliveryPartner: {
              include: { user: true },
            },
          },
        },
        tracking: {
          orderBy: { createdAt: 'asc' },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
        returnRequests: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  if (!order) throw AppError.notFound('Order not found.');

  // Resolve deliveredAt
  let deliveredAt: Date | null = order.deliveredAt ? new Date(order.deliveredAt) : null;
  if (!deliveredAt) {
    const deliveredAssign = order.deliveryAssignments?.find((a: any) => a.deliveredAt);
    if (deliveredAssign?.deliveredAt) {
      deliveredAt = new Date(deliveredAssign.deliveredAt);
    } else {
      const deliveredTrack = order.tracking?.find((t: any) => t.status === 'DELIVERED');
      if (deliveredTrack?.createdAt) {
        deliveredAt = new Date(deliveredTrack.createdAt);
      } else if (order.status === 'DELIVERED') {
        deliveredAt = order.updatedAt ? new Date(order.updatedAt) : new Date();
      }
    }
  }

  const returnWindowDays = getReturnWindowDays();
  const isDelivered = order.status === 'DELIVERED';
  const expiresAt = deliveredAt ? new Date(deliveredAt.getTime() + returnWindowDays * 86400000) : null;
  const isWithinWindow = Boolean(isDelivered && expiresAt && new Date() <= expiresAt);

  const formatter = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const items = (order.items || []).map((it: any) => {
    const existingReturn = (order.returnRequests || []).find(
      (r: any) => r.orderItemId === it.id && !['REJECTED', 'CANCELLED'].includes(r.status)
    );
    const eligible = isDelivered && isWithinWindow && !existingReturn;
    let message = '';
    if (!isDelivered) {
      message = 'Return available after delivery';
    } else if (existingReturn) {
      message = `Return ${existingReturn.status.toLowerCase().replace(/_/g, ' ')}`;
    } else if (!isWithinWindow) {
      message = 'Return window ended';
    } else if (expiresAt) {
      message = `Return available until ${formatter.format(expiresAt)}`;
    }

    return {
      ...it,
      returnEligibility: {
        eligible,
        isDelivered,
        isWithinWindow,
        returnWindowDays,
        deliveredAt,
        expiresAt,
        existingReturn: existingReturn || null,
        message,
      },
    };
  });

  // Step 11: Installation Completion Confirmation Code Resolution
  let installationConfirmationCode: string | null = null;
  let installationCompleted = false;
  let installationCompletedAt: Date | null = null;

  if (order.difmRequest) {
    let booking = order.difmRequest.serviceBooking;
    if (!booking && order.difmRequest.shopId) {
      try {
        booking = await ensureServiceBookingForDifm(order.id);
        if (booking) {
          order.difmRequest.serviceBooking = booking;
        }
      } catch (e) {
        console.warn('[Orders] Could not ensure service booking:', e);
      }
    }

    if (booking) {
      installationCompleted = Boolean(booking.isCompleted);
      installationCompletedAt = booking.completedAt ? new Date(booking.completedAt) : null;
      // Do not show before the installation assignment is valid, and only before completion
      const isAssigned = Boolean(order.difmRequest.shopId);
      const isValidStatus = ['ACCEPTED', 'SCHEDULED', 'IN_PROGRESS', 'CONFIRMED'].includes(order.difmRequest.status);
      if (!booking.isCompleted && isAssigned && isValidStatus) {
        installationConfirmationCode = booking.completionCode || null;
      }
    }
  }

  return {
    ...order,
    deliveredAt,
    items,
    installationConfirmationCode,
    installationCompleted,
    installationCompletedAt,
    returnEligibility: {
      isDelivered,
      isWithinWindow,
      returnWindowDays,
      deliveredAt,
      expiresAt,
    },
    pricing: {
      partSubtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      installationFee: Number(order.installationFee),
      homeVisitSurcharge: Number(order.homeVisitSurcharge),
      discount: Number(order.discount),
      grandTotal: Number(order.total),
    },
  };
};

/**
 * Recalculates authoritative checkout pricing immediately when option, address, or coupon changes.
 * Used by GET/POST /api/orders/checkout-quote.
 */
export const getCheckoutQuote = async (
  userId: string,
  data: {
    addressId?: string;
    difmType?: string | null;
    shopId?: string | null;
    couponCode?: string;
  }
) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart || !cart.items || cart.items.length === 0) {
    throw AppError.badRequest('Your shopping cart is empty.');
  }

  // 1. Resolve customer address & coordinates
  let address: any = null;
  if (data.addressId) {
    address = await prisma.address.findFirst({
      where: { id: data.addressId, userId },
    });
  }
  if (!address) {
    // Default address fallback
    address = await prisma.address.findFirst({
      where: { userId, isDefault: true },
    });
  }
  if (!address) {
    // Any address fallback
    address = await prisma.address.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  const customerLocation = (data as any).customerLatitude != null && (data as any).customerLongitude != null
    ? {
        latitude: Number((data as any).customerLatitude),
        longitude: Number((data as any).customerLongitude),
        city: address?.city,
        pincode: address?.pincode,
      }
    : address;

  // 2. Discover eligible partnered shops
  const eligibleShops = await findEligiblePartneredShops(customerLocation);

  // 3. Resolve shop for installation
  let assignedShop: any = null;
  const isHomeInstallation =
    data.difmType === 'HOME_INSTALLATION' ||
    data.difmType === 'HOME' ||
    data.difmType === DIFMType.HOME_INSTALLATION;

  if (isHomeInstallation) {
    // For doorstep home installation, always assign local partner shop (<= 35km)
    if (data.shopId) {
      const requestedShop = eligibleShops.find((s: any) => s.id === data.shopId);
      if (requestedShop && (requestedShop.distanceKm || 0) <= 35) {
        assignedShop = requestedShop;
      }
    }
    if (!assignedShop && eligibleShops.length > 0) {
      assignedShop = eligibleShops[0]; // Nearest qualified shop
    }
  } else if (data.shopId) {
    assignedShop = eligibleShops.find((s: any) => s.id === data.shopId) || null;
  }
  if (!assignedShop && eligibleShops.length > 0) {
    assignedShop = eligibleShops[0]; // Nearest shop
  }

  // 4. Calculate Authoritative Pricing via DIFM Engine
  const pricing = await calculateAuthoritativePricing({
    cartItems: cart.items,
    difmType: data.difmType,
    customerAddress: address,
    shopLocation: assignedShop,
    couponCode: data.couponCode,
  });

  return {
    cartSummary: {
      itemCount: cart.items.reduce((sum: number, it: any) => sum + it.quantity, 0),
      items: cart.items.map((it: any) => {
        const unitPrice = resolveItemUnitPrice(it);
        const qty = it.quantity;
        return {
          id: it.id,
          productId: it.productId,
          productName: it.product?.name,
          partNumber: it.product?.partNumber,
          unitPrice,
          quantity: qty,
          totalPrice: unitPrice * qty,
          requiresDIFM: Boolean(it.product?.requiresDIFM),
          difficulty: it.product?.installationDifficulty || 'EASY',
        };
      }),
      hasDifficultParts: pricing.difmEvaluation.requiresDIFM,
      difficultItems: pricing.difmEvaluation.difficultItems,
    },
    pricing: {
      partSubtotal: pricing.partSubtotal,
      deliveryFee: pricing.deliveryFee,
      installationFee: pricing.installationFee,
      homeVisitSurcharge: pricing.homeVisitSurcharge,
      discount: pricing.discount,
      grandTotal: pricing.grandTotal,
      // Compatibility metadata
      baseInstallationFee: pricing.installationFee,
      appliedCoupon: pricing.appliedCoupon,
    },
    difm: {
      required: pricing.difmEvaluation.requiresDIFM,
      selectedType: pricing.resolvedDIFMType,
      assignedShop: assignedShop
        ? {
            id: assignedShop.id,
            name: assignedShop.name,
            address: assignedShop.address,
            city: assignedShop.city,
            pincode: assignedShop.pincode,
            phone: assignedShop.phone,
            rating: assignedShop.rating,
          }
        : null,
      distanceKm: pricing.distanceKm,
      durationMinutes: pricing.durationMinutes,
    },
    eligibleShops,
    selectedAddress: address
      ? {
          id: address.id,
          label: address.label,
          fullName: address.fullName,
          phone: address.phone,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          isDefault: address.isDefault,
        }
      : null,
  };
};

/**
 * Places order with strict backend-authoritative calculation.
 * Client cannot manipulate prices.
 * Products marked difficult-to-install MUST have an explicit DIFM option selected.
 */
export const createOrderDraft = async (
  userId: string,
  data: {
    addressId?: string;
    shippingAddressId?: string;
    difmType?: DIFMType | string;
    shopId?: string;
    paymentMethod: PaymentMethod | string;
    couponCode?: string;
    preferredDate?: string;
    notes?: string;
    // Any client-side total / subtotal / fee provided in data is completely ignored!
  }
) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart || !cart.items || cart.items.length === 0) {
    throw AppError.badRequest('Your shopping cart is empty.');
  }

  // Validate address
  const targetAddressId = data.addressId || data.shippingAddressId;
  if (!targetAddressId) {
    throw AppError.badRequest('Please provide a delivery address ID.');
  }

  const address = await prisma.address.findFirst({
    where: { id: targetAddressId, userId },
  });

  if (!address) {
    throw AppError.badRequest('Selected delivery address was not found.');
  }

  // Evaluate cart DIFM
  const difmEval = evaluateCartDIFM(cart.items);

  // ACCEPTANCE TEST REQUIREMENT:
  // "Difficult-install product cannot bypass required DIFM selection"
  if (difmEval.requiresDIFM) {
    if (
      !data.difmType ||
      (data.difmType !== 'HOME_INSTALLATION' &&
        data.difmType !== 'SHOP_INSTALLATION' &&
        data.difmType !== 'NO_INSTALLATION' &&
        data.difmType !== DIFMType.HOME_INSTALLATION &&
        data.difmType !== DIFMType.SHOP_INSTALLATION &&
        data.difmType !== DIFMType.NO_INSTALLATION)
    ) {
      throw AppError.badRequest(
        'One or more products in your cart require installation selection. Please choose Home Installation (Option A), Partnered Shop (Option B), or No Installation (Option C).'
      );
    }
  }

  // Resolve assigned partnered shop
  const customerLocation = (data as any).customerLatitude != null && (data as any).customerLongitude != null
    ? {
        latitude: Number((data as any).customerLatitude),
        longitude: Number((data as any).customerLongitude),
        city: address?.city,
        pincode: address?.pincode,
      }
    : address;

  const eligibleShops = await findEligiblePartneredShops(customerLocation);
  let assignedShop: any = null;
  const isHomeInstallation =
    data.difmType === 'HOME_INSTALLATION' ||
    data.difmType === 'HOME' ||
    data.difmType === DIFMType.HOME_INSTALLATION;

  if (isHomeInstallation) {
    if (data.shopId) {
      const requestedShop = eligibleShops.find((s: any) => s.id === data.shopId);
      if (requestedShop && (requestedShop.distanceKm || 0) <= 35) {
        assignedShop = requestedShop;
      }
    }
    if (!assignedShop && eligibleShops.length > 0) {
      assignedShop = eligibleShops[0];
    }
  } else if (data.shopId) {
    assignedShop = eligibleShops.find((s: any) => s.id === data.shopId) || null;
  }
  if (!assignedShop && eligibleShops.length > 0) {
    assignedShop = eligibleShops[0];
  }

  // Pre-Order Revalidation Matrix:
  // - Product still exists and is ACTIVE
  // - Inventory still exists and isAvailable
  // - Sufficient stock available
  // - Authoritative selling price matches cart priceSnapshot (return clear price-change response if changed)
  for (const it of cart.items) {
    const product = await prisma.product.findUnique({ where: { id: it.productId } });
    if (!product || product.status !== 'ACTIVE') {
      throw AppError.badRequest(
        `Product "${it.product?.name || 'Selected item'}" is no longer available. Please remove it from your cart.`,
        'PRODUCT_UNAVAILABLE'
      );
    }

    const inv = await prisma.inventory.findFirst({
      where: {
        productId: it.productId,
        ...(it.shopId ? { shopId: it.shopId } : {}),
      },
    });

    if (!inv || !inv.isAvailable) {
      throw AppError.badRequest(
        `Inventory for "${product.name}" is currently unavailable.`,
        'INVENTORY_UNAVAILABLE'
      );
    }

    const stock = Number(inv.quantity || 0);
    const requestedQty = Math.max(1, Number(it.quantity) || 1);
    if (stock < requestedQty) {
      throw AppError.badRequest(
        `Insufficient inventory for "${product.name}". Requested: ${requestedQty}, Available in stock: ${stock}. Please adjust quantity.`,
        'INSUFFICIENT_STOCK'
      );
    }

    // Price Integrity Revalidation:
    // If the inventory selling price changed since it was added to the cart,
    // return a clear price-change response so the customer can confirm the updated price.
    const currentSellingPrice = Number(inv.sellingPrice);
    const cartPriceSnapshot = Number(it.priceSnapshot);
    if (cartPriceSnapshot > 0 && Math.abs(cartPriceSnapshot - currentSellingPrice) > 0.01) {
      throw AppError.badRequest(
        `Price for "${product.name}" has changed from ₹${cartPriceSnapshot} to ₹${currentSellingPrice}. Please review your cart and confirm the updated price.`,
        'PRICE_CHANGED'
      );
    }
  }

  // Calculate authoritative pricing strictly on backend
  const pricing = await calculateAuthoritativePricing({
    cartItems: cart.items,
    difmType: data.difmType,
    customerAddress: address,
    shopLocation: assignedShop,
    couponCode: data.couponCode,
  });

  const orderNumber = generateOrderNumber();
  const isOnlinePayment =
    data.paymentMethod === PaymentMethod.RAZORPAY ||
    (data.paymentMethod as string) === 'ONLINE_PREPAID' ||
    (data.paymentMethod as string) === 'ONLINE';
  const resolvedPaymentMethod = isOnlinePayment ? PaymentMethod.RAZORPAY : PaymentMethod.CASH_ON_DELIVERY;

  const newOrder = await prisma.$transaction(async (tx: any) => {
    // Deduct stock atomically in database with concurrency safety
    for (const it of cart.items) {
      const inv = await tx.inventory.findFirst({
        where: {
          productId: it.productId,
          ...(it.shopId ? { shopId: it.shopId } : {}),
        },
      });
      const currentStock = inv ? Number(inv.quantity || 0) : 0;
      if (!inv || currentStock < it.quantity) {
        throw AppError.badRequest(
          `Insufficient inventory for "${it.product?.name || 'Selected product'}". Requested: ${it.quantity}, Available in stock: ${currentStock}. Please adjust quantity.`
        );
      }
      const newQty = currentStock - it.quantity;
      await tx.inventory.update({
        where: { id: inv.id },
        data: {
          quantity: newQty,
          isAvailable: newQty > 0,
          availabilityStatus: newQty > 0 ? (newQty <= 5 ? 'LOW_STOCK' : 'IN_STOCK') : 'OUT_OF_STOCK',
          updatedAt: new Date(),
        },
      });
    }

    const initialOrderStatus = isOnlinePayment ? OrderStatus.PENDING : OrderStatus.CONFIRMED;
    const initialPaymentStatus = PaymentStatus.PENDING;
    const razorpayOrderId = isOnlinePayment
      ? `order_rzp_sandbox_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
      : null;
    const trackingMsg = isOnlinePayment
      ? 'Order created. Awaiting Razorpay Sandbox payment verification.'
      : 'Order placed successfully with Cash on Delivery (Payment pending on delivery/fitment).';

    const createdOrder = await tx.order.create({
      data: {
        orderNumber,
        userId,
        addressId: targetAddressId!,
        status: initialOrderStatus,
        paymentMethod: resolvedPaymentMethod,
        paymentStatus: initialPaymentStatus,
        subtotal: pricing.partSubtotal,
        deliveryFee: pricing.deliveryFee,
        discount: pricing.discount,
        installationFee: pricing.installationFee,
        homeVisitSurcharge: pricing.homeVisitSurcharge,
        total: pricing.grandTotal,
        couponCode: data.couponCode || null,
        notes: data.notes || null,
        difmType: pricing.resolvedDIFMType,
        items: {
          create: cart.items.map((it: any) => {
            const unitPrice = resolveItemUnitPrice(it);
            return {
              productId: it.productId,
              shopId: it.shopId,
              quantity: it.quantity,
              unitPrice: unitPrice,
              totalPrice: unitPrice * it.quantity,
            };
          }),
        },
        payment: {
          create: {
            method: resolvedPaymentMethod,
            amount: pricing.grandTotal,
            status: initialPaymentStatus,
            razorpayOrderId,
          },
        },
        tracking: {
          create: {
            status: initialOrderStatus,
            message: trackingMsg,
          },
        },
        ...(pricing.resolvedDIFMType !== DIFMType.NO_INSTALLATION
          ? {
              difmRequest: {
                create: {
                  shopId: assignedShop?.id || null,
                  type: pricing.resolvedDIFMType,
                  status: DIFMStatus.PENDING,
                  installationFee: pricing.installationFee,
                  homeVisitSurcharge: pricing.homeVisitSurcharge,
                  preferredDate: data.preferredDate
                    ? new Date(data.preferredDate)
                    : new Date(Date.now() + 86400000 * 2), // 2 days from now
                  notes: data.notes || null,
                },
              },
            }
          : {}),
      },
    });

    // Clear cart items immediately for Cash on Delivery (since COD orders are immediately CONFIRMED).
    // For online Razorpay payments, cart items are cleared authoritatively upon backend verification
    // so the customer doesn't lose their cart if the payment window is cancelled or declined.
    if (!isOnlinePayment) {
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return createdOrder;
  });

  // Log authoritative inventory stock deduction events
  for (const it of cart.items) {
    const inv = await prisma.inventory.findFirst({
      where: {
        productId: it.productId,
        ...(it.shopId ? { shopId: it.shopId } : {}),
      },
    });
    const currentStock = inv ? Number(inv.quantity) : 0;
    await InventorySyncEngine.recordOrderDeduction(
      it.productId,
      it.shopId || inv?.shopId || 'shop-1',
      it.quantity,
      currentStock + it.quantity,
      currentStock,
      newOrder.id,
      userId
    );
  }

  // Trigger real-time platform propagation for immediately confirmed COD orders asynchronously
  if (!isOnlinePayment) {
    setImmediate(async () => {
      try {
        await propagateOrderConfirmed(newOrder.id);
      } catch (propErr) {
        console.warn('Background order propagation warning for COD order:', propErr);
      }
    });
  }

  return getOrderById(userId, newOrder.id);
};

export const getOrderTracking = async (orderId: string) => {
  return prisma.orderTracking.findMany({
    where: { orderId },
    orderBy: { createdAt: 'asc' },
  });
};

