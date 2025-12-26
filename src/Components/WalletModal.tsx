import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  PanResponder,
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Modal from "react-native-modal";
import Icon, { IconTypes } from "./Icon";
import { getWallet } from "../utils/wallet";

interface WalletModalProps {
  isVisible: boolean;
  onClose: () => void;
}

interface RewardHistory {
  id: string;
  title: string;
  description: string;
  amount: string;
  date: string;
  type: "referral" | "trading" | "bonus" | "other";
  icon: string;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isVisible, onClose }) => {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [totalBalance] = useState("31.40");
  const [isDismissing, setIsDismissing] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isDraggingDown, setIsDraggingDown] = useState(false);
  const isAtTopRef = useRef(true);
  const translateY = useRef(new Animated.Value(0)).current;

  // Mock rewards history
  const [rewardsHistory] = useState<RewardHistory[]>([
    {
      id: "1",
      title: "Referral Bonus",
      description: "From friend signup",
      amount: "+$5.20",
      date: "2 days ago",
      type: "referral",
      icon: "people-outline",
    },
    {
      id: "2",
      title: "Trading Fee Reward",
      description: "20% of trading fees",
      amount: "+$2.50",
      date: "1 week ago",
      type: "trading",
      icon: "swap-horizontal-outline",
    },
    {
      id: "3",
      title: "Welcome Bonus",
      description: "New user bonus",
      amount: "+$10.00",
      date: "2 weeks ago",
      type: "bonus",
      icon: "gift-outline",
    },
    {
      id: "4",
      title: "Referral Bonus",
      description: "From friend signup",
      amount: "+$3.75",
      date: "3 weeks ago",
      type: "referral",
      icon: "people-outline",
    },
  ]);

  // Pan responder for drag handle and title header only
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to downward swipes
        return gestureState.dy > 5;
      },
      onPanResponderGrant: () => {
        setIsDraggingDown(true);
        translateY.setOffset(0);
        translateY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward movement
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsDraggingDown(false);
        translateY.flattenOffset();

        // If dragged down more than 100px, dismiss the modal
        if (gestureState.dy > 100) {
          setIsDismissing(true);
          onClose();
          Animated.timing(translateY, {
            toValue: 1000,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            translateY.setValue(0);
            setIsDismissing(false);
          });
        } else {
          // Spring back to original position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        setIsDraggingDown(false);
        translateY.flattenOffset();
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
      },
    })
  ).current;

  // Pan responder for content area when at top
  const contentPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to clear downward drags when at top
        return isAtTopRef.current && gestureState.dy > 10 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        setIsDraggingDown(true);
        translateY.setOffset(0);
        translateY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward movement when at top
        if (isAtTopRef.current && gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsDraggingDown(false);
        translateY.flattenOffset();

        // If dragged down more than 100px, dismiss the modal
        if (gestureState.dy > 100) {
          setIsDismissing(true);
          onClose();
          Animated.timing(translateY, {
            toValue: 1000,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            translateY.setValue(0);
            setIsDismissing(false);
          });
        } else {
          // Spring back to original position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        setIsDraggingDown(false);
        translateY.flattenOffset();
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
      },
    })
  ).current;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const wasAtTop = offsetY <= 0;
    setIsAtTop(wasAtTop);
    isAtTopRef.current = wasAtTop;
  };

  useEffect(() => {
    if (isVisible) {
      setIsDismissing(false);
      setIsAtTop(true);
      isAtTopRef.current = true;
      translateY.setValue(0);
      loadWalletInfo();
    }
  }, [isVisible, translateY]);

  const loadWalletInfo = async () => {
    try {
      const wallet = await getWallet();
      setWalletAddress(wallet.address);
    } catch (error) {
      console.error("Error loading wallet:", error);
      Alert.alert("Error", "Failed to load wallet information");
    }
  };

  const renderRewardItem = (reward: RewardHistory) => (
    <TouchableOpacity key={reward.id} style={styles.rewardItem}>
      <View style={styles.rewardIconContainer}>
        <View style={styles.rewardIcon}>
          <Ionicons name={reward.icon as any} size={24} color="#fff" />
        </View>
      </View>
      <View style={styles.rewardInfo}>
        <Text style={styles.rewardTitle}>{reward.title}</Text>
        <Text style={styles.rewardDescription}>{reward.description}</Text>
        <Text style={styles.rewardDate}>{reward.date}</Text>
      </View>
      <View style={styles.rewardAmountContainer}>
        <Text style={styles.rewardAmount}>{reward.amount}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      isVisible={isVisible && !isDismissing}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriver
      hideModalContentWhileAnimating
      backdropOpacity={0.5}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        {/* Drag handle */}
        <View style={styles.dragHandle} {...panResponder.panHandlers}>
          <View style={styles.dragHandleBar} />
        </View>

        {/* Title header */}
        <View style={styles.titleHeader} {...panResponder.panHandlers}>
          <Text style={styles.titleHeaderText}>Wallet</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon type={IconTypes.Ionicons} name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View 
          style={styles.scrollContainer}
          {...(isAtTop ? contentPanResponder.panHandlers : {})}
        >
          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.content}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            scrollEnabled={!isDraggingDown}
            showsVerticalScrollIndicator={true}
          >
          {/* Total Balance */}
          <View style={styles.balanceContainer}>
            <Text style={styles.totalBalance}>${totalBalance}</Text>
          </View>

          {/* Rewards History Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rewards History</Text>
            {rewardsHistory.length > 0 ? (
              rewardsHistory.map(renderRewardItem)
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>No rewards yet</Text>
              </View>
            )}
          </View>
          </ScrollView>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#000",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: "90%",
    overflow: "hidden",
  },
  dragHandle: {
    paddingTop: 8,
    paddingBottom: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  dragHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#666",
  },
  titleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#000",
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  titleHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  closeButton: {
    padding: 4,
  },
  scrollContainer: {
    flex: 1,
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
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 12,
    fontWeight: "500",
  },
  rewardItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  rewardIconContainer: {
    marginRight: 12,
  },
  rewardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  rewardDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  rewardAmountContainer: {
    alignItems: "flex-end",
  },
  rewardAmount: {
    fontSize: 18,
    fontWeight: "600",
    color: "#10B981",
  },
  emptyStateContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#9CA3AF",
  },
});

