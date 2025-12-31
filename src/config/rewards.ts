import { RewardConfig } from '../interfaces/rewards';

export const DEFAULT_REWARD_CONFIG: RewardConfig = {
  pointValues: {
    event_checkin: 50,
    create_flyer: 100,
    referral: {
      referrer: 200,
      referee: 50,
    },
    daily_login: 10,
  },
  conversionRate: 100, // 100 points = $1 USDC
  minConversionAmount: 100, // minimum 100 points to convert
};

export const STORAGE_KEYS = {
  POINTS: 'rewards:points',
  BADGES: 'rewards:badges',
  HISTORY: 'rewards:history',
  CHECKINS: 'rewards:checkins',
  REFERRALS: 'rewards:referrals',
  LAST_LOGIN: 'rewards:lastLogin',
} as const;

