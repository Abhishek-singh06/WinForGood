/**
 * Pure validation functions for Charity operations (PRD § 07 & § 08).
 * Can be called synchronously by client components, server actions, and unit tests.
 */

export function validateCharityContributionPercentage(percentageInput: any): {
  valid: boolean;
  error?: string;
  value?: number;
} {
  if (percentageInput === null || percentageInput === undefined || percentageInput === "") {
    return { valid: false, error: "Charity contribution percentage is required." };
  }

  const num = Number(percentageInput);
  if (isNaN(num) || !Number.isInteger(num)) {
    return { valid: false, error: "Contribution percentage must be a whole integer." };
  }

  if (num < 10) {
    return {
      valid: false,
      error: "Contribution percentage cannot be below the statutory 10% floor (PRD § 07).",
    };
  }

  if (num > 100) {
    return {
      valid: false,
      error: "Contribution percentage cannot exceed 100% of your prize share.",
    };
  }

  return { valid: true, value: num };
}
