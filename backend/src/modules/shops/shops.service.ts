import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';
import { generateAccessToken } from '../../utils/jwt';
import { InventorySyncEngine } from '../inventory/inventorySync.service';
import { UsedPartStatus } from '@prisma/client';
import { createNotification } from '../notifications/notifications.service';
import { calculateUsedPartValuation } from '../usedparts/usedpartsValuation.service';
import { sanitizeForInstaller } from '../services/installationCompletion.service';

// Helper to resolve shop from authenticated owner
export const resolveShopByOwner = async (ownerId: string) => {
  let shop = await prisma.shop.findFirst({
    where: { ownerId },
  });
  if (!shop && (ownerId === 'shop-owner-official' || ownerId === 'shop-owner-1')) {
    shop = await prisma.shop.findFirst({ where: { id: 'shop-1' } });
  }
  if (!shop) {
    throw AppError.notFound('No workshop is associated with this account. Please register your workshop first or contact support.');
  }
  return shop;
};


export const listVerifiedShops = async (city?: string) => {
  const shops = await prisma.shop.findMany({
    where: {
      isVerified: true,
      isActive: true,
      ...(city && { city: { equals: city, mode: 'insensitive' } }),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      phone: true,
      email: true,
      city: true,
      state: true,
      pincode: true,
      rating: true,
      totalRatings: true,
      serviceAvailable: true,
      logoUrl: true,
      bannerUrl: true,
      addressLine1: true,
      addressLine2: true,
      latitude: true,
      longitude: true,
      isVerified: true,
      isActive: true,
    },
    orderBy: { rating: 'desc' },
  });

  return shops.map((s: any) => ({
    ...s,
    address: s.addressLine1
      ? `${s.addressLine1}${s.addressLine2 ? ', ' + s.addressLine2 : ''}, ${s.city}`
      : s.city,
    supportedDIFMTypes: ['HOME_INSTALLATION', 'SHOP_INSTALLATION'],
    servicesOffered: ['Brakes & Suspension', 'Battery & Electrical', 'Oil & Filter Change', 'General Service', 'Tire Fitment'],
    vehicleCategories: ['Car', 'Bike', 'Scooter'],
    commissionRate: 12.0,
    installationFee: 250,
  }));
};

export const getShopBySlug = async (slug: string) => {
  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: {
      owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      inventories: {
        where: { isAvailable: true },
        include: { product: { include: { images: true } } },
        take: 20,
      },
    },
  });
  if (!shop) throw AppError.notFound('Shop not found.');
  return shop;
};

// ============================================================================
// SHOP ONBOARDING & AUTHENTICATION
// ============================================================================

export const registerShop = async (data: {
  name: string;
  ownerFirstName: string;
  ownerLastName: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  city: string;
  state?: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  servicesOffered?: string[];
  vehicleCategories?: string[];
  commissionRate?: number;
  operatingHours?: string;
}) => {
  if (!data.name || !data.email || !data.password || !data.phone || !data.address || !data.city || !data.pincode) {
    throw AppError.badRequest('Missing required shop registration details.');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });
  if (existingUser) {
    throw AppError.conflict('An account with this email address already exists.');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newUser = await prisma.user.create({
    data: {
      firstName: data.ownerFirstName || data.name.split(' ')[0],
      lastName: data.ownerLastName || 'Owner',
      email: data.email.toLowerCase(),
      password: hashedPassword,
      phone: data.phone,
      role: 'SHOP_OWNER',
      status: 'ACTIVE',
    },
  });

  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const rate = data.commissionRate ? Math.max(10, Math.min(15, Number(data.commissionRate))) : 12;

  const newShop = await prisma.shop.create({
    data: {
      name: data.name,
      slug,
      ownerId: newUser.id,
      ownerName: `${newUser.firstName} ${newUser.lastName}`,
      email: data.email.toLowerCase(),
      phone: data.phone,
      address: data.address,
      addressLine1: data.address,
      city: data.city,
      state: data.state || 'Karnataka',
      pincode: data.pincode,
      latitude: data.latitude ? Number(data.latitude) : 12.9716,
      longitude: data.longitude ? Number(data.longitude) : 77.5946,
      servicesOffered: data.servicesOffered || ['Brake Fitment', 'Battery Replacement', 'Doorstep Mechanic'],
      vehicleCategories: data.vehicleCategories || ['CAR', 'BIKE', 'SCOOTER'],
      commissionRate: rate,
      verificationStatus: 'VERIFIED',
      isVerified: true,
      operatingHours: data.operatingHours || '08:30 AM - 08:30 PM',
      supportedDIFMTypes: ['HOME_INSTALLATION', 'SHOP_INSTALLATION'],
    },
  });

  const token = generateAccessToken({
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
  });

  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
    },
    shop: newShop,
    token,
  };
};

export const loginShop = async (data: { email: string; password: string }) => {
  if (!data.email || !data.password) {
    throw AppError.badRequest('Email and password are required.');
  }

  const user = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (!user) {
    throw AppError.unauthorized('Invalid email or password.');
  }

  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) {
    throw AppError.unauthorized('Invalid email or password.');
  }

  let shop = await prisma.shop.findFirst({
    where: { ownerId: user.id },
  });

  if (!shop && (user.id === 'shop-owner-official' || user.id === 'shop-owner-1')) {
    shop = await prisma.shop.findFirst({
      where: { id: 'shop-1' },
    });
  }

  if (!shop) {
    throw AppError.forbidden('No mechanical shop is registered for this account. Please register your workshop at /shop/register.');
  }

  const token = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    shop,
    token,
    accessToken: token,
    refreshToken: token,
  };
};

// ============================================================================
// PROFILE & SHOP SETTINGS
// ============================================================================

export const getShopProfile = async (ownerId: string) => {
  const shop = await resolveShopByOwner(ownerId);
  const owner = await prisma.user.findUnique({
    where: { id: shop.ownerId || ownerId },
    select: { id: true, firstName: true, lastName: true, email: true, phone: true },
  });
  return { ...shop, owner };
};

export const updateShopProfile = async (ownerId: string, data: any) => {
  const shop = await resolveShopByOwner(ownerId);
  const updated = await prisma.shop.update({
    where: { id: shop.id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.phone && { phone: data.phone }),
      ...(data.operatingHours && { operatingHours: data.operatingHours }),
      ...(data.servicesOffered && { servicesOffered: data.servicesOffered }),
      ...(data.vehicleCategories && { vehicleCategories: data.vehicleCategories }),
      ...(data.commissionRate !== undefined && { commissionRate: Math.max(10, Math.min(15, Number(data.commissionRate))) }),
      ...(data.address && { address: data.address, addressLine1: data.address }),
      ...(data.city && { city: data.city }),
      ...(data.state && { state: data.state }),
      ...(data.pincode && { pincode: data.pincode }),
      ...(data.latitude !== undefined && { latitude: Number(data.latitude) }),
      ...(data.longitude !== undefined && { longitude: Number(data.longitude) }),
    },
  });
  return updated;
};

// ============================================================================
// SHOP DASHBOARD & METRICS
// ============================================================================

export const getShopDashboard = async (ownerId: string) => {
  const shop = await resolveShopByOwner(ownerId);

  const [jobs, deliveries, intakes, ledgers, realDifmRequests] = await Promise.all([
    prisma.shopJob.findMany({ where: { shopId: shop.id } }).catch(() => []),
    prisma.shopDelivery.findMany({ where: { shopId: shop.id } }).catch(() => []),
    prisma.usedPartIntake.findMany({ where: { shopId: shop.id } }).catch(() => []),
    prisma.commissionLedger.findMany({ where: { shopId: shop.id } }).catch(() => []),
    (prisma.difmRequest || (prisma as any).dIFMRequest).findMany({
      where: { shopId: shop.id },
      include: {
        order: {
          include: {
            user: { select: { firstName: true, lastName: true, phone: true } },
            address: true,
            items: { include: { product: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }).catch(() => []),
  ]);

  const mappedDifmJobs = (realDifmRequests || []).map((d: any) => ({
    id: d.id,
    orderId: d.orderId,
    orderNumber: d.order?.orderNumber,
    customerName: d.order?.user ? `${d.order.user.firstName} ${d.order.user.lastName}`.trim() : (d.order?.address?.fullName || 'Customer'),
    customerPhone: d.order?.user?.phone || d.order?.address?.phone,
    vehicleInfo: 'Customer Vehicle',
    partName: d.order?.items?.[0]?.product?.name || 'Automotive Component',
    jobType: d.type === 'SHOP_INSTALLATION' ? 'DIFM_SHOP_VISIT' : 'DIFM_DOORSTEP_VISIT',
    status: d.status || 'SCHEDULED',
    installationFee: Number(d.installationFee || 250),
    preferredDate: d.preferredDate || d.createdAt,
    customerAddress: d.order?.address ? `${d.order.address.line1}, ${d.order.address.city}` : null,
  }));

  const combinedJobs = [...mappedDifmJobs, ...jobs];

  const scheduled = combinedJobs.filter((j: any) => j.status === 'SCHEDULED').length;
  const accepted = combinedJobs.filter((j: any) => j.status === 'ACCEPTED').length;
  const inProgress = combinedJobs.filter((j: any) => j.status === 'IN_PROGRESS').length;
  const completed = combinedJobs.filter((j: any) => j.status === 'COMPLETED').length;
  const cancelled = combinedJobs.filter((j: any) => j.status === 'CANCELLED').length;

  const vehicleVisits = combinedJobs.filter(
    (j: any) => j.jobType === 'DIFM_SHOP_VISIT' || j.jobType === 'CUSTOMER_VEHICLE_VISIT'
  ).length;

  // Compute Commission Metrics
  let totalGross = 0;
  let platformCut = 0;
  let netEarnings = 0;
  let releasedForPayout = 0;
  let lockedPendingCompletion = 0;
  let lockedPendingPayment = 0;
  let alreadyPaidOut = 0;

  for (const c of ledgers) {
    const gross = Number(c.grossAmount || 0);
    const comm = Number(c.commissionAmount || 0);
    const payout = Number(c.shopPayout || 0);

    totalGross += gross;
    platformCut += comm;
    netEarnings += payout;

    if (c.payoutStatus === 'PAID_OUT') {
      alreadyPaidOut += payout;
    } else if (c.releaseStatus === 'RELEASED') {
      releasedForPayout += payout;
    } else if (c.releaseStatus === 'LOCKED_PENDING_PAYMENT') {
      lockedPendingPayment += payout;
    } else {
      lockedPendingCompletion += payout;
    }
  }

  // Today's upcoming services
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingToday = jobs
    .filter((j: any) => {
      if (!j.scheduledDate) return false;
      const jDate = new Date(j.scheduledDate).toISOString().split('T')[0];
      return jDate === todayStr && j.status !== 'COMPLETED' && j.status !== 'CANCELLED';
    })
    .slice(0, 5);

  return {
    shop: {
      id: shop.id,
      name: shop.name,
      rating: shop.rating,
      verificationStatus: shop.verificationStatus || 'VERIFIED',
      commissionRate: shop.commissionRate || 12,
      servicesOffered: shop.servicesOffered || [],
      vehicleCategories: shop.vehicleCategories || [],
      address: shop.address,
      city: shop.city,
    },
    jobStatusCounts: {
      scheduled,
      accepted,
      inProgress,
      completed,
      cancelled,
      total: jobs.length,
    },
    deliveries: {
      total: deliveries.length,
      pending: deliveries.filter((d: any) => d.status !== 'DELIVERED').length,
      recent: deliveries.slice(0, 4),
    },
    usedPartsIntake: {
      total: intakes.length,
      pendingVerification: intakes.filter((i: any) => i.technicalTestStatus === 'NEEDS_TESTING').length,
      recent: intakes.slice(0, 4),
    },
    customerVehicleVisits: vehicleVisits,
    upcomingToday: sanitizeForInstaller(upcomingToday),
    recentJobs: sanitizeForInstaller(combinedJobs.slice(0, 10)),
    earnings: {
      totalGross,
      platformCut,
      netEarnings,
      releasedForPayout,
      lockedPendingCompletion,
      lockedPendingPayment,
      alreadyPaidOut,
      commissionRate: shop.commissionRate || 12,
    },
  };
};

// ============================================================================
// SERVICE CALENDAR & JOB LIFECYCLE
// ============================================================================

export const getServiceCalendar = async (
  ownerId: string,
  query: { status?: string; date?: string; jobType?: string }
) => {
  const shop = await resolveShopByOwner(ownerId);
  const jobs = await prisma.shopJob.findMany({
    where: {
      shopId: shop.id,
      ...(query.status && { status: query.status }),
      ...(query.jobType && { jobType: query.jobType }),
    },
    orderBy: { scheduledDate: 'asc' },
  });

  if (query.date) {
    const target = query.date;
    const filtered = jobs.filter((j: any) => {
      const d = new Date(j.scheduledDate).toISOString().split('T')[0];
      return d === target;
    });
    return sanitizeForInstaller(filtered);
  }

  return sanitizeForInstaller(jobs);
};

export const updateJobStatus = async (
  ownerId: string,
  jobId: string,
  status: string,
  notes?: string
) => {
  const shop = await resolveShopByOwner(ownerId);
  const job = await prisma.shopJob.findUnique({
    where: { id: jobId },
  });

  if (!job || job.shopId !== shop.id) {
    throw AppError.notFound('Job not found for this shop.');
  }

  const validStatuses = ['SCHEDULED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    throw AppError.badRequest(`Invalid job status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const updatePayload: any = {
    status,
    ...(notes && { notes: notes }),
  };

  if (status === 'IN_PROGRESS' && !job.startedAt) {
    updatePayload.startedAt = new Date();
  } else if (status === 'COMPLETED') {
    // Security Guard: Installation jobs require customer confirmation code
    const isInstallationJob = Boolean(
      job.difmRequestId ||
      (job.jobType && job.jobType.includes('DIFM')) ||
      (job.serviceName && job.serviceName.toLowerCase().includes('installation'))
    );

    if (isInstallationJob) {
      const booking = job.difmRequestId
        ? await prisma.serviceBooking.findUnique({ where: { difmRequestId: job.difmRequestId } })
        : (job.orderId ? await prisma.serviceBooking.findFirst({ where: { difmRequest: { orderId: job.orderId } } }) : null);

      if (booking && !booking.isCompleted) {
        throw AppError.badRequest(
          'Installation jobs require customer confirmation code to mark completed. Please use [Verify & Complete] with the customer\'s 6-digit code.'
        );
      }
    }
    updatePayload.completedAt = new Date();
  }

  const updatedJob = await prisma.shopJob.update({
    where: { id: jobId },
    data: updatePayload,
  });

  // Sync related DIFM request status if exists
  if (job.difmRequestId) {
    await prisma.difmRequest.update({
      where: { id: job.difmRequestId },
      data: {
        status: status === 'COMPLETED' ? 'COMPLETED' : status === 'CANCELLED' ? 'CANCELLED' : 'ACCEPTED',
      },
    });
  }

  // Push tracking update to Customer order
  if (job.orderId) {
    try {
      if (status === 'IN_PROGRESS') {
        await prisma.orderTracking.create({
          data: {
            orderId: job.orderId,
            status: 'PROCESSING',
            message: `Workshop technician at ${shop.name} has started part installation.`,
          },
        });
      } else if (status === 'COMPLETED') {
        await prisma.orderTracking.create({
          data: {
            orderId: job.orderId,
            status: 'DELIVERED',
            message: `DIFM professional part installation completed and tested by ${shop.name}.`,
          },
        });
      }
    } catch {}
  }

  // Fetch updated commission ledger status
  const commissionEntry = await prisma.commissionLedger.findFirst({
    where: { jobId },
  });

  // Auto-update job commission release if conditions met
  if (status === 'COMPLETED' && commissionEntry && commissionEntry.releaseStatus !== 'RELEASED') {
    await prisma.commissionLedger.update({
      where: { id: commissionEntry.id },
      data: { serviceStatus: 'COMPLETED' },
    });
    // Check if payment is also cleared - if so, release commission
    const updatedLedger = await prisma.commissionLedger.findUnique({ where: { id: commissionEntry.id } });
    if (updatedLedger && updatedLedger.paymentStatus === 'CAPTURED') {
      await prisma.commissionLedger.update({
        where: { id: commissionEntry.id },
        data: { releaseStatus: 'RELEASED', payoutStatus: 'RELEASED' },
      });
    }
  }

  return {
    job: updatedJob,
    commissionStatus: commissionEntry
      ? {
          id: commissionEntry.id,
          grossAmount: commissionEntry.grossAmount,
          shopPayout: commissionEntry.shopPayout,
          commissionAmount: commissionEntry.commissionAmount,
          serviceStatus: commissionEntry.serviceStatus,
          paymentStatus: commissionEntry.paymentStatus,
          releaseStatus: commissionEntry.releaseStatus,
          payoutStatus: commissionEntry.payoutStatus,
        }
      : null,
  };
};

// ============================================================================
// COMMISSION SYSTEM & LEDGER
// ============================================================================

export const getCommissionLedger = async (ownerId: string) => {
  const shop = await resolveShopByOwner(ownerId);
  const items = await prisma.commissionLedger.findMany({
    where: { shopId: shop.id },
  });

  let totalGross = 0;
  let platformCommission = 0;
  let netEarnings = 0;
  let releasedForPayout = 0;
  let lockedPendingCompletion = 0;
  let lockedPendingPayment = 0;
  let alreadyPaidOut = 0;

  for (const c of items) {
    const gross = Number(c.grossAmount || 0);
    const comm = Number(c.commissionAmount || 0);
    const payout = Number(c.shopPayout || 0);

    totalGross += gross;
    platformCommission += comm;
    netEarnings += payout;

    if (c.payoutStatus === 'PAID_OUT') {
      alreadyPaidOut += payout;
    } else if (c.releaseStatus === 'RELEASED') {
      releasedForPayout += payout;
    } else if (c.releaseStatus === 'LOCKED_PENDING_PAYMENT') {
      lockedPendingPayment += payout;
    } else {
      lockedPendingCompletion += payout;
    }
  }

  return {
    shopId: shop.id,
    shopName: shop.name,
    commissionRate: shop.commissionRate || 12,
    summary: {
      totalGross,
      platformCommission,
      netEarnings,
      releasedForPayout,
      lockedPendingCompletion,
      lockedPendingPayment,
      alreadyPaidOut,
    },
    items,
  };
};

export const requestCommissionPayout = async (ownerId: string) => {
  const shop = await resolveShopByOwner(ownerId);
  const items = await prisma.commissionLedger.findMany({
    where: {
      shopId: shop.id,
      releaseStatus: 'RELEASED',
      payoutStatus: 'RELEASED',
    },
  });

  if (!items.length) {
    throw AppError.badRequest(
      'No released commissions are currently eligible for payout. Strict Rule: Commission is ONLY released after BOTH service is completed AND customer payment has cleared.'
    );
  }

  const totalPayout = items.reduce((sum: number, it: any) => sum + Number(it.shopPayout || 0), 0);
  const payoutRef = 'PO-APX-' + Math.floor(100000 + Math.random() * 900000);
  const paidAt = new Date();

  for (const it of items) {
    await prisma.commissionLedger.update({
      where: { id: it.id },
      data: {
        payoutStatus: 'PAID_OUT',
        payoutRef,
        paidAt,
      },
    });
  }

  return {
    success: true,
    message: `Payout request of ₹${totalPayout.toLocaleString('en-IN')} approved and settled successfully.`,
    payoutRef,
    totalPayout,
    itemsCount: items.length,
    settledAt: paidAt,
  };
};

// ============================================================================
// INCOMING DELIVERIES
// ============================================================================

export const listIncomingDeliveries = async (ownerId: string) => {
  const shop = await resolveShopByOwner(ownerId);
  return prisma.shopDelivery.findMany({
    where: { shopId: shop.id },
  });
};

export const receiveDelivery = async (
  ownerId: string,
  deliveryId: string,
  receivedBy: string
) => {
  const shop = await resolveShopByOwner(ownerId);
  const del = await prisma.shopDelivery.findUnique({
    where: { id: deliveryId },
  });

  if (!del || del.shopId !== shop.id) {
    throw AppError.notFound('Delivery record not found.');
  }

  const updated = await prisma.shopDelivery.update({
    where: { id: deliveryId },
    data: {
      status: 'DELIVERED',
      receivedAt: new Date(),
      receivedBy: receivedBy || 'Shop Inventory Manager',
    },
  });

  return updated;
};

// ============================================================================
// USED-PART INTAKE & VERIFICATION
// ============================================================================

export const listUsedPartIntakes = async (ownerId: string) => {
  const shop = await resolveShopByOwner(ownerId);
  const intakes = await prisma.usedPartIntake.findMany({
    where: { shopId: shop.id },
    include: {
      listing: {
        include: {
          seller: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true },
          },
        },
      },
      shop: {
        select: { id: true, name: true, city: true, address: true, phone: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Ensure any listings assigned to this shop have an intake record
  const assignedListings = await prisma.usedPartListing.findMany({
    where: { assignedShopId: shop.id },
    include: {
      seller: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      },
    },
  });

  const existingListingIds = new Set(intakes.map((i: any) => i.listingId).filter(Boolean));
  for (const l of assignedListings) {
    if (!existingListingIds.has(l.id)) {
      const sellerName = l.seller ? `${l.seller.firstName || ''} ${l.seller.lastName || ''}`.trim() : 'Customer Seller';
      const created = await prisma.usedPartIntake.create({
        data: {
          shopId: shop.id,
          listingId: l.id,
          partTitle: l.title,
          sellerName,
          vehicleModel: l.description?.match(/Vehicle: (.*)/)?.[1] || 'Universal',
          status: 'GARAGE_ASSIGNED',
          physicalCondition: l.condition || 'GOOD',
          technicalTestStatus: 'NEEDS_TESTING',
          technicianNotes: `Awaiting customer ${l.deliveryMethod === 'PICKUP' ? 'courier delivery' : 'drop-off'} at ${shop.name}.`,
        },
        include: {
          listing: {
            include: {
              seller: {
                select: { id: true, firstName: true, lastName: true, email: true, phone: true },
              },
            },
          },
          shop: {
            select: { id: true, name: true, city: true, address: true, phone: true },
          },
        },
      });
      intakes.unshift(created);
      existingListingIds.add(l.id);
    }
  }

  return intakes;
};

export const receiveUsedPart = async (ownerId: string, intakeId: string) => {
  const shop = await resolveShopByOwner(ownerId);
  const intake = await prisma.usedPartIntake.findFirst({
    where: { id: intakeId, shopId: shop.id },
    include: { listing: { include: { seller: true } } },
  });

  if (!intake) {
    throw AppError.notFound('Used part intake record not found in your workshop queue.');
  }

  const updated = await prisma.usedPartIntake.update({
    where: { id: intake.id },
    data: {
      status: 'PART_RECEIVED',
      receivedAt: new Date(),
    },
    include: { listing: { include: { seller: true } }, shop: true },
  });

  if (intake.listing?.sellerId) {
    try {
      await createNotification({
        userId: intake.listing.sellerId,
        title: 'Used Part Received at Workshop',
        body: `Partner garage "${shop.name}" has confirmed receipt of your part "${intake.partTitle}". Technical inspection will begin shortly.`,
        channel: 'IN_APP',
        status: 'DELIVERED',
        data: {
          route: '/customer/used-parts',
          listingId: intake.listing.id,
          intakeId: intake.id,
          type: 'USED_PART_RECEIVED_AT_GARAGE',
        },
      });
    } catch (e) {
      console.warn('[ShopsService] Notification error:', e);
    }
  }

  return updated;
};

export const recordUsedPartIntake = async (ownerId: string, data: any) => {
  const shop = await resolveShopByOwner(ownerId);
  const intakeId = data.intakeId || data.id;

  let existingIntake: any = null;
  if (intakeId) {
    existingIntake = await prisma.usedPartIntake.findFirst({
      where: { id: intakeId, shopId: shop.id },
      include: { listing: { include: { seller: true } } },
    });
  } else if (data.listingId) {
    existingIntake = await prisma.usedPartIntake.findFirst({
      where: { listingId: data.listingId, shopId: shop.id },
      include: { listing: { include: { seller: true } } },
    });
  }

  const physicalConditionRating = Math.min(Math.max(1, Number(data.physicalConditionRating) || 4), 5);
  const functionalTestRating = Math.min(Math.max(1, Number(data.functionalTestRating) || 4), 5);
  const wearLevelRating = Math.min(Math.max(1, Number(data.wearLevelRating) || 3), 5);
  const safetyConfidenceRating = Math.min(Math.max(1, Number(data.safetyConfidenceRating) || 5), 5);

  const technicalResult = data.technicalResult || (data.technicalTestStatus === 'DEFECTIVE' ? 'FAILED' : 'PASSED');

  // Compute Valuation from PartNexa catalog reference price
  const valuation = await calculateUsedPartValuation({
    physicalConditionRating,
    functionalTestRating,
    wearLevelRating,
    safetyConfidenceRating,
    technicalResult,
    repairEstimatedCost: data.repairEstimatedCost ? Number(data.repairEstimatedCost) : undefined,
    catalogProductId: existingIntake?.listing?.productId,
    partNumber: data.partNumber || existingIntake?.partNumber,
    partTitle: data.partTitle || existingIntake?.partTitle,
    askingPrice: existingIntake?.listing ? Number(existingIntake.listing.askingPrice) : undefined,
  });

  const photos = Array.isArray(data.photos) ? data.photos : (data.photos ? [data.photos] : (existingIntake?.photos || []));

  const updateFields: any = {
    partTitle: data.partTitle || existingIntake?.partTitle || 'Used Auto Component',
    sellerName: data.sellerName || existingIntake?.sellerName || 'Customer Seller',
    vehicleModel: data.vehicleModel || existingIntake?.vehicleModel || 'Universal',
    partNumber: data.partNumber || existingIntake?.partNumber || null,
    vehicleCompatibility: data.vehicleCompatibility || existingIntake?.vehicleCompatibility || null,
    physicalConditionRating,
    functionalTestRating,
    wearLevelRating,
    safetyConfidenceRating,
    overallGrade: valuation.overallGrade,
    visualDamage: data.visualDamage || null,
    corrosionLevel: data.corrosionLevel || 'NONE',
    mountingPointsOk: data.mountingPointsOk !== false,
    electricalWorking: data.electricalWorking !== false,
    benchTestNotes: data.benchTestNotes || null,
    safetyTestNotes: data.safetyTestNotes || null,
    repairRequired: Boolean(data.repairRequired),
    repairNotes: data.repairNotes || null,
    photos,
    technicianNotes: data.technicianNotes || 'Structured technical inspection completed by partner garage.',
    inspectorName: data.inspectorName || 'Workshop Technician',
    technicalResult,
    inspectionScore: valuation.inspectionScore,
    referenceNewPrice: valuation.referenceNewPrice,
    recommendedResaleMin: valuation.recommendedResaleMin,
    recommendedResaleMax: valuation.recommendedResaleMax,
    recommendedListingPrice: valuation.recommendedListingPrice,
    recommendedSellerPayout: valuation.recommendedSellerPayout,
    inspectedAt: new Date(),
    status: technicalResult === 'FAILED' ? 'REJECTED_FAILED_INSPECTION' : 'OFFER_PENDING_CUSTOMER',
    technicalTestStatus: technicalResult === 'FAILED' ? 'FAILED' : 'PASSED',
    physicalCondition: valuation.overallGrade === 'A' ? 'EXCELLENT' : (valuation.overallGrade === 'B' ? 'GOOD' : 'FAIR'),
  };

  let savedIntake: any;
  if (existingIntake) {
    savedIntake = await prisma.usedPartIntake.update({
      where: { id: existingIntake.id },
      data: updateFields,
      include: { listing: { include: { seller: true } }, shop: true },
    });
  } else {
    // If recording a new intake directly from workshop
    // DO NOT generate fake listing ID!
    savedIntake = await prisma.usedPartIntake.create({
      data: {
        shopId: shop.id,
        listingId: data.listingId || null,
        ...updateFields,
      },
      include: { listing: { include: { seller: true } }, shop: true },
    });
  }

  // Update associated listing if present
  if (savedIntake.listing) {
    await prisma.usedPartListing.update({
      where: { id: savedIntake.listing.id },
      data: {
        status: technicalResult === 'FAILED' ? UsedPartStatus.REJECTED : 'OFFER_READY',
        conditionGrade: valuation.overallGrade,
        resalePrice: valuation.recommendedListingPrice,
        estimatedValuation: valuation.recommendedListingPrice,
        finalValuation: valuation.recommendedListingPrice,
      },
    });

    await prisma.usedPartVerification.upsert({
      where: { listingId: savedIntake.listing.id },
      create: {
        listingId: savedIntake.listing.id,
        conditionRating: Math.round(valuation.inspectionScore / 10),
        notes: `Workshop Inspection [${shop.name}]: Grade ${valuation.overallGrade} (${valuation.inspectionScore}/100). Technical result: ${technicalResult}. ${data.technicianNotes || ''}`,
        approvedAt: technicalResult !== 'FAILED' ? new Date() : null,
        rejectedAt: technicalResult === 'FAILED' ? new Date() : null,
        rejectionReason: technicalResult === 'FAILED' ? (data.technicianNotes || 'Failed technical safety check') : null,
      },
      update: {
        conditionRating: Math.round(valuation.inspectionScore / 10),
        notes: `Workshop Inspection [${shop.name}]: Grade ${valuation.overallGrade} (${valuation.inspectionScore}/100). Technical result: ${technicalResult}. ${data.technicianNotes || ''}`,
        approvedAt: technicalResult !== 'FAILED' ? new Date() : null,
        rejectedAt: technicalResult === 'FAILED' ? new Date() : null,
        rejectionReason: technicalResult === 'FAILED' ? (data.technicianNotes || 'Failed technical safety check') : null,
      },
    });

    // Notify customer that valuation & offer are ready
    if (savedIntake.listing.sellerId) {
      try {
        if (technicalResult !== 'FAILED') {
          await createNotification({
            userId: savedIntake.listing.sellerId,
            title: 'Technical Inspection Complete — Offer Ready!',
            body: `Inspection complete by ${shop.name}! Grade: ${valuation.overallGrade} (${valuation.inspectionScore}/100). Recommended resale: ₹${valuation.recommendedListingPrice}. Expected payout offer: ₹${valuation.recommendedSellerPayout}. Review offer now.`,
            channel: 'IN_APP',
            status: 'DELIVERED',
            data: {
              route: '/customer/used-parts',
              listingId: savedIntake.listing.id,
              intakeId: savedIntake.id,
              type: 'USED_PART_OFFER_READY',
            },
          });
        } else {
          await createNotification({
            userId: savedIntake.listing.sellerId,
            title: 'Part Inspection Failed Quality Standards',
            body: `Your part "${savedIntake.partTitle}" did not pass safety/functional tests at ${shop.name}. Notes: ${data.technicianNotes || 'Component failed bench testing.'}`,
            channel: 'IN_APP',
            status: 'DELIVERED',
            data: {
              route: '/customer/used-parts',
              listingId: savedIntake.listing.id,
              intakeId: savedIntake.id,
              type: 'USED_PART_INSPECTION_FAILED',
            },
          });
        }
      } catch (notifErr) {
        console.warn('[ShopsService] Notification error:', notifErr);
      }
    }
  }

  return savedIntake;
};

// ============================================================================
// SHOP SUPPORT TICKETS
// ============================================================================

export const listShopTickets = async (ownerId: string) => {
  const shop = await resolveShopByOwner(ownerId);
  return prisma.shopTicket.findMany({
    where: { shopId: shop.id },
  });
};

export const createShopTicket = async (
  ownerId: string,
  data: { category: string; subject: string; priority?: string; message: string }
) => {
  const shop = await resolveShopByOwner(ownerId);
  if (!data.category || !data.subject || !data.message) {
    throw AppError.badRequest('Category, subject, and message are required.');
  }

  const newTicket = await prisma.shopTicket.create({
    data: {
      shopId: shop.id,
      category: data.category,
      subject: data.subject,
      priority: data.priority || 'MEDIUM',
      status: 'OPEN',
      messages: [
        {
          id: 'msg-' + Date.now(),
          senderName: shop.ownerName || 'Shop Owner',
          senderRole: 'SHOP_OWNER',
          message: data.message,
          createdAt: new Date(),
        },
      ],
    },
  });

  return newTicket;
};

export const addTicketMessage = async (
  ownerId: string,
  ticketId: string,
  message: string,
  senderName?: string
) => {
  const shop = await resolveShopByOwner(ownerId);
  const ticket = await prisma.shopTicket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket || ticket.shopId !== shop.id) {
    throw AppError.notFound('Support ticket not found.');
  }

  const updatedMessages = [
    ...(ticket.messages || []),
    {
      id: 'msg-' + Date.now(),
      senderName: senderName || shop.ownerName || 'Shop Owner',
      senderRole: 'SHOP_OWNER',
      message,
      createdAt: new Date(),
    },
  ];

  const updated = await prisma.shopTicket.update({
    where: { id: ticketId },
    data: {
      messages: updatedMessages,
      status: ticket.status === 'RESOLVED' ? 'IN_PROGRESS' : ticket.status,
    },
  });

  return updated;
};

// ============================================================================
// SHOP INVENTORY MANAGEMENT
// ============================================================================

export const getShopInventory = async (ownerId: string) => {
  const shop = await resolveShopByOwner(ownerId);
  const inventories = await prisma.inventory.findMany({
    where: { shopId: shop.id },
  });

  // Enrich with product details
  const enriched = await Promise.all(
    inventories.map(async (inv: any) => {
      const prod = await prisma.product.findUnique({
        where: { id: inv.productId },
        select: {
          id: true,
          name: true,
          slug: true,
          brand: true,
          partNumber: true,
          sku: true,
          basePrice: true,
          category: { select: { name: true } },
          images: true,
        },
      });
      return {
        ...inv,
        product: prod,
        shop: { id: shop.id, name: shop.name, city: shop.city },
      };
    })
  );

  return enriched;
};

export const updateShopStock = async (
  ownerId: string,
  inventoryId: string,
  quantity: number,
  lowStockThreshold?: number
) => {
  const shop = await resolveShopByOwner(ownerId);
  const inv = await prisma.inventory.findUnique({ where: { id: inventoryId } });
  if (!inv) throw AppError.notFound('Inventory record not found.');
  if (inv.shopId !== shop.id) {
    throw AppError.forbidden('You do not have permission to manage this inventory record.');
  }

  return InventorySyncEngine.adjustStock(
    inventoryId,
    quantity,
    `Workshop stock adjustment by ${shop.name}`,
    `SHOP:${shop.name}`,
    lowStockThreshold
  );
};

