export type RewardAction = 'event_checkin' | 'create_flyer' | 'referral' | 'daily_login' | 'bonus' | 'trading' | 'other';

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface RewardPoints {
  balance: number;
  totalEarned: number;
  totalRedeemed: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  unlockedAt?: number; // timestamp
  progress?: number; // 0-100 for progress tracking
  maxProgress?: number; // for progress-based badges
}

export interface RewardHistory {
  id: string;
  title: string;
  description: string;
  amount: string; // e.g., "+50 points" or "+$5.20"
  date: string;
  timestamp: number;
  type: RewardAction;
  icon: string;
  metadata?: {
    eventId?: string;
    flyerId?: string;
    referralCode?: string;
    [key: string]: any;
  };
}

export interface RewardConfig {
  pointValues: {
    event_checkin: number;
    create_flyer: number;
    referral: {
      referrer: number;
      referee: number;
    };
    daily_login: number;
  };
  conversionRate: number; // points per $1 USDC (e.g., 100 points = $1)
  minConversionAmount: number; // minimum points to convert
}

export interface EventCheckIn {
  eventId: string;
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  qrData?: string;
}

export interface ReferralData {
  code: string;
  count: number;
  totalRewards: number;
  createdAt: number;
}


