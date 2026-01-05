import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Modal, Alert, Image, ActivityIndicator, Platform } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import QRCode from "react-qr-code";
import Icon, { IconTypes } from "./Icon";
import { useAuth } from "../context/Auth";
import { theme } from "../colors";
import { generateConnectionRequest, createConnection, ConnectionRequest, getConnectionsForUser } from "../utils/connections";
import { getWallet } from "../utils/wallet";

interface QRCodeModalProps {
  isVisible: boolean;
  onClose: () => void;
  onScanResult?: (data: string) => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isVisible,
  onClose,
  onScanResult,
}) => {
  const { state: authState } = useAuth();
  const [activeTab, setActiveTab] = useState<"share" | "scan">("share");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isGeneratingConnection, setIsGeneratingConnection] = useState(false);
  const [connectionQrData, setConnectionQrData] = useState<string | null>(null);
  const isProcessingScan = React.useRef(false);
  const lastScannedData = React.useRef<string | null>(null);

  // Get connection QR code data
  const getConnectionQRData = () => {
    return connectionQrData;
  };

  // Generate connection request QR code
  const generateConnectionQR = async () => {
    if (!authState.isAuthenticated || !authState.user) {
      Alert.alert("Error", "Please log in to generate a connection QR code");
      return;
    }

    setIsGeneratingConnection(true);
    try {
      const wallet = await getWallet();
      const userId = authState.user.fid?.toString() || wallet.address;
      
      const connectionRequest = await generateConnectionRequest(
        userId,
        wallet.address,
        authState.user.username,
        authState.user.displayName,
        authState.user.pfpUrl
      );

      const qrData = JSON.stringify(connectionRequest);
      setConnectionQrData(qrData);
    } catch (error) {
      console.error("Error generating connection QR:", error);
      Alert.alert("Error", "Failed to generate connection QR code");
    } finally {
      setIsGeneratingConnection(false);
    }
  };

  // Handle connection request scan
  const handleConnectionScan = async (scannedRequest: ConnectionRequest) => {
    if (!authState.isAuthenticated || !authState.user) {
      Alert.alert("Error", "Please log in to connect with other users");
      setScanned(false);
      isProcessingScan.current = false;
      lastScannedData.current = null;
      return;
    }

    const wallet = await getWallet();
    const currentUserId = authState.user.fid?.toString() || wallet.address;

    // Check if trying to connect with self
    if (scannedRequest.userId === currentUserId) {
      Alert.alert("Error", "You cannot connect with yourself");
      setScanned(false);
      isProcessingScan.current = false;
      lastScannedData.current = null;
      return;
    }

    // Check if already connected
    const existingConnections = await getConnectionsForUser(currentUserId);
    const alreadyConnected = existingConnections.some(
      (conn) =>
        conn.userA.userId === scannedRequest.userId ||
        conn.userB.userId === scannedRequest.userId
    );

    if (alreadyConnected) {
      Alert.alert("Already Connected", "You are already connected with this user");
      setScanned(false);
      isProcessingScan.current = false;
      lastScannedData.current = null;
      return;
    }

    Alert.alert(
      "Connect with User",
      `Connect with @${scannedRequest.username || scannedRequest.userId}?`,
      [
        {
          text: "Cancel",
          onPress: () => {
            setScanned(false);
            isProcessingScan.current = false;
            lastScannedData.current = null;
          },
          style: "cancel",
        },
        {
          text: "Connect",
          onPress: async () => {
            try {
              if (!authState.user) {
                Alert.alert("Error", "User not authenticated");
                setScanned(false);
                isProcessingScan.current = false;
                lastScannedData.current = null;
                return;
              }
              
              await createConnection(scannedRequest, {
                userId: currentUserId,
                walletAddress: wallet.address,
                username: authState.user.username,
                displayName: authState.user.displayName,
                pfpUrl: authState.user.pfpUrl,
              });

              Alert.alert("Success", "Connection created successfully!", [
                { text: "OK", onPress: () => {
                  setScanned(false);
                  isProcessingScan.current = false;
                  lastScannedData.current = null;
                  onClose();
                }},
              ]);
            } catch (error) {
              console.error("Error creating connection:", error);
              Alert.alert("Error", "Failed to create connection");
              setScanned(false);
              isProcessingScan.current = false;
              lastScannedData.current = null;
            }
          },
        },
      ]
    );
  };

  // Permission is handled by useCameraPermissions hook

  useEffect(() => {
    if (!isVisible) {
      setActiveTab("share");
      setScanned(false);
      setConnectionQrData(null);
      isProcessingScan.current = false;
      lastScannedData.current = null;
    }
  }, [isVisible]);

  useEffect(() => {
    // Generate QR code when modal is visible, on share tab, user is authenticated, and QR data doesn't exist
    if (isVisible && activeTab === "share" && !connectionQrData && authState.isAuthenticated && authState.user) {
      generateConnectionQR();
    }
  }, [isVisible, activeTab, connectionQrData, authState.isAuthenticated, authState.user]);

  const handleBarCodeScanned = React.useCallback(({ data }: { data: string }) => {
    console.log("[QRCodeModal] Scan detected:", data?.substring?.(0, 50) || data);
    
    // Prevent multiple scans using ref to avoid race conditions
    // Check ref first (synchronous) before any state checks
    if (isProcessingScan.current) {
      console.log("[QRCodeModal] Already processing scan, ignoring");
      return;
    }
    
    // Prevent processing the same QR code data multiple times
    if (lastScannedData.current === data) {
      console.log("[QRCodeModal] Duplicate scan detected, ignoring");
      return;
    }
    
    // Set both state and ref immediately to prevent duplicate scans
    isProcessingScan.current = true;
    lastScannedData.current = data;
    setScanned(true);
    
    console.log("[QRCodeModal] Processing scan...");
    
    try {
      const parsedData = JSON.parse(data);
      if (parsedData.type === "renaissance_connection") {
        // Handle connection request scan
        handleConnectionScan(parsedData as ConnectionRequest);
      } else {
        // Legacy support - if it's a profile QR, try to convert it
        if (parsedData.type === "renaissance_profile") {
          Alert.alert(
            "Profile QR Code",
            "This appears to be a profile QR code. Please use a connection QR code to connect.",
            [{ 
              text: "OK", 
              onPress: () => {
                setScanned(false);
                isProcessingScan.current = false;
                lastScannedData.current = null;
              }
            }]
          );
        } else {
          onScanResult?.(data);
          // Reset after callback
          setScanned(false);
          isProcessingScan.current = false;
          lastScannedData.current = null;
        }
      }
    } catch (e) {
      // Not JSON, treat as plain text
      Alert.alert(
        "Invalid QR Code",
        "This QR code is not a valid connection request.",
        [{ 
          text: "OK", 
          onPress: () => {
            setScanned(false);
            isProcessingScan.current = false;
            lastScannedData.current = null;
          }
        }]
      );
    }
  }, [handleConnectionScan, onScanResult]);

  const qrData = getConnectionQRData();

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      {...(Platform.OS === "android" && { hardwareAccelerated: true })}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent} collapsable={false} removeClippedSubviews={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Connect</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon type={IconTypes.Ionicons} name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "share" && styles.activeTab]}
              onPress={() => setActiveTab("share")}
            >
              <Text style={[styles.tabText, activeTab === "share" && styles.activeTabText]}>
                Share
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "scan" && styles.activeTab]}
              onPress={() => setActiveTab("scan")}
            >
              <Text style={[styles.tabText, activeTab === "scan" && styles.activeTabText]}>
                Scan
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            {activeTab === "share" ? (
              <View style={styles.displayContainer}>
                {isGeneratingConnection ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={styles.loadingText}>Generating connection QR code...</Text>
                  </View>
                ) : qrData ? (
                  <>
                    <View style={styles.qrCodeContainer}>
                      <View style={styles.qrCodeWrapper}>
                        <QRCode value={qrData} size={250} />
                      </View>
                    </View>
                    {authState.user?.username && (
                      <Text style={styles.username}>@{authState.user.username}</Text>
                    )}
                    <Text style={styles.instruction}>
                      Scan this code to connect with me
                    </Text>
                  </>
                ) : (
                  <View style={styles.notAuthenticatedContainer}>
                    <Text style={styles.notAuthenticatedText}>
                      Please log in to generate your connection QR code
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.scanContainer} collapsable={false}>
                {!permission ? (
                  <View style={styles.centerContainer}>
                    <Text style={styles.permissionText}>Requesting camera permission...</Text>
                  </View>
                ) : !permission.granted ? (
                  <View style={styles.centerContainer}>
                    <Text style={styles.permissionText}>
                      No access to camera. Please enable camera permissions.
                    </Text>
                    <TouchableOpacity
                      style={styles.permissionButton}
                      onPress={requestPermission}
                    >
                      <Text style={styles.permissionButtonText}>Grant Permission</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <View style={styles.scannerWrapper} collapsable={false}>
                      <CameraView
                        style={styles.scanner}
                        facing="back"
                        autofocus="on"
                        onBarcodeScanned={!scanned ? handleBarCodeScanned : undefined}
                        barcodeScannerSettings={{
                          barcodeTypes: ["qr"],
                        }}
                      />
                    </View>
                    <View style={styles.scanFrameOverlay}>
                      {/* Top-left corner */}
                      <View style={styles.cornerTopLeft}>
                        <View style={[styles.cornerLine, styles.cornerLineHorizontal, { top: 0, left: 0 }]} />
                        <View style={[styles.cornerLine, styles.cornerLineVertical, { top: 0, left: 0 }]} />
                      </View>
                      {/* Top-right corner */}
                      <View style={styles.cornerTopRight}>
                        <View style={[styles.cornerLine, styles.cornerLineHorizontal, { top: 0, right: 0 }]} />
                        <View style={[styles.cornerLine, styles.cornerLineVertical, { top: 0, right: 0 }]} />
                      </View>
                      {/* Bottom-left corner */}
                      <View style={styles.cornerBottomLeft}>
                        <View style={[styles.cornerLine, styles.cornerLineHorizontal, { bottom: 0, left: 0 }]} />
                        <View style={[styles.cornerLine, styles.cornerLineVertical, { bottom: 0, left: 0 }]} />
                      </View>
                      {/* Bottom-right corner */}
                      <View style={styles.cornerBottomRight}>
                        <View style={[styles.cornerLine, styles.cornerLineHorizontal, { bottom: 0, right: 0 }]} />
                        <View style={[styles.cornerLine, styles.cornerLineVertical, { bottom: 0, right: 0 }]} />
                      </View>
                    </View>
                    {scanned && (
                      <View style={styles.scanAgainContainer}>
                        <TouchableOpacity
                          style={styles.scanAgainButton}
                          onPress={() => {
                            setScanned(false);
                            isProcessingScan.current = false;
                            lastScannedData.current = null;
                          }}
                        >
                          <Text style={styles.scanAgainText}>Scan Again</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
    padding: 20,
    overflow: "hidden",
    ...(Platform.OS === "android" && {
      elevation: 24,
    }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.text,
  },
  closeButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: theme.inputBackground,
    borderRadius: 25,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  activeTab: {
    backgroundColor: theme.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.textTertiary,
  },
  activeTabText: {
    color: theme.textOnPrimary,
  },
  contentContainer: {
    minHeight: 300,
    overflow: "hidden",
  },
  displayContainer: {
    alignItems: "center",
    width: "100%",
    minHeight: 300,
    justifyContent: "flex-start",
    paddingVertical: 10,
  },
  qrCodeContainer: {
    padding: 16,
    backgroundColor: theme.surface,
    borderRadius: 12,
    marginBottom: 12,
  },
  qrCodeWrapper: {
    position: "relative",
    width: 250,
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 6,
  },
  instruction: {
    fontSize: 13,
    color: theme.textSecondary,
    textAlign: "center",
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 0,
  },
  notAuthenticatedContainer: {
    alignItems: "center",
    padding: 20,
  },
  notAuthenticatedText: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  scanContainer: {
    width: "100%",
    height: 300,
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: theme.inputBackground,
  },
  scannerWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
    overflow: "hidden",
    borderRadius: 12,
  },
  scanner: {
    width: "100%",
    height: "100%",
  },
  centerContainer: {
    width: "100%",
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
  cornerTopLeft: {
    position: "absolute",
    top: "20%",
    left: "20%",
    width: 40,
    height: 40,
  },
  cornerTopRight: {
    position: "absolute",
    top: "20%",
    right: "20%",
    width: 40,
    height: 40,
  },
  cornerBottomLeft: {
    position: "absolute",
    bottom: "20%",
    left: "20%",
    width: 40,
    height: 40,
  },
  cornerBottomRight: {
    position: "absolute",
    bottom: "20%",
    right: "20%",
    width: 40,
    height: 40,
  },
  cornerLine: {
    position: "absolute",
    backgroundColor: theme.primary,
  },
  cornerLineHorizontal: {
    height: 3,
    width: 40,
  },
  cornerLineVertical: {
    width: 3,
    height: 40,
  },
  scanAgainContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  scanAgainButton: {
    backgroundColor: theme.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  scanAgainText: {
    color: theme.textOnPrimary,
    fontWeight: "600",
    fontSize: 16,
  },
  permissionText: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: theme.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: theme.textOnPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 300,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: theme.textSecondary,
  },
});

