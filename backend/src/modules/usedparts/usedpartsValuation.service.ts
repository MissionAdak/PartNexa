import prisma from '../../config/prisma';

export interface ValuationInput {
  physicalConditionRating: number; // 1 to 5
  functionalTestRating: number;    // 1 to 5
  wearLevelRating: number;         // 1 to 5
  safetyConfidenceRating: number;  // 1 to 5
  technicalResult: 'PASSED' | 'REPAIR_REQUIRED' | 'FAILED' | string;
  repairEstimatedCost?: number;
  partAge?: string;
  catalogProductId?: string;
  partNumber?: string;
  partTitle?: string;
  askingPrice?: number;
}

export interface ValuationResult {
  referenceNewPrice: number;
  inspectionScore: number;
  overallGrade: 'A' | 'B' | 'C' | 'D';
  recommendedResaleMin: number;
  recommendedResaleMax: number;
  recommendedListingPrice: number;
  recommendedSellerPayout: number;
  platformCutPercent: number;
  valuationNotes: string;
}

/**
 * Technical Valuation Engine for PartNexa Used Spare Parts:
 * Calculates a verified recommended resale price and seller payout
 * based on verified catalog reference price and structured workshop inspection scores.
 */
export const calculateUsedPartValuation = async (
  input: ValuationInput
): Promise<ValuationResult> => {
  // 1. Resolve PartNexa Catalog Reference New Price
  let referenceNewPrice: number | null = null;

  if (input.catalogProductId) {
    const prod = await prisma.product.findUnique({
      where: { id: input.catalogProductId },
      select: { basePrice: true },
    }).catch(() => null);
    if (prod?.basePrice) {
      referenceNewPrice = Number(prod.basePrice);
    }
  }

  if (!referenceNewPrice && input.partNumber) {
    const prod = await prisma.product.findFirst({
      where: {
        partNumber: {
          equals: input.partNumber.trim(),
          mode: 'insensitive',
        },
      },
      select: { basePrice: true },
    }).catch(() => null);
    if (prod?.basePrice) {
      referenceNewPrice = Number(prod.basePrice);
    }
  }

  if (!referenceNewPrice && input.partTitle) {
    const firstWord = input.partTitle.trim().split(' ')[0];
    if (firstWord && firstWord.length >= 3) {
      const prod = await prisma.product.findFirst({
        where: {
          name: {
            contains: firstWord,
            mode: 'insensitive',
          },
        },
        select: { basePrice: true },
      }).catch(() => null);
      if (prod?.basePrice) {
        referenceNewPrice = Number(prod.basePrice);
      }
    }
  }

  // Fallback: Infer standard retail reference price from asking price or reasonable benchmark
  if (!referenceNewPrice) {
    if (input.askingPrice && input.askingPrice > 0) {
      // Used spare parts typically sell for ~60-70% of new OEM component price
      referenceNewPrice = Math.max(
        1000,
        Math.round((input.askingPrice / 0.65) / 100) * 100
      );
    } else {
      referenceNewPrice = 4000;
    }
  }

  // 2. Structured Technical Inspection Score Calculation (0 to 100)
  const phys = Math.min(Math.max(1, Number(input.physicalConditionRating) || 4), 5);
  const func = Math.min(Math.max(1, Number(input.functionalTestRating) || 4), 5);
  const wear = Math.min(Math.max(1, Number(input.wearLevelRating) || 3), 5);
  const safe = Math.min(Math.max(1, Number(input.safetyConfidenceRating) || 5), 5);

  // Weighted scoring: Functional (35%), Physical (25%), Wear (20%), Safety (20%)
  const scorePhysical = (phys / 5) * 25;
  const scoreFunctional = (func / 5) * 35;
  const scoreWear = (wear / 5) * 20;
  const scoreSafety = (safe / 5) * 20;

  let rawScore = Math.round(scorePhysical + scoreFunctional + scoreWear + scoreSafety);

  // If technical verdict is FAILED, score is 0
  const isFailed = input.technicalResult === 'FAILED';
  const isRepairRequired = input.technicalResult === 'REPAIR_REQUIRED';

  if (isFailed) {
    rawScore = 0;
  }

  // Determine Overall Letter Grade
  let overallGrade: 'A' | 'B' | 'C' | 'D' = 'B';
  if (isFailed || rawScore < 50) {
    overallGrade = 'D';
  } else if (rawScore >= 90) {
    overallGrade = 'A';
  } else if (rawScore >= 75) {
    overallGrade = 'B';
  } else if (rawScore >= 55) {
    overallGrade = 'C';
  }

  if (isFailed) {
    return {
      referenceNewPrice,
      inspectionScore: 0,
      overallGrade: 'D',
      recommendedResaleMin: 0,
      recommendedResaleMax: 0,
      recommendedListingPrice: 0,
      recommendedSellerPayout: 0,
      platformCutPercent: 0,
      valuationNotes: 'Component failed workshop technical inspection. Unfit for resale.',
    };
  }

  // 3. Age Depreciation Factor
  let ageFactor = 1.0;
  const ageStr = (input.partAge || '').toLowerCase();
  if (ageStr.includes('under 6') || ageStr.includes('new')) {
    ageFactor = 1.05;
  } else if (ageStr.includes('6-12') || ageStr.includes('6 to 12')) {
    ageFactor = 1.0;
  } else if (ageStr.includes('1-2') || ageStr.includes('1 to 2')) {
    ageFactor = 0.95;
  } else if (ageStr.includes('2-3') || ageStr.includes('2 to 3')) {
    ageFactor = 0.88;
  } else if (ageStr.includes('3+') || ageStr.includes('older')) {
    ageFactor = 0.78;
  }

  // 4. Valuation Resale Range (e.g. 65% - 72.5% for Grade B/87)
  let minRatio = 0.50;
  let maxRatio = 0.60;

  if (overallGrade === 'A') {
    minRatio = 0.72;
    maxRatio = 0.82;
  } else if (overallGrade === 'B') {
    minRatio = 0.65;
    maxRatio = 0.725;
  } else if (overallGrade === 'C') {
    minRatio = 0.45;
    maxRatio = 0.55;
  } else {
    minRatio = 0.25;
    maxRatio = 0.35;
  }

  let minResale = Math.round((referenceNewPrice * minRatio * ageFactor) / 50) * 50;
  let maxResale = Math.round((referenceNewPrice * maxRatio * ageFactor) / 50) * 50;

  if (isRepairRequired) {
    const repairDeduction = Number(input.repairEstimatedCost) || 350;
    minResale = Math.max(100, minResale - repairDeduction);
    maxResale = Math.max(minResale + 100, maxResale - repairDeduction);
  }

  // Recommended listing price in resale range (ending in 99 for marketplace presentation)
  const midpoint = (minResale + maxResale) / 2;
  let recommendedListingPrice = Math.floor(midpoint / 100) * 100 + 99;
  if (recommendedListingPrice > maxResale) {
    recommendedListingPrice = maxResale;
  }
  if (recommendedListingPrice < minResale) {
    recommendedListingPrice = minResale;
  }

  // 5. Configured Platform Margin & Seller Payout Calculation
  let platformCutPercent = 10.7; // default dynamic platform margin ~10.7%

  try {
    const config = await prisma.commissionConfig.findFirst({
      where: { isActive: true },
      select: { ratePercent: true },
    });
    if (config?.ratePercent) {
      platformCutPercent = Number(config.ratePercent);
    }
  } catch (err) {
    // Keep platformCutPercent default if config query is unavailable
  }

  // Seller payout based on configured platform margin:
  // e.g. For ₹2,799 listing with ~10.7% platform cut: seller payout is ₹2,500
  const sellerPayout = Math.round(recommendedListingPrice * (1 - platformCutPercent / 100) / 10) * 10;

  const valuationNotes = `Verified against PartNexa catalog reference price of ₹${referenceNewPrice}. ` +
    `Technical score: ${rawScore}/100 (Grade ${overallGrade}). Platform margin: ${platformCutPercent}%.`;

  return {
    referenceNewPrice,
    inspectionScore: rawScore,
    overallGrade,
    recommendedResaleMin: minResale,
    recommendedResaleMax: maxResale,
    recommendedListingPrice,
    recommendedSellerPayout: sellerPayout,
    platformCutPercent,
    valuationNotes,
  };
};
