import { useState, useEffect, useCallback } from 'react';
import { RewardPoints, Badge, RewardHistory } from '../interfaces/rewards';
import {
  getPointsBalance,
  getBadges,
  getRewardHistory,
  addPoints as addPointsStorage,
  redeemPoints as redeemPointsStorage,
} from '../utils/rewards-storage';
import { checkAndUnlockBadges, getAllBadgeDefinitions } from '../utils/badges';
import { unlockBadge } from '../utils/rewards-storage';
import { useAuth } from '../context/Auth';

export function useRewards() {
  const { state: authState } = useAuth();
  const [points, setPoints] = useState<RewardPoints | null>(null);
  const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [history, setHistory] = useState<RewardHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<Badge[]>([]);

  // Load initial data
  useEffect(() => {
    if (authState.isAuthenticated) {
      loadRewardsData();
    } else {
      setPoints(null);
      setUnlockedBadges([]);
      setAllBadges([]);
      setHistory([]);
      setLoading(false);
    }
  }, [authState.isAuthenticated]);

  const loadRewardsData = useCallback(async () => {
    try {
      setLoading(true);
      const [pointsData, badgesData, historyData, badgeDefinitions] = await Promise.all([
        getPointsBalance(),
        getBadges(),
        getRewardHistory(50), // Get last 50 entries
        getAllBadgeDefinitions(),
      ]);

      setPoints(pointsData);
      setUnlockedBadges(badgesData);
      setHistory(historyData);

      // Merge unlocked badges with definitions to show all badges
      const allBadgesList: Badge[] = badgeDefinitions.map(def => {
        const unlocked = badgesData.find(b => b.id === def.id);
        if (unlocked) {
          return unlocked;
        }
        return {
          ...def,
          progress: 0,
        };
      });
      setAllBadges(allBadgesList);
    } catch (error) {
      console.error('[useRewards] Error loading rewards data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check for new badge unlocks
  const checkBadgeUnlocks = useCallback(async () => {
    try {
      const newBadges = await checkAndUnlockBadges();
      if (newBadges.length > 0) {
        // Unlock each badge
        for (const badge of newBadges) {
          await unlockBadge(badge);
        }
        setNewlyUnlockedBadges(newBadges);
        // Reload badges
        const updatedBadges = await getBadges();
        setUnlockedBadges(updatedBadges);
        
        // Update all badges list
        const badgeDefinitions = getAllBadgeDefinitions();
        const allBadgesList: Badge[] = badgeDefinitions.map(def => {
          const unlocked = updatedBadges.find(b => b.id === def.id);
          if (unlocked) {
            return unlocked;
          }
          return {
            ...def,
            progress: 0,
          };
        });
        setAllBadges(allBadgesList);
      }
      return newBadges;
    } catch (error) {
      console.error('[useRewards] Error checking badge unlocks:', error);
      return [];
    }
  }, []);

  // Add points and check for badge unlocks
  const addPoints = useCallback(async (
    amount: number,
    action: RewardHistory['type'],
    metadata?: RewardHistory['metadata']
  ) => {
    try {
      const updatedPoints = await addPointsStorage(amount, action, metadata);
      setPoints(updatedPoints);
      
      // Reload history
      const updatedHistory = await getRewardHistory(50);
      setHistory(updatedHistory);

      // Check for badge unlocks
      const newBadges = await checkBadgeUnlocks();
      
      return { points: updatedPoints, newBadges };
    } catch (error) {
      console.error('[useRewards] Error adding points:', error);
      throw error;
    }
  }, [checkBadgeUnlocks]);

  // Redeem points
  const redeemPoints = useCallback(async (amount: number) => {
    try {
      const updatedPoints = await redeemPointsStorage(amount);
      setPoints(updatedPoints);
      return updatedPoints;
    } catch (error) {
      console.error('[useRewards] Error redeeming points:', error);
      throw error;
    }
  }, []);

  // Refresh rewards data
  const refresh = useCallback(async () => {
    await loadRewardsData();
    await checkBadgeUnlocks();
  }, [loadRewardsData, checkBadgeUnlocks]);

  // Clear newly unlocked badges (after showing notification)
  const clearNewBadges = useCallback(() => {
    setNewlyUnlockedBadges([]);
  }, []);

  return {
    points,
    unlockedBadges,
    allBadges,
    history,
    loading,
    newlyUnlockedBadges,
    addPoints,
    redeemPoints,
    refresh,
    checkBadgeUnlocks,
    clearNewBadges,
  };
}


