import AsyncStorage from '@react-native-async-storage/async-storage';
import { RewardPoints, Badge, RewardHistory, RewardConfig, EventCheckIn, ReferralData } from '../interfaces/rewards';
import { DEFAULT_REWARD_CONFIG, STORAGE_KEYS } from '../config/rewards';

/**
 * Get current points balance
 */
export async function getPointsBalance(): Promise<RewardPoints> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.POINTS);
    if (data) {
      return JSON.parse(data);
    }
    // Initialize with zero balance
    const initial: RewardPoints = {
      balance: 0,
      totalEarned: 0,
      totalRedeemed: 0,
    };
    await AsyncStorage.setItem(STORAGE_KEYS.POINTS, JSON.stringify(initial));
    return initial;
  } catch (error) {
    console.error('[RewardsStorage] Error getting points balance:', error);
    return {
      balance: 0,
      totalEarned: 0,
      totalRedeemed: 0,
    };
  }
}

/**
 * Add points to user's balance
 */
export async function addPoints(
  amount: number,
  action: RewardHistory['type'],
  metadata?: RewardHistory['metadata']
): Promise<RewardPoints> {
  try {
    const current = await getPointsBalance();
    const updated: RewardPoints = {
      balance: current.balance + amount,
      totalEarned: current.totalEarned + amount,
      totalRedeemed: current.totalRedeemed,
    };
    await AsyncStorage.setItem(STORAGE_KEYS.POINTS, JSON.stringify(updated));

    // Add to history
    await addToHistory({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: getActionTitle(action),
      description: getActionDescription(action, metadata),
      amount: `+${amount} points`,
      date: getRelativeDate(new Date()),
      timestamp: Date.now(),
      type: action,
      icon: getActionIcon(action),
      metadata,
    });

    return updated;
  } catch (error) {
    console.error('[RewardsStorage] Error adding points:', error);
    throw error;
  }
}

/**
 * Redeem points (subtract from balance)
 */
export async function redeemPoints(amount: number): Promise<RewardPoints> {
  try {
    const current = await getPointsBalance();
    if (current.balance < amount) {
      throw new Error('Insufficient points balance');
    }
    const updated: RewardPoints = {
      balance: current.balance - amount,
      totalEarned: current.totalEarned,
      totalRedeemed: current.totalRedeemed + amount,
    };
    await AsyncStorage.setItem(STORAGE_KEYS.POINTS, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('[RewardsStorage] Error redeeming points:', error);
    throw error;
  }
}

/**
 * Get all unlocked badges
 */
export async function getBadges(): Promise<Badge[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.BADGES);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('[RewardsStorage] Error getting badges:', error);
    return [];
  }
}

/**
 * Unlock a badge
 */
export async function unlockBadge(badge: Badge): Promise<void> {
  try {
    const badges = await getBadges();
    // Check if badge already unlocked
    if (badges.some(b => b.id === badge.id)) {
      return;
    }
    const updatedBadge: Badge = {
      ...badge,
      unlockedAt: Date.now(),
    };
    badges.push(updatedBadge);
    await AsyncStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
  } catch (error) {
    console.error('[RewardsStorage] Error unlocking badge:', error);
    throw error;
  }
}

/**
 * Get reward history
 */
export async function getRewardHistory(limit?: number): Promise<RewardHistory[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
    if (data) {
      const history = JSON.parse(data) as RewardHistory[];
      // Sort by timestamp descending (newest first)
      const sorted = history.sort((a, b) => b.timestamp - a.timestamp);
      return limit ? sorted.slice(0, limit) : sorted;
    }
    return [];
  } catch (error) {
    console.error('[RewardsStorage] Error getting reward history:', error);
    return [];
  }
}

/**
 * Add entry to reward history
 */
async function addToHistory(entry: RewardHistory): Promise<void> {
  try {
    const history = await getRewardHistory();
    history.unshift(entry);
    // Keep only last 100 entries
    const limited = history.slice(0, 100);
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(limited));
  } catch (error) {
    console.error('[RewardsStorage] Error adding to history:', error);
  }
}

/**
 * Get reward configuration
 */
export function getRewardConfig(): RewardConfig {
  return DEFAULT_REWARD_CONFIG;
}

/**
 * Get event check-ins
 */
export async function getCheckIns(): Promise<EventCheckIn[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CHECKINS);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('[RewardsStorage] Error getting check-ins:', error);
    return [];
  }
}

/**
 * Add event check-in
 */
export async function addCheckIn(checkIn: EventCheckIn): Promise<void> {
  try {
    const checkIns = await getCheckIns();
    // Check if already checked in
    if (checkIns.some(c => c.eventId === checkIn.eventId)) {
      return;
    }
    checkIns.push(checkIn);
    await AsyncStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(checkIns));
  } catch (error) {
    console.error('[RewardsStorage] Error adding check-in:', error);
    throw error;
  }
}

/**
 * Check if user has checked in to event
 */
export async function hasCheckedIn(eventId: string): Promise<boolean> {
  try {
    const checkIns = await getCheckIns();
    return checkIns.some(c => c.eventId === eventId);
  } catch (error) {
    console.error('[RewardsStorage] Error checking check-in status:', error);
    return false;
  }
}

/**
 * Get referral data
 */
export async function getReferralData(): Promise<ReferralData | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.REFERRALS);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('[RewardsStorage] Error getting referral data:', error);
    return null;
  }
}

/**
 * Set referral data
 */
export async function setReferralData(referralData: ReferralData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify(referralData));
  } catch (error) {
    console.error('[RewardsStorage] Error setting referral data:', error);
    throw error;
  }
}

/**
 * Get last login date
 */
export async function getLastLoginDate(): Promise<number | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.LAST_LOGIN);
    return data ? parseInt(data, 10) : null;
  } catch (error) {
    console.error('[RewardsStorage] Error getting last login:', error);
    return null;
  }
}

/**
 * Set last login date
 */
export async function setLastLoginDate(timestamp: number): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_LOGIN, timestamp.toString());
  } catch (error) {
    console.error('[RewardsStorage] Error setting last login:', error);
  }
}

// Helper functions
function getActionTitle(action: RewardHistory['type']): string {
  switch (action) {
    case 'event_checkin':
      return 'Event Check-in';
    case 'create_flyer':
      return 'Flyer Created';
    case 'referral':
      return 'Referral Bonus';
    case 'daily_login':
      return 'Daily Login';
    case 'bonus':
      return 'Bonus';
    case 'trading':
      return 'Trading Fee Reward';
    default:
      return 'Reward';
  }
}

function getActionDescription(action: RewardHistory['type'], metadata?: RewardHistory['metadata']): string {
  switch (action) {
    case 'event_checkin':
      return 'Checked in to event';
    case 'create_flyer':
      return 'Created event flyer';
    case 'referral':
      return metadata?.referralCode ? `From referral: ${metadata.referralCode}` : 'From friend signup';
    case 'daily_login':
      return 'Daily login bonus';
    case 'bonus':
      return 'Special bonus';
    case 'trading':
      return '20% of trading fees';
    default:
      return 'Reward earned';
  }
}

function getActionIcon(action: RewardHistory['type']): string {
  switch (action) {
    case 'event_checkin':
      return 'checkmark-circle-outline';
    case 'create_flyer':
      return 'create-outline';
    case 'referral':
      return 'people-outline';
    case 'daily_login':
      return 'calendar-outline';
    case 'bonus':
      return 'gift-outline';
    case 'trading':
      return 'swap-horizontal-outline';
    default:
      return 'star-outline';
  }
}

function getRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}


