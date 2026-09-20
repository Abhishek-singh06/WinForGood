/**
 * Pure validation functions for Stableford scores (PRD § 05 & BR-020).
 * Can be called synchronously by both client components, server actions, and unit tests.
 */

export function validateStablefordScore(scoreInput: any): { valid: boolean; error?: string; value?: number } {
  if (scoreInput === null || scoreInput === undefined || scoreInput === "") {
    return { valid: false, error: "Stableford score is required." };
  }

  const scoreNum = Number(scoreInput);
  if (isNaN(scoreNum) || !Number.isInteger(scoreNum)) {
    return { valid: false, error: "Score must be a whole integer." };
  }

  if (scoreNum < 1) {
    return { valid: false, error: "Stableford score must be at least 1 (PRD § 05)." };
  }

  if (scoreNum > 45) {
    return { valid: false, error: "Stableford score cannot exceed 45 (PRD § 05)." };
  }

  return { valid: true, value: scoreNum };
}

export function validateScoreDate(dateInput: any): { valid: boolean; error?: string; value?: string } {
  if (!dateInput || typeof dateInput !== "string" || dateInput.trim() === "") {
    return { valid: false, error: "Score date is required." };
  }

  const trimmed = dateInput.trim();
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(trimmed)) {
    return { valid: false, error: "Date must be in YYYY-MM-DD format." };
  }

  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) {
    return { valid: false, error: "Invalid calendar date." };
  }

  return { valid: true, value: trimmed };
}
