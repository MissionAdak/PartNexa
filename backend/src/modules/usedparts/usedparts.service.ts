import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';
import { UsedPartStatus, PayoutStatus } from '@prisma/client';
import { createNotification } from '../notifications/notifications.service';
import { calculateUsedPartValuation } from './usedpartsValuation.service';
import InventorySyncEngine from '../inventory/inventorySync.service';

export { UsedPartStatus };

export interface CreateUsedPartInput {
  title?: string;
  partName?: string;
  partNumber?: string;
  vehicleModel: string;
  vehicleId?: string;
  category?: string;
  condition: string;
  description: string;
  purchaseAge?: string;
  expectedPrice: number | string;
  images?: string[];
  location: string;
  pickupAddress?: string;
  payoutMethod?: string;
  payoutUpiId?: string;
  payoutBankAccount?: string;
  assignedShopId?: string;
  deliveryMethod?: 'DROP_OFF' | 'PICKUP';
  handoverMethod?: string;
}

/**
 * Fetch available verified partner garages for customer handover
 */
export const getPartnerGarages = async () => {
  return prisma.shop.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      city: true,
      address: true,
      phone: true,
      rating: true,
      totalRatings: true,
      operatingHours: true,
      servicesOffered: true,
      supportedDIFMTypes: true,
      isVerified: true,
    },
    orderBy: [{ isVerified: 'desc' }, { rating: 'desc' }],
  });
};

// Format Prisma UsedPartListing with computed fields for UI/API compatibility
export const formatListing = (listing: any) => {
  if (!listing) return listing;
  const askingPriceNum = Number(listing.askingPrice || 0);
  const resalePriceNum = listing.resalePrice ? Number(listing.resalePrice) : null;

  let vehicleModel = '';
  let partNumber = '';
  let location = '';
  let pickupAddress = '';
  if (listing.description) {
    const lines = listing.description.split('\n');
    for (const l of lines) {
      if (l.startsWith('Vehicle: ')) vehicleModel = l.replace('Vehicle: ', '').trim();
      if (l.startsWith('Part Number: ')) partNumber = l.replace('Part Number: ', '').trim();
      if (l.startsWith('Location: ')) location = l.replace('Location: ', '').trim();
      if (l.startsWith('Pickup Address: ')) pickupAddress = l.replace('Pickup Address: ', '').trim();
    }
  }

  const intake = listing.intake || null;
  const assignedShop = listing.assignedShop || intake?.shop || null;

  let mappedStatus = listing.status;
  if (intake?.status === 'GARAGE_ASSIGNED') mappedStatus = 'GARAGE_ASSIGNED';
  else if (intake?.status === 'PART_RECEIVED') mappedStatus = 'PART_RECEIVED';
  else if (intake?.status === 'OFFER_PENDING_CUSTOMER') mappedStatus = 'OFFER_READY';
  else if (intake?.status === 'OFFER_ACCEPTED' || listing.status === UsedPartStatus.LISTED) mappedStatus = 'LISTED';
  else if (listing.status === UsedPartStatus.PENDING_VERIFICATION) mappedStatus = 'SUBMITTED';
  else if (listing.status === UsedPartStatus.REJECTED) mappedStatus = 'CANCELLED';

  const payoutAmount = listing.payout?.amount
    ? Number(listing.payout.amount)
    : (intake?.recommendedSellerPayout ? Number(intake.recommendedSellerPayout) : Math.round((resalePriceNum || askingPriceNum) * 0.89));

  return {
    ...listing,
    status: mappedStatus,
    rawStatus: listing.status,
    askingPrice: askingPriceNum,
    expectedPrice: askingPriceNum,
    resalePrice: resalePriceNum,
    vehicleModel: vehicleModel || 'Compatible Vehicle',
    partNumber: partNumber || intake?.partNumber || null,
    location: location || assignedShop?.city || 'Bangalore',
    pickupAddress: pickupAddress || listing.pickupAddress || location,
    deliveryMethod: listing.deliveryMethod || 'DROP_OFF',
    assignedShopId: listing.assignedShopId || intake?.shopId || null,
    assignedShop: assignedShop
      ? {
          id: assignedShop.id,
          name: assignedShop.name,
          city: assignedShop.city,
          address: assignedShop.address,
          phone: assignedShop.phone,
          rating: assignedShop.rating,
        }
      : null,
    intake: intake
      ? {
          id: intake.id,
          status: intake.status,
          technicalResult: intake.technicalResult,
          overallGrade: intake.overallGrade,
          inspectionScore: intake.inspectionScore,
          physicalConditionRating: intake.physicalConditionRating,
          functionalTestRating: intake.functionalTestRating,
          wearLevelRating: intake.wearLevelRating,
          safetyConfidenceRating: intake.safetyConfidenceRating,
          referenceNewPrice: intake.referenceNewPrice ? Number(intake.referenceNewPrice) : null,
          recommendedResaleMin: intake.recommendedResaleMin ? Number(intake.recommendedResaleMin) : null,
          recommendedResaleMax: intake.recommendedResaleMax ? Number(intake.recommendedResaleMax) : null,
          recommendedListingPrice: intake.recommendedListingPrice ? Number(intake.recommendedListingPrice) : null,
          recommendedSellerPayout: intake.recommendedSellerPayout ? Number(intake.recommendedSellerPayout) : null,
          customerOfferStatus: intake.customerOfferStatus,
          customerDecisionAt: intake.customerDecisionAt,
          technicianNotes: intake.technicianNotes,
          benchTestNotes: intake.benchTestNotes,
          visualDamage: intake.visualDamage,
          photos: intake.photos || [],
          inspectedAt: intake.inspectedAt,
          receivedAt: intake.receivedAt,
        }
      : null,
    verificationStatus: mappedStatus,
    verificationNotes: listing.verification?.notes || intake?.technicianNotes || 'Assigned to partner garage for technical inspection.',
    rejectionReason: listing.verification?.rejectionReason || null,
    payoutStatus: listing.payout?.status || 'PENDING',
    payoutAmount,
    payoutTransactionRef: listing.payout?.transactionRef || null,
  };
};

// Create a new used part listing submitted for garage-first workflow
export const createUsedPartListing = async (sellerId: string, input: CreateUsedPartInput) => {
  const title = (input.title || input.partName || '').trim();
  if (!title || title.length < 3) {
    throw new AppError('Part name is required (minimum 3 characters).', 400);
  }

  const vehicleModel = (input.vehicleModel || '').trim();
  if (!vehicleModel) {
    throw new AppError('Vehicle specification is required (Make, Model, and Year).', 400);
  }

  const expectedPriceNum = Number(input.expectedPrice);
  if (isNaN(expectedPriceNum) || expectedPriceNum <= 0) {
    throw new AppError('Please provide a valid expected price greater than ₹0.', 400);
  }

  const condition = (input.condition || '').toUpperCase().trim();
  const validConditions = ['LIKE_NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'FOR_PARTS'];
  if (!condition || !validConditions.includes(condition)) {
    throw new AppError(`Condition must be one of: ${validConditions.join(', ')}.`, 400);
  }

  // 1. Resolve Partner Garage
  let resolvedShopId = input.assignedShopId;
  let shop = resolvedShopId ? await prisma.shop.findUnique({ where: { id: resolvedShopId } }) : null;

  if (!shop) {
    // If no shop was selected, assign the top verified partner garage
    shop = await prisma.shop.findFirst({
      where: { isActive: true },
      orderBy: [{ isVerified: 'desc' }, { rating: 'desc' }],
    });
  }

  if (!shop) {
    throw new AppError('No partner garages are currently available for inspection. Please try again later.', 503);
  }
  resolvedShopId = shop.id;

  const deliveryMethod = input.deliveryMethod === 'PICKUP' ? 'PICKUP' : 'DROP_OFF';
  const rawDescription = (input.description || `Pre-owned ${title} for ${vehicleModel} in operational condition.`).trim();
  const location = (input.location || shop.city || 'Bangalore').trim();
  const images = Array.isArray(input.images) ? input.images.filter(Boolean) : [];

  const fullDescription = [
    rawDescription,
    `Vehicle: ${vehicleModel}`,
    input.partNumber ? `Part Number: ${input.partNumber.trim()}` : null,
    `Location: ${location}`,
    input.pickupAddress ? `Pickup Address: ${input.pickupAddress.trim()}` : null,
    input.purchaseAge ? `Age: ${input.purchaseAge.trim()}` : null,
    input.payoutMethod ? `Payout: ${input.payoutMethod.trim()}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  // Fetch seller details for intake record
  const seller = await prisma.user.findUnique({
    where: { id: sellerId },
    select: { id: true, firstName: true, lastName: true, email: true, phone: true },
  });
  const sellerFullName = seller ? `${seller.firstName || ''} ${seller.lastName || ''}`.trim() : 'Customer Seller';

  // 2. Create UsedPartListing with strong assignedShop relation
  const listing = await prisma.usedPartListing.create({
    data: {
      sellerId,
      title,
      description: fullDescription,
      askingPrice: expectedPriceNum,
      condition,
      images,
      status: UsedPartStatus.PENDING_VERIFICATION,
      isSold: false,
      assignedShopId: resolvedShopId,
      deliveryMethod,
      pickupAddress: input.pickupAddress || null,
    },
    include: {
      assignedShop: true,
      seller: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      },
    },
  });

  // 3. Create linked UsedPartIntake with strong 1-to-1 relation to listing.id
  const intake = await prisma.usedPartIntake.create({
    data: {
      shopId: resolvedShopId,
      listingId: listing.id,
      partTitle: title,
      sellerName: sellerFullName,
      vehicleModel,
      partNumber: input.partNumber ? input.partNumber.trim() : null,
      status: 'GARAGE_ASSIGNED',
      physicalCondition: condition,
      technicalTestStatus: 'NEEDS_TESTING',
      technicianNotes: `Awaiting customer ${deliveryMethod === 'PICKUP' ? 'logistics pickup handover' : 'workshop drop-off'} at ${shop.name}.`,
    },
  });

  // 4. Notifications
  try {
    // Notify Customer
    await createNotification({
      userId: sellerId,
      title: 'Garage Partner Assigned for Used Part',
      body: `Your part "${title}" has been assigned to ${shop.name} for inspection. Handover method: ${deliveryMethod === 'PICKUP' ? 'Courier Pickup' : 'Workshop Drop-Off'}.`,
      channel: 'IN_APP',
      status: 'DELIVERED',
      data: {
        route: '/customer/used-parts',
        listingId: listing.id,
        shopId: shop.id,
        type: 'USED_PART_GARAGE_ASSIGNED',
      },
    });

    // Notify Workshop Owner
    if (shop.ownerId) {
      await createNotification({
        userId: shop.ownerId,
        title: 'New Used-Part Inspection Assigned',
        body: `Customer ${sellerFullName} has registered "${title}" (${vehicleModel}) for technical intake at your workshop.`,
        channel: 'IN_APP',
        status: 'DELIVERED',
        data: {
          route: '/shop/intake',
          intakeId: intake.id,
          listingId: listing.id,
          type: 'USED_PART_INTAKE_ASSIGNED',
        },
      });
    }
  } catch (err) {
    console.warn('[UsedParts] Notification error:', err);
  }

  return formatListing({ ...listing, intake, assignedShop: shop });
};

// Customer responds to garage valuation offer (Accept / Decline)
export const respondToOffer = async (
  sellerId: string,
  listingId: string,
  decision: 'ACCEPT' | 'DECLINE' | 'ACCEPTED' | 'DECLINED'
) => {
  const listing = await prisma.usedPartListing.findUnique({
    where: { id: listingId },
    include: {
      intake: true,
      assignedShop: true,
      seller: true,
    },
  });

  if (!listing) {
    throw new AppError('Used part listing not found.', 404);
  }

  if (listing.sellerId !== sellerId) {
    throw new AppError('You do not have permission to respond to this offer.', 403);
  }

  let intake = listing.intake;
  if (!intake) {
    intake = await prisma.usedPartIntake.findFirst({
      where: { listingId: listing.id },
    });
  }

  if (!intake) {
    throw new AppError('No workshop intake or inspection found for this listing.', 404);
  }

  const isAccepted = decision === 'ACCEPT' || decision === 'ACCEPTED';

  if (isAccepted) {
    const payoutAmount = intake.recommendedSellerPayout
      ? Number(intake.recommendedSellerPayout)
      : Math.round(Number(listing.resalePrice || listing.expectedPrice || listing.askingPrice) * 0.89);

    // 1. Update Intake status to OFFER_ACCEPTED
    const updatedIntake = await prisma.usedPartIntake.update({
      where: { id: intake.id },
      data: {
        customerOfferStatus: 'ACCEPTED',
        customerDecisionAt: new Date(),
        status: 'OFFER_ACCEPTED',
      },
    });

    // 2. Update Listing status to LISTED
    const updatedListing = await prisma.usedPartListing.update({
      where: { id: listing.id },
      data: {
        status: UsedPartStatus.LISTED,
        isSold: false,
      },
    });

    // 3. Create Payout record in PENDING state
    const payout = await prisma.usedPartPayout.upsert({
      where: { listingId: listing.id },
      create: {
        listingId: listing.id,
        sellerId,
        amount: payoutAmount,
        status: PayoutStatus.PENDING,
      },
      update: {
        amount: payoutAmount,
        status: PayoutStatus.PENDING,
      },
    });

    // 4. Synchronize inventory to PartNexa catalog as USED_VERIFIED
    try {
      await InventorySyncEngine.recordUsedPartIntake(listing.id, listing.assignedShopId || undefined);
    } catch (syncErr) {
      console.warn('[UsedParts] Catalog inventory sync warning:', syncErr);
    }

    // 5. Notifications
    try {
      await createNotification({
        userId: sellerId,
        title: 'Offer Accepted & Part Listed as Verified',
        body: `You accepted the offer of ₹${payoutAmount} for "${listing.title}". Your part is now listed as USED_VERIFIED on PartNexa. Payout has been initiated.`,
        channel: 'IN_APP',
        status: 'DELIVERED',
        data: {
          route: '/customer/used-parts',
          listingId: listing.id,
          type: 'USED_PART_OFFER_ACCEPTED',
        },
      });

      if (listing.assignedShop?.ownerId) {
        await createNotification({
          userId: listing.assignedShop.ownerId,
          title: 'Customer Accepted Resale Offer',
          body: `Seller accepted the payout of ₹${payoutAmount} for "${listing.title}". The component is now live on the marketplace.`,
          channel: 'IN_APP',
          status: 'DELIVERED',
          data: {
            route: '/shop/intake',
            listingId: listing.id,
            type: 'USED_PART_OFFER_ACCEPTED',
          },
        });
      }
    } catch (notifErr) {
      console.warn('[UsedParts] Notification error:', notifErr);
    }

    return formatListing({
      ...updatedListing,
      intake: updatedIntake,
      payout,
      assignedShop: listing.assignedShop,
    });
  } else {
    // DECLINED
    const updatedIntake = await prisma.usedPartIntake.update({
      where: { id: intake.id },
      data: {
        customerOfferStatus: 'DECLINED',
        customerDecisionAt: new Date(),
        status: 'OFFER_DECLINED',
      },
    });

    const updatedListing = await prisma.usedPartListing.update({
      where: { id: listing.id },
      data: {
        status: UsedPartStatus.REJECTED,
      },
    });

    try {
      await createNotification({
        userId: sellerId,
        title: 'Offer Declined',
        body: `You declined the valuation offer for "${listing.title}". You may arrange collection or return shipping from ${listing.assignedShop?.name || 'the garage'}.`,
        channel: 'IN_APP',
        status: 'DELIVERED',
        data: {
          route: '/customer/used-parts',
          listingId: listing.id,
          type: 'USED_PART_OFFER_DECLINED',
        },
      });
    } catch (notifErr) {
      console.warn('[UsedParts] Notification error:', notifErr);
    }

    return formatListing({
      ...updatedListing,
      intake: updatedIntake,
      assignedShop: listing.assignedShop,
    });
  }
};

// Get listings submitted by the logged-in customer
export const getCustomerListings = async (sellerId: string, statusFilter?: string) => {
  const where: any = { sellerId };
  if (statusFilter && statusFilter !== 'ALL') {
    where.status = statusFilter;
  }

  const listings = await prisma.usedPartListing.findMany({
    where,
    include: {
      verification: true,
      payout: true,
      intake: {
        include: {
          shop: {
            select: { id: true, name: true, city: true, address: true, phone: true, rating: true },
          },
        },
      },
      assignedShop: {
        select: { id: true, name: true, city: true, address: true, phone: true, rating: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return listings.map(formatListing);
};

// Get a single listing by ID owned by the customer
export const getCustomerListingById = async (sellerId: string, listingId: string) => {
  const listing = await prisma.usedPartListing.findUnique({
    where: { id: listingId },
    include: {
      seller: true,
      verification: true,
      payout: true,
      intake: {
        include: {
          shop: {
            select: { id: true, name: true, city: true, address: true, phone: true, rating: true },
          },
        },
      },
      assignedShop: {
        select: { id: true, name: true, city: true, address: true, phone: true, rating: true },
      },
    },
  });

  if (!listing) {
    throw new AppError('Used part listing not found.', 404);
  }

  if (listing.sellerId !== sellerId) {
    throw new AppError('You do not have permission to view this listing.', 403);
  }

  return formatListing(listing);
};

// Cancel a customer listing if still in submitted or pending verification state
export const cancelCustomerListing = async (sellerId: string, listingId: string, reason?: string) => {
  const listing = await prisma.usedPartListing.findUnique({
    where: { id: listingId },
    include: { verification: true, intake: true },
  });

  if (!listing) {
    throw new AppError('Used part listing not found.', 404);
  }

  if (listing.sellerId !== sellerId) {
    throw new AppError('You do not have permission to modify this listing.', 403);
  }

  const nonCancellable = [
    UsedPartStatus.VERIFIED,
    UsedPartStatus.LISTED,
    UsedPartStatus.SOLD,
  ];

  if (nonCancellable.includes(listing.status)) {
    throw new AppError(
      `Cannot cancel listing once verified or processed. Current status is ${listing.status}. Please contact support.`,
      400
    );
  }

  if (listing.status === UsedPartStatus.REJECTED) {
    throw new AppError('Listing is already cancelled or rejected.', 400);
  }

  const updated = await prisma.usedPartListing.update({
    where: { id: listingId },
    data: {
      status: UsedPartStatus.REJECTED,
    },
    include: {
      verification: true,
      payout: true,
      intake: true,
      assignedShop: true,
    },
  });

  return formatListing(updated);
};

// Public marketplace: list verified and relisted used parts for buyers
export const listVerifiedUsedParts = async (options?: {
  category?: string;
  condition?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}) => {
  const page = Math.max(1, Number(options?.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(options?.limit) || 12));
  const skip = (page - 1) * limit;

  const where: any = {
    status: UsedPartStatus.LISTED,
    isSold: false,
  };

  let listings = await prisma.usedPartListing.findMany({
    where,
    include: {
      intake: {
        include: {
          shop: {
            select: { id: true, name: true, city: true, rating: true },
          },
        },
      },
      assignedShop: {
        select: { id: true, name: true, city: true, rating: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Filter for search / price / condition
  if (options?.search) {
    const q = options.search.toLowerCase();
    listings = listings.filter(
      (item: any) =>
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
    );
  }

  if (options?.condition && options.condition !== 'ALL') {
    listings = listings.filter((item: any) => item.condition === options.condition);
  }

  if (options?.minPrice !== undefined) {
    listings = listings.filter(
      (item: any) => Number(item.resalePrice || item.askingPrice) >= Number(options.minPrice)
    );
  }

  if (options?.maxPrice !== undefined) {
    listings = listings.filter(
      (item: any) => Number(item.resalePrice || item.askingPrice) <= Number(options.maxPrice)
    );
  }

  const total = listings.length;
  const paginated = listings.slice(skip, skip + limit);

  return {
    listings: paginated.map(formatListing),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const listUsedParts = listVerifiedUsedParts;

// Public: get a single verified used part
export const getPublicUsedPartById = async (id: string) => {
  const listing = await prisma.usedPartListing.findUnique({
    where: { id },
    include: {
      seller: {
        select: { id: true, firstName: true, lastName: true },
      },
      intake: {
        include: {
          shop: {
            select: { id: true, name: true, city: true, rating: true, address: true },
          },
        },
      },
      assignedShop: {
        select: { id: true, name: true, city: true, rating: true, address: true },
      },
    },
  });

  if (!listing) {
    throw new AppError('Used part not found.', 404);
  }

  return formatListing(listing);
};
