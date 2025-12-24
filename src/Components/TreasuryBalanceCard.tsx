import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TreasuryBalanceCardProps {
  balance?: string;
}

export const TreasuryBalanceCard: React.FC<TreasuryBalanceCardProps> = ({
  balance = "USDC $1,000",
}) => {
  return (
    <View style={styles.chip}>
      <Ionicons name="wallet-outline" size={20} color="white" style={styles.icon} />
      <Text style={styles.balance}>{balance}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
    borderColor: "white",
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 12,
  },
  icon: {
    marginRight: 10,
  },
  balance: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

