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
  TextInput,
  ActivityIndicator,
  Clipboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Modal from "react-native-modal";
import Icon, { IconTypes } from "./Icon";
import { getWallet } from "../utils/wallet";
import { useUSDCBalance } from "../hooks/useUSDCBalance";
import { useAuth } from "../context/Auth";
import { sendUSDC } from "../api/send-usdc";
import QRCode from "react-qr-code";
import { ethers } from "ethers";
import { CameraView, useCameraPermissions } from "expo-camera";

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
  const { state: authState } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string>("");
  const { balance: totalBalance } = useUSDCBalance();
  const [isDismissing, setIsDismissing] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isDraggingDown, setIsDraggingDown] = useState(false);
  const isAtTopRef = useRef(true);
  const translateY = useRef(new Animated.Value(0)).current;
  
  // Send/Receive state
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [sendRecipient, setSendRecipient] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  // QR Scanner state
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

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

  // Reset scanned state when QR scanner closes
  useEffect(() => {
    if (!showQRScanner) {
      setScanned(false);
    }
  }, [showQRScanner]);

  // Reset QR scanner state when Send Modal closes
  useEffect(() => {
    if (!showSendModal) {
      setShowQRScanner(false);
      setScanned(false);
    }
  }, [showSendModal]);

  // Extract wallet address from QR code data
  const extractAddress = (data: string): string | null => {
    // Remove whitespace
    const trimmed = data.trim();
    
    // Check if it's a valid Ethereum address directly
    if (ethers.utils.isAddress(trimmed)) {
      return ethers.utils.getAddress(trimmed); // Normalize to checksum address
    }
    
    // Check for ethereum: scheme (e.g., "ethereum:0x...")
    const ethereumMatch = trimmed.match(/^ethereum:(0x[a-fA-F0-9]{40})$/i);
    if (ethereumMatch) {
      return ethers.utils.getAddress(ethereumMatch[1]);
    }
    
    // Check for other common formats
    const addressMatch = trimmed.match(/(0x[a-fA-F0-9]{40})/i);
    if (addressMatch) {
      return ethers.utils.getAddress(addressMatch[1]);
    }
    
    return null;
  };

  const handleQRCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    
    const address = extractAddress(data);
    
    if (address) {
      setSendRecipient(address);
      setShowQRScanner(false);
      setScanned(false);
      // Address populated, user can now enter amount and send
    } else {
      Alert.alert(
        "Invalid QR Code",
        "The scanned QR code does not contain a valid wallet address.",
        [
          {
            text: "Try Again",
            onPress: () => {
              setTimeout(() => setScanned(false), 1000);
            },
          },
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              setShowQRScanner(false);
              setScanned(false);
            },
          },
        ]
      );
    }
  };

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

  const handleSend = async () => {
    if (!sendRecipient || !sendAmount) {
      Alert.alert("Error", "Please enter recipient address and amount");
      return;
    }

    if (!ethers.utils.isAddress(sendRecipient)) {
      Alert.alert("Error", "Invalid recipient address");
      return;
    }

    const amount = parseFloat(sendAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (totalBalance === null) {
      Alert.alert("Error", "Balance not loaded yet");
      return;
    }

    const balance = parseFloat(totalBalance);
    if (amount > balance) {
      Alert.alert("Error", "Insufficient balance");
      return;
    }

    // Confirm transaction
    Alert.alert(
      "Confirm Transaction",
      `Send ${sendAmount} USDC to\n${sendRecipient.slice(0, 6)}...${sendRecipient.slice(-4)}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              setIsSending(true);
              const txHash = await sendUSDC(sendRecipient, sendAmount);
              Alert.alert(
                "Success",
                `Transaction sent successfully!\n\nTransaction hash: ${txHash.substring(0, 10)}...${txHash.substring(txHash.length - 8)}`,
                [
                  {
                    text: "OK",
                    onPress: () => {
                      setShowSendModal(false);
                      setSendRecipient("");
                      setSendAmount("");
                    },
                  },
                ]
              );
            } catch (error: any) {
              const errorMessage = error?.message || "Failed to send USDC";
              
              // Provide helpful message for gas fee errors
              if (errorMessage.includes("gas") || errorMessage.includes("ETH") || errorMessage.includes("allowance")) {
                Alert.alert(
                  "Insufficient Gas Fees",
                  "You need testnet ETH on Base Sepolia to pay for transaction fees.\n\nYou can get testnet ETH from a Base Sepolia faucet.",
                  [{ text: "OK" }]
                );
              } else {
                Alert.alert("Error", errorMessage);
              }
            } finally {
              setIsSending(false);
            }
          },
        },
      ]
    );
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
          <View style={styles.titleContainer}>
            <Text style={styles.titleHeaderText}>Wallet</Text>
            {walletAddress && (
              <Text style={styles.walletAddressText}>
                {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
              </Text>
            )}
          </View>
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
            <Text style={styles.totalBalance}>
              {totalBalance !== null ? `$${totalBalance}` : ""}
            </Text>
          </View>

          {/* Send/Receive Actions */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                setShowSendModal(true);
                setShowQRScanner(true); // Start with QR scanner
              }}
            >
              <Ionicons name="arrow-up" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setShowReceiveModal(true)}
            >
              <Ionicons name="arrow-down" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Receive</Text>
            </TouchableOpacity>
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

      {/* Send Modal */}
      <Modal
        isVisible={showSendModal}
        onBackdropPress={() => setShowSendModal(false)}
        onBackButtonPress={() => setShowSendModal(false)}
        style={styles.sendModal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.sendModalContent}>
          <View style={styles.sendModalHeader}>
            <Text style={styles.sendModalTitle}>Send USDC</Text>
            <TouchableOpacity onPress={() => setShowSendModal(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.sendForm}>
            {!showQRScanner ? (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Recipient Address</Text>
                  <View style={styles.inputWithButton}>
                    <TextInput
                      style={[styles.input, { flex: 1, backgroundColor: "transparent" }]}
                      placeholder="0x..."
                      placeholderTextColor="#6B7280"
                      value={sendRecipient}
                      onChangeText={setSendRecipient}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={styles.qrButton}
                      onPress={() => {
                        setShowQRScanner(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="qr-code-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Amount (USDC)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor="#6B7280"
                value={sendAmount}
                onChangeText={setSendAmount}
                keyboardType="decimal-pad"
              />
              <TouchableOpacity
                style={styles.maxButton}
                onPress={() => {
                  if (totalBalance !== null) {
                    setSendAmount(totalBalance);
                  }
                }}
                disabled={totalBalance === null}
              >
                <Text style={styles.maxButtonText}>MAX</Text>
              </TouchableOpacity>
            </View>

                <TouchableOpacity
                  style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
                  onPress={handleSend}
                  disabled={isSending || !sendRecipient || !sendAmount}
                >
                  {isSending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.sendButtonText}>Send</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.qrScannerContainer}>
                <View style={styles.qrScannerHeader}>
                  <TouchableOpacity
                    onPress={() => {
                      setShowQRScanner(false);
                      setScanned(false);
                    }}
                    style={styles.qrScannerBackButton}
                  >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.qrScannerTitle}>Scan Wallet Address</Text>
                  <View style={{ width: 24 }} />
                </View>

                {!permission && (
                  <View style={styles.qrScannerBody}>
                    <Text style={styles.qrScannerText}>Requesting camera permission...</Text>
                  </View>
                )}

                {permission && !permission.granted && (
                  <View style={styles.qrScannerBody}>
                    <Text style={styles.qrScannerText}>Camera permission is required to scan QR codes</Text>
                    <TouchableOpacity
                      style={styles.permissionButton}
                      onPress={requestPermission}
                    >
                      <Text style={styles.permissionButtonText}>Grant Permission</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {permission && permission.granted && (
                  <View style={styles.qrScannerBody}>
                    <CameraView
                      style={styles.qrScanner}
                      facing="back"
                      onBarcodeScanned={scanned ? undefined : handleQRCodeScanned}
                      barcodeScannerSettings={{
                        barcodeTypes: ["qr"],
                      }}
                    />
                    <View style={styles.scanFrameOverlay}>
                      <View style={styles.scanFrame} />
                      <Text style={styles.scanInstructions}>Position the QR code within the frame</Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Receive Modal */}
      <Modal
        isVisible={showReceiveModal}
        onBackdropPress={() => setShowReceiveModal(false)}
        onBackButtonPress={() => setShowReceiveModal(false)}
        style={styles.receiveModal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.receiveModalContent}>
          <View style={styles.receiveModalHeader}>
            <Text style={styles.receiveModalTitle}>Receive USDC</Text>
            <TouchableOpacity onPress={() => setShowReceiveModal(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.receiveContent}>
            {walletAddress && (
              <>
                <View style={styles.qrCodeContainer}>
                  <QRCode value={walletAddress} size={200} />
                </View>
                <Text style={styles.walletAddressFull}>{walletAddress}</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={async () => {
                    if (walletAddress) {
                      await Clipboard.setString(walletAddress);
                      Alert.alert("Copied", "Wallet address copied to clipboard");
                    }
                  }}
                >
                  <Ionicons name="copy-outline" size={20} color="#fff" />
                  <Text style={styles.copyButtonText}>Copy Address</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

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
  titleContainer: {
    flex: 1,
  },
  titleHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  walletAddressText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "monospace",
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
  actionButtonsContainer: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  sendModal: {
    margin: 0,
    justifyContent: "flex-end",
    zIndex: 100,
    elevation: 100,
  },
  sendModalContent: {
    backgroundColor: "#000",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  sendModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  sendModalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  sendForm: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    color: "#fff",
    fontSize: 16,
  },
  maxButton: {
    position: "absolute",
    right: 12,
    top: 40,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#3B82F6",
    borderRadius: 8,
  },
  maxButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  sendButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  receiveModal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  receiveModalContent: {
    backgroundColor: "#000",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  receiveModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  receiveModalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  receiveContent: {
    alignItems: "center",
    gap: 20,
  },
  qrCodeContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
  },
  walletAddressFull: {
    fontSize: 14,
    color: "#9CA3AF",
    fontFamily: "monospace",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  copyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  inputWithButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    paddingRight: 8,
  },
  qrButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  qrScannerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  qrScannerContent: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  qrScannerInnerContent: {
    backgroundColor: "#000",
    borderRadius: 16,
    overflow: "hidden",
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  qrScannerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  qrScannerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  qrScannerBody: {
    width: "100%",
    height: 400,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  qrScanner: {
    width: "100%",
    height: "100%",
  },
  qrScannerText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#10B981",
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 24,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  scanFrameOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#10B981",
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  scanInstructions: {
    position: "absolute",
    bottom: 40,
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  qrScannerContainer: {
    width: "100%",
    height: 500,
  },
  qrScannerBackButton: {
    padding: 4,
  },
});

