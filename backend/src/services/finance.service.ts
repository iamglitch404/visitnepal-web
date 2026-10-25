/**
 * Financial Calculation & Settlement Engine for VisitNepal
 * Uses integer-paisa / 2-decimal safe math to eliminate floating-point rounding errors.
 */

export interface FinancialRule {
  vatRate: number; // e.g. 0.13 for 13% Nepal VAT
  commissionRate: number; // e.g. 0.10 for 10% standard platform fee
}

export interface SettlementBreakdown {
  grossAmount: number;
  discountAmount: number;
  taxableAmount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number; // Customer pays this
  platformCommissionRate: number;
  platformFee: number;
  providerSettlement: number; // Business earns this (taxableAmount - platformFee)
}

// Category-based commission overrides if specified
const CATEGORY_COMMISSION_RATES: Record<string, number> = {
  hotel: 0.08, // 8% for hotel & resort partners
  resort: 0.08,
  homestay: 0.06, // 6% concession for local homestays
  trekking_agency: 0.10, // 10% standard tour & trek
  paragliding: 0.12, // 12% adventure with high insurance overhead
  rafting: 0.12,
  bungee: 0.12,
  zipline: 0.12,
  transport: 0.09,
  guide: 0.08, // 8% for certified mountain guides
};

/**
 * Safely rounds any currency figure to exactly 2 decimal places using cents/paisa integer math.
 */
export function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates deterministic settlement breakdown for any reservation.
 * Formula:
 *  1. taxableAmount = max(0, grossAmount - discountAmount)
 *  2. taxAmount = round(taxableAmount * vatRate)
 *  3. totalAmount = taxableAmount + taxAmount
 *  4. platformFee = round(taxableAmount * commissionRate)
 *  5. providerSettlement = round(taxableAmount - platformFee)
 */
export function calculateSettlement(params: {
  grossAmount: number;
  discountAmount?: number;
  category?: string;
  customVatRate?: number;
  customCommissionRate?: number;
}): SettlementBreakdown {
  const gross = roundCurrency(Math.max(0, params.grossAmount));
  const discount = roundCurrency(Math.max(0, params.discountAmount || 0));
  const taxable = roundCurrency(Math.max(0, gross - discount));

  // Determine VAT rate (default 13% standard Nepal VAT)
  const vatRate = params.customVatRate !== undefined ? params.customVatRate : 0.13;
  const taxAmount = roundCurrency(taxable * vatRate);
  const totalAmount = roundCurrency(taxable + taxAmount);

  // Determine platform commission rate
  let commissionRate = 0.10;
  if (params.customCommissionRate !== undefined) {
    commissionRate = params.customCommissionRate;
  } else if (params.category && CATEGORY_COMMISSION_RATES[params.category.toLowerCase()]) {
    commissionRate = CATEGORY_COMMISSION_RATES[params.category.toLowerCase()];
  }

  const platformFee = roundCurrency(taxable * commissionRate);
  const providerSettlement = roundCurrency(taxable - platformFee);

  return {
    grossAmount: gross,
    discountAmount: discount,
    taxableAmount: taxable,
    taxRate: vatRate,
    taxAmount,
    totalAmount,
    platformCommissionRate: commissionRate,
    platformFee,
    providerSettlement,
  };
}
