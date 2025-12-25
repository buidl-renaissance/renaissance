import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getWallet } from "../utils/wallet";

interface WalletScreenProps {
  navigation: any;
}

const WalletScreen: React.FC<WalletScreenProps> = ({ navigation }) => {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWalletInfo();
  }, []);

  const loadWalletInfo = async () => {
    try {
      setIsLoading(true);
      const wallet = await getWallet();
      setWalletAddress(wallet.address);
    } catch (error) {
      console.error("Error loading wallet:", error);
      Alert.alert("Error", "Failed to load wallet information");
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>Loading wallet...</Text>
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <Ionicons name="wallet" size={48} color="#6366F1" />
              <Text style={styles.title}>Wallet</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Address</Text>
              <View style={styles.addressContainer}>
                <Text style={styles.addressText} numberOfLines={1}>
                  {walletAddress}
                </Text>
              </View>
              <Text style={styles.shortAddress}>{formatAddress(walletAddress)}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Network</Text>
              <Text style={styles.cardValue}>Ethereum</Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoText}>
                This is your wallet address. You can use it to receive tokens and interact with
                decentralized applications.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 400,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
  },
  card: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  cardLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
  },
  cardValue: {
    fontSize: 18,
    color: "#333",
    fontWeight: "600",
  },
  addressContainer: {
    marginBottom: 8,
  },
  addressText: {
    fontSize: 16,
    color: "#333",
    fontFamily: "monospace",
  },
  shortAddress: {
    fontSize: 14,
    color: "#999",
    fontFamily: "monospace",
  },
  infoSection: {
    marginTop: 8,
    padding: 16,
    backgroundColor: "#f0f4ff",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#6366F1",
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});

export default WalletScreen;

