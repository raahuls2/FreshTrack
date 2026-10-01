export type FoodStatus = 'FRESH' | 'EXPIRING_SOON' | 'EXPIRED';

/**
 * Calculates food status based on expiryDate:
 * - EXPIRED: expiry date is strictly before today (00:00:00)
 * - EXPIRING_SOON: expiry date is today or within the next 3 days
 * - FRESH: more than 3 days remaining after today
 */
export function calculateFoodStatus(expiryDateInput: Date | string): FoodStatus {
  const expiry = new Date(expiryDateInput);
  
  // Strip time from today's date for clean calendar day comparisons
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiryDay = new Date(expiry);
  expiryDay.setHours(0, 0, 0, 0);

  const diffTime = expiryDay.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'EXPIRED';
  } else if (diffDays <= 3) {
    return 'EXPIRING_SOON';
  } else {
    return 'FRESH';
  }
}
