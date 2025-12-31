import { Badge } from '../interfaces/rewards';
import { getCheckIns, getRewardHistory, getBadges } from './rewards-storage';

/**
 * Badge definitions
 */
export const BADGE_DEFINITIONS: Omit<Badge, 'unlockedAt' | 'progress'>[] = [
  {
    id: 'first_event',
    name: 'First Steps',
    description: 'Attended your first event',
    icon: 'footsteps-outline',
    rarity: 'common',
  },
  {
    id: 'event_enthusiast',
    name: 'Event Enthusiast',
    description: 'Attended 10 events',
    icon: 'calendar-outline',
    rarity: 'rare',
    maxProgress: 10,
  },
  {
    id: 'event_master',
    name: 'Event Master',
    description: 'Attended 50 events',
    icon: 'trophy-outline',
    rarity: 'epic',
    maxProgress: 50,
  },
  {
    id: 'content_creator',
    name: 'Content Creator',
    description: 'Created your first flyer',
    icon: 'create-outline',
    rarity: 'common',
  },
  {
    id: 'flyer_pro',
    name: 'Flyer Pro',
    description: 'Created 10 flyers',
    icon: 'images-outline',
    rarity: 'rare',
    maxProgress: 10,
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Referred 5 friends',
    icon: 'people-outline',
    rarity: 'rare',
    maxProgress: 5,
  },
  {
    id: 'referral_king',
    name: 'Referral King',
    description: 'Referred 20 friends',
    icon: 'star-outline',
    rarity: 'legendary',
    maxProgress: 20,
  },
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Joined in the first month',
    icon: 'rocket-outline',
    rarity: 'epic',
  },
  {
    id: 'points_collector',
    name: 'Points Collector',
    description: 'Earned 1000 points',
    icon: 'diamond-outline',
    rarity: 'rare',
    maxProgress: 1000,
  },
  {
    id: 'points_master',
    name: 'Points Master',
    description: 'Earned 10000 points',
    icon: 'medal-outline',
    rarity: 'legendary',
    maxProgress: 10000,
  },
  {
    id: 'daily_dedication',
    name: 'Daily Dedication',
    description: 'Logged in 7 days in a row',
    icon: 'flame-outline',
    rarity: 'epic',
    maxProgress: 7,
  },
  {
    id: 'monthly_warrior',
    name: 'Monthly Warrior',
    description: 'Logged in 30 days in a row',
    icon: 'shield-outline',
    rarity: 'legendary',
    maxProgress: 30,
  },
];

/**
 * Check and unlock badges based on user activity
 */
export async function checkAndUnlockBadges(): Promise<Badge[]> {
  const unlockedBadges: Badge[] = [];
  const currentBadges = await getBadges();
  const checkIns = await getCheckIns();
  const history = await getRewardHistory();
  
  // Calculate stats
  const eventCount = checkIns.length;
  const flyerCount = history.filter(h => h.type === 'create_flyer').length;
  const referralCount = history.filter(h => h.type === 'referral' && h.metadata?.referralCode).length;
  const totalPoints = history
    .filter(h => h.amount.startsWith('+'))
    .reduce((sum, h) => {
      const match = h.amount.match(/\d+/);
      return sum + (match ? parseInt(match[0], 10) : 0);
    }, 0);

  // Check each badge definition
  for (const badgeDef of BADGE_DEFINITIONS) {
    // Skip if already unlocked
    if (currentBadges.some(b => b.id === badgeDef.id)) {
      continue;
    }

    let shouldUnlock = false;
    let progress = 0;

    switch (badgeDef.id) {
      case 'first_event':
        shouldUnlock = eventCount >= 1;
        progress = eventCount;
        break;
      case 'event_enthusiast':
        progress = eventCount;
        shouldUnlock = eventCount >= 10;
        break;
      case 'event_master':
        progress = eventCount;
        shouldUnlock = eventCount >= 50;
        break;
      case 'content_creator':
        shouldUnlock = flyerCount >= 1;
        progress = flyerCount;
        break;
      case 'flyer_pro':
        progress = flyerCount;
        shouldUnlock = flyerCount >= 10;
        break;
      case 'social_butterfly':
        progress = referralCount;
        shouldUnlock = referralCount >= 5;
        break;
      case 'referral_king':
        progress = referralCount;
        shouldUnlock = referralCount >= 20;
        break;
      case 'points_collector':
        progress = totalPoints;
        shouldUnlock = totalPoints >= 1000;
        break;
      case 'points_master':
        progress = totalPoints;
        shouldUnlock = totalPoints >= 10000;
        break;
      // Note: Daily login and early adopter badges require additional logic
      // that would need to be implemented separately
    }

    if (shouldUnlock) {
      const badge: Badge = {
        ...badgeDef,
        unlockedAt: Date.now(),
        progress: badgeDef.maxProgress ? Math.min(progress, badgeDef.maxProgress) : undefined,
      };
      unlockedBadges.push(badge);
    }
  }

  return unlockedBadges;
}

/**
 * Get all badge definitions
 */
export function getAllBadgeDefinitions(): Omit<Badge, 'unlockedAt' | 'progress'>[] {
  return BADGE_DEFINITIONS;
}

/**
 * Get badge by ID
 */
export function getBadgeById(id: string): Omit<Badge, 'unlockedAt' | 'progress'> | undefined {
  return BADGE_DEFINITIONS.find(b => b.id === id);
}

