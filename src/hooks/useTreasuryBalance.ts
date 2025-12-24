import React from "react";
import { getTreasuryBalance } from "../api/treasury";

export const useTreasuryBalance = () => {
  const [balance, setBalance] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<Error | null>(null);
  const hasFetchedRef = React.useRef(false);

  const fetchBalance = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const treasuryBalance = await getTreasuryBalance();
      setBalance(treasuryBalance);
    } catch (err) {
      console.error("Error fetching treasury balance:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch treasury balance"));
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // Only fetch once on mount
    if (hasFetchedRef.current) {
      return;
    }
    
    hasFetchedRef.current = true;
    fetchBalance();
    
    // Refresh every 5 minutes
    const interval = setInterval(() => {
      fetchBalance();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchBalance]);

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance,
  };
};

