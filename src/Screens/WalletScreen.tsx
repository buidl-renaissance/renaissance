import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getWallet } from "../utils/wallet";
import { useAuth } from "../context/Auth";
import { getUSDCBalance } from "../api/usdc-balance";
import { theme } from "../colors";

interface WalletScreenProps {
  navigation: any;
}

interface TokenBalance {
  id: string;
  name: string;
  symbol: string;
  balance: string;
  usdValue: string;
  changePercent: string;
  isPositive: boolean;
  icon: string;
  type: "lending" | "token";
  apy?: string;
}

const WalletScreen: React.FC<WalletScreenProps> = ({ navigation }) => {
  const { state: authState } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"Tokens" | "Collectibles" | "History">("Tokens");
  const [showReferralBanner, setShowReferralBanner] = useState(true);
  const [balanceChange] = useState({ value: "0.13", percent: "0.40", isPositive: true });
  const [usdcBalance, setUsdcBalance] = useState<string>("0");
  const [isLoadingUSDC, setIsLoadingUSDC] = useState<boolean>(false);

  // Token balances - USDC will be updated with real balance
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([
    {
      id: "usdc",
      name: "USD Coin",
      symbol: "USDC",
      balance: "0",
      usdValue: "0",
      changePercent: "0",
      isPositive: true,
      icon: "diamond-outline",
      type: "token",
    },
    {
      id: "eth",
      name: "Ethereum",
      symbol: "ETH",
      balance: "0.010315",
      usdValue: "30.30",
      changePercent: "0.20",
      isPositive: false,
      icon: "logo-ethereum",
      type: "token",
    },
    {
      id: "saveholly",
      name: "Die Hard is a Christmas movie",
      symbol: "saveholly",
      balance: "3,039,728",
      usdValue: "1.10",
      changePercent: "0.28",
      isPositive: false,
      icon: "diamond-outline",
      type: "token",
    },
  ]);

  useEffect(() => {
    loadWalletInfo();
  }, []);

  useEffect(() => {
    if (walletAddress) {
      loadUSDCBalance();
    }
  }, [walletAddress]);

  const loadWalletInfo = async () => {
    try {
      // Always use local wallet for consistency
      const wallet = await getWallet();
      setWalletAddress(wallet.address);
    } catch (error) {
      console.error("Error loading wallet:", error);
      Alert.alert("Error", "Failed to load wallet information");
    }
  };

  const loadUSDCBalance = async () => {
    if (!walletAddress) return;
    
    try {
      setIsLoadingUSDC(true);
      const balance = await getUSDCBalance(walletAddress);
      setUsdcBalance(balance);
      
      // Update token balances with real USDC balance
      const numericBalance = parseFloat(balance);
      
      // Format balance display - show up to 6 decimal places if needed, but remove trailing zeros
      let formattedBalance: string;
      if (numericBalance === 0) {
        formattedBalance = "0";
      } else if (numericBalance < 0.01) {
        // For very small amounts, show more precision
        formattedBalance = numericBalance.toFixed(6).replace(/\.?0+$/, "");
      } else {
        // For larger amounts, show up to 2 decimal places
        formattedBalance = numericBalance.toLocaleString(undefined, { 
          minimumFractionDigits: 0,
          maximumFractionDigits: 2 
        });
      }
      
      const usdValue = numericBalance.toFixed(2);
      
      setTokenBalances((prev) =>
        prev.map((token) =>
          token.id === "usdc"
            ? {
                ...token,
                balance: formattedBalance,
                usdValue: usdValue,
              }
            : token
        )
      );
    } catch (error) {
      console.error("Error loading USDC balance:", error);
      // Don't show alert for balance errors, just log it
    } finally {
      setIsLoadingUSDC(false);
    }
  };

  const renderTokenItem = (token: TokenBalance) => (
    <TouchableOpacity key={token.id} style={styles.tokenItem}>
      <View style={styles.tokenIconContainer}>
        <View style={[styles.tokenIcon, token.type === "lending" && styles.tokenIconPurple]}>
          <Ionicons name={token.icon as any} size={24} color="#fff" />
        </View>
      </View>
      <View style={styles.tokenInfo}>
        <Text style={styles.tokenName}>{token.name}</Text>
        <View style={styles.tokenSubInfo}>
          {token.apy && (
            <Text style={styles.tokenApy}>Earn {token.apy}% APY</Text>
          )}
          {!token.apy && (
            <Text style={styles.tokenBalance}>
              {token.balance} {token.symbol}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.tokenValueContainer}>
        <Text style={styles.tokenUsdValue}>${token.usdValue}</Text>
        {token.changePercent !== "0" && (
          <View style={styles.tokenChangeContainer}>
            <Ionicons
              name={token.isPositive ? "arrow-up" : "arrow-down"}
              size={12}
              color={token.isPositive ? "#10B981" : "#EF4444"}
            />
            <Text
              style={[
                styles.tokenChange,
                token.isPositive ? styles.tokenChangePositive : styles.tokenChangeNegative,
                { marginLeft: 4 },
              ]}
            >
              {token.changePercent}%
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // Calculate total balance from all token balances
  const totalBalance = useMemo(() => {
    const total = tokenBalances.reduce((sum, token) => {
      const usdValue = parseFloat(token.usdValue) || 0;
      return sum + usdValue;
    }, 0);
    return total.toFixed(2);
  }, [tokenBalances]);

  const cashBalances = tokenBalances.filter((t) => t.type === "lending");
  const otherBalances = tokenBalances.filter((t) => t.type === "token");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Total Balance */}
        <View style={styles.balanceContainer}>
          <Text style={styles.totalBalance}>${totalBalance}</Text>
          <View style={styles.balanceChangeContainer}>
            <Text style={styles.balanceChangeValue}>${balanceChange.value}</Text>
            <View style={[styles.balanceChangePercentContainer, { marginLeft: 8 }]}>
              <Ionicons
                name="arrow-up"
                size={12}
                color="#10B981"
                style={styles.balanceChangeArrow}
              />
              <Text style={styles.balanceChangePercent}>{balanceChange.percent}%</Text>
            </View>
          </View>
        </View>

        {/* Referral Rewards Banner */}
        {showReferralBanner && (
          <View style={styles.referralBanner}>
            <View style={styles.referralBannerContent}>
              <View style={styles.referralIconContainer}>
                <Ionicons name="cash-outline" size={20} color="#fff" />
              </View>
              <View style={styles.referralTextContainer}>
                <Text style={styles.referralTitle}>Referral Rewards</Text>
                <Text style={styles.referralSubtitle}>Invite friends & earn 20% of trading fees.</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowReferralBanner(false)}
                style={styles.referralCloseButton}
              >
                <Ionicons name="close" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.referralPagination}>
              <View style={[styles.paginationDot, styles.paginationDotActive, { marginLeft: 0 }]} />
              <View style={styles.paginationDot} />
              <View style={styles.paginationDot} />
              <View style={styles.paginationDot} />
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="arrow-down" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Deposit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="arrow-up" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { marginRight: 0 }]}>
            <Ionicons name="swap-horizontal-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Swap</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Tokens" && styles.tabActive]}
            onPress={() => setActiveTab("Tokens")}
          >
            <Text style={[styles.tabText, activeTab === "Tokens" && styles.tabTextActive]}>
              Tokens
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Collectibles" && styles.tabActive]}
            onPress={() => setActiveTab("Collectibles")}
          >
            <Text style={[styles.tabText, activeTab === "Collectibles" && styles.tabTextActive]}>
              Collectibles
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "History" && styles.tabActive]}
            onPress={() => setActiveTab("History")}
          >
            <Text style={[styles.tabText, activeTab === "History" && styles.tabTextActive]}>
              History
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cash Balance Section */}
        {activeTab === "Tokens" && cashBalances.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cash Balance</Text>
            {cashBalances.map(renderTokenItem)}
          </View>
        )}

        {/* Other Balances Section */}
        {activeTab === "Tokens" && otherBalances.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Other Balances</Text>
            {otherBalances.map(renderTokenItem)}
          </View>
        )}

        {/* Show All Button */}
        {activeTab === "Tokens" && (
          <TouchableOpacity style={styles.showAllButton}>
            <Text style={styles.showAllButtonText}>Show all</Text>
            <Ionicons name="chevron-down" size={16} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Collectibles Tab Content */}
        {activeTab === "Collectibles" && (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No collectibles yet</Text>
          </View>
        )}

        {/* History Tab Content */}
        {activeTab === "History" && (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No transaction history</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 20,
  },
  balanceContainer: {
    marginTop: 20,
    marginBottom: 24,
  },
  totalBalance: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  balanceChangeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceChangeValue: {
    fontSize: 16,
    color: "#10B981",
    fontWeight: "500",
  },
  balanceChangePercentContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceChangeArrow: {
    marginRight: 2,
  },
  balanceChangePercent: {
    fontSize: 16,
    color: "#10B981",
    fontWeight: "500",
  },
  referralBanner: {
    backgroundColor: "#6B21A8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    position: "relative",
  },
  referralBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  referralIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  referralTextContainer: {
    flex: 1,
  },
  referralTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  referralSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
  },
  referralCloseButton: {
    padding: 4,
  },
  referralPagination: {
    flexDirection: "row",
    alignSelf: "flex-end",
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginLeft: 6,
  },
  paginationDotActive: {
    backgroundColor: theme.surface,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#10B981",
  },
  tabText: {
    fontSize: 16,
    color: theme.textSecondary,
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 12,
    fontWeight: "500",
  },
  tokenItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  tokenIconContainer: {
    marginRight: 12,
  },
  tokenIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  tokenIconPurple: {
    backgroundColor: "#8B5CF6",
  },
  tokenInfo: {
    flex: 1,
  },
  tokenName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  tokenSubInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  tokenBalance: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  tokenApy: {
    fontSize: 14,
    color: "#10B981",
  },
  tokenValueContainer: {
    alignItems: "flex-end",
  },
  tokenUsdValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  tokenChangeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  tokenChange: {
    fontSize: 14,
    fontWeight: "500",
  },
  tokenChangePositive: {
    color: "#10B981",
  },
  tokenChangeNegative: {
    color: "#EF4444",
  },
  showAllButton: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  showAllButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  emptyStateContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.textSecondary,
  },
});

export default WalletScreen;

