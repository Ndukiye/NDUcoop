export interface MockLoanProduct {
  id: number;
  name: string;
  duration_months: number;
  interest_rate: number;
}

export const loanProducts: MockLoanProduct[] = [
  { id: 1, name: "Short-Term", duration_months: 6, interest_rate: 6 },
  { id: 2, name: "Medium-Term", duration_months: 12, interest_rate: 7 },
  { id: 3, name: "Long-Term", duration_months: 18, interest_rate: 8 },
];

export const HIGH_RISK_MULTIPLE = 3;
export const HIGH_RISK_RATE = 9;
export const LOAN_FEE = 1000;

export function calculateInterestRate(
  product: MockLoanProduct,
  principal: number,
  totalAsset: number,
): { rate: number; isOverride: boolean } {
  if (principal > HIGH_RISK_MULTIPLE * totalAsset) {
    return { rate: HIGH_RISK_RATE, isOverride: true };
  }
  return { rate: product.interest_rate, isOverride: false };
}

export function calculateLoanBreakdown(product: MockLoanProduct, principal: number, totalAsset: number) {
  const { rate, isOverride } = calculateInterestRate(product, principal, totalAsset);
  const interestAmount = Math.round(principal * (rate / 100));
  const feeAmount = LOAN_FEE;
  const amountDisbursed = principal - interestAmount - feeAmount;
  const monthlyRepayment = principal / product.duration_months;
  return {
    rate,
    isOverride,
    interestAmount,
    feeAmount,
    amountDisbursed,
    monthlyRepayment,
    durationMonths: product.duration_months,
    totalAsset,
  };
}
