import { ReferralData } from '../interfaces/rewards';
import { getReferralData, setReferralData } from './rewards-storage';
import { useAuth } from '../context/Auth';

/**
 * Generate a unique referral code for a user
 */
export function generateReferralCode(userId: string | number): string {
  // Create a code based on user ID and timestamp
  const base = `${userId}-${Date.now()}`;
  // Simple hash-like function to create a shorter code
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    const char = base.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to base36 for shorter code
  const code = Math.abs(hash).toString(36).toUpperCase().substring(0, 8);
  return `RENA${code}`;
}

/**
 * Get or create referral code for current user
 */
export async function getOrCreateReferralCode(userId: string | number): Promise<string> {
  const existing = await getReferralData();
  if (existing && existing.code) {
    return existing.code;
  }
  
  const code = generateReferralCode(userId);
  const referralData: ReferralData = {
    code,
    count: 0,
    totalRewards: 0,
    createdAt: Date.now(),
  };
  await setReferralData(referralData);
  return code;
}

/**
 * Track a referral signup
 */
export async function trackReferral(
  code: string,
  referrerId: string | number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get referrer's data
    const referrerData = await getReferralData();
    
    // If this is the referrer's own code, don't track
    if (referrerData?.code === code) {
      return { success: false, error: 'Cannot use your own referral code' };
    }

    // For now, we'll track referrals locally
    // In a production system, this would be handled server-side
    // to prevent manipulation
    
    // The actual referral tracking would happen during signup
    // This function is called after a new user signs up with a referral code
    
    return { success: true };
  } catch (error) {
    console.error('[Referrals] Error tracking referral:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track referral',
    };
  }
}

/**
 * Get referral statistics for a user
 */
export async function getReferralStats(userId: string | number): Promise<ReferralData | null> {
  return getReferralData();
}

/**
 * Increment referral count and update rewards
 */
export async function incrementReferralCount(
  pointsAwarded: number
): Promise<void> {
  const data = await getReferralData();
  if (data) {
    data.count += 1;
    data.totalRewards += pointsAwarded;
    await setReferralData(data);
  }
}

/**
 * Parse referral code from signup data
 */
export function parseReferralCode(data: string): string | null {
  // Check if data contains a referral code
  if (data.startsWith('RENA') && data.length >= 8) {
    return data;
  }
  
  // Try to extract from URL or other formats
  const match = data.match(/RENA[A-Z0-9]+/);
  return match ? match[0] : null;
}


