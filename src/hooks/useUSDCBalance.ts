import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/Auth";
import { getUSDCBalance } from "../api/usdc-balance";
import { getWallet } from "../utils/wallet";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BALANCE_CACHE_KEY = "USDC_BALANCE_CACHE";
const BALANCE_REFRESH_INTERVAL = 5000; // 5 seconds

/**
 * Hook to get USDC balance for the logged-in account
 * - Loads cached balance instantly on mount
 * - Refreshes balance every 5 seconds
 * - Stores balance locally for instant loading
 * @returns Object with balance, loading state, and error
 */
export const useUSDCBalance = () => {
  const { state: authState } = useAuth();
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedCacheRef = useRef(false);

  // Load cached balance instantly on mount
  useEffect(() => {
    const loadCachedBalance = async (): Promise<void> => {
      try {
        const cachedBalance = await AsyncStorage.getItem(BALANCE_CACHE_KEY);
        if (cachedBalance) {
          setBalance(cachedBalance);
          hasLoadedCacheRef.current = true;
        }
      } catch (err) {
        console.error("Error loading cached balance:", err);
      }
    };

    if (authState.isAuthenticated) {
      loadCachedBalance();
    }
  }, [authState.isAuthenticated]);

  // Fetch balance and set up refresh interval
  useEffect(() => {
    const fetchBalance = async (showLoading = false): Promise<void> => {
      try {
        if (showLoading) {
          setLoading(true);
        }
        setError(null);

        // Always use local wallet for consistency
        const wallet = await getWallet();
        const address = wallet.address;

        if (address) {
          const usdcBalance = await getUSDCBalance(address);
          const numericBalance = parseFloat(usdcBalance);
          const formattedBalance = numericBalance.toFixed(2);
          
          setBalance(formattedBalance);
          
          // Cache the balance
          try {
            await AsyncStorage.setItem(BALANCE_CACHE_KEY, formattedBalance);
          } catch (cacheError) {
            console.error("Error caching balance:", cacheError);
          }
        } else {
          const zeroBalance = "0.00";
          setBalance(zeroBalance);
          await AsyncStorage.setItem(BALANCE_CACHE_KEY, zeroBalance);
        }
      } catch (err) {
        console.error("Error loading USDC balance:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch USDC balance"));
        // Don't update balance on error, keep cached value
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    };

    if (authState.isAuthenticated) {
      // Fetch immediately (only show loading if we don't have cached balance)
      fetchBalance(!hasLoadedCacheRef.current);

      // Set up interval to refresh every 5 seconds
      intervalRef.current = setInterval(() => {
        fetchBalance(false); // Don't show loading on interval refreshes
      }, BALANCE_REFRESH_INTERVAL);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
    
    // Cleanup when not authenticated
    setBalance(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    return undefined;
  }, [authState.isAuthenticated]);

  return {
    balance,
    loading,
    error,
  };
};

