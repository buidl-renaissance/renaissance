import { getRewardConfig } from '../utils/rewards-storage';
import { redeemPoints } from '../utils/rewards-storage';
import { getWallet } from '../utils/wallet';
import { ethers } from 'ethers';
import { getBaseProvider } from './usdc-balance';

/**
 * Convert points to USDC
 * @param points Amount of points to convert
 * @returns USDC amount in string format (e.g., "1.50")
 */
export async function convertPointsToUSDC(points: number): Promise<{
  success: boolean;
  usdcAmount?: string;
  error?: string;
}> {
  try {
    const config = getRewardConfig();
    
    // Check minimum conversion amount
    if (points < config.minConversionAmount) {
      return {
        success: false,
        error: `Minimum ${config.minConversionAmount} points required to convert`,
      };
    }

    // Calculate USDC amount
    // conversionRate is points per $1 USDC (e.g., 100 points = $1)
    const usdcAmount = points / config.conversionRate;
    
    // Format to 2 decimal places
    const formattedAmount = usdcAmount.toFixed(2);
    
    // For now, we'll just update the points balance
    // In a production system, this would:
    // 1. Redeem points from user's balance
    // 2. Transfer equivalent USDC to user's wallet
    // 3. Log the transaction
    
    // Redeem points
    await redeemPoints(points);
    
    // Note: In a real implementation, you would:
    // 1. Get user's wallet
    // 2. Transfer USDC from a rewards pool to user's wallet
    // 3. Use the sendUSDC function or similar
    
    return {
      success: true,
      usdcAmount: formattedAmount,
    };
  } catch (error) {
    console.error('[ConvertPoints] Error converting points:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to convert points',
    };
  }
}

/**
 * Get conversion rate information
 */
export function getConversionInfo(): {
  rate: number;
  minAmount: number;
  example: string;
} {
  const config = getRewardConfig();
  return {
    rate: config.conversionRate,
    minAmount: config.minConversionAmount,
    example: `${config.minConversionAmount} points = $${(config.minConversionAmount / config.conversionRate).toFixed(2)} USDC`,
  };
}


