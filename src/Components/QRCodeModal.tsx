import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Modal, Alert, Image } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import QRCode from "react-qr-code";
import Icon, { IconTypes } from "./Icon";
import { useAuth } from "../context/Auth";
import { theme } from "../colors";

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
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  // Get user profile data for QR code
  const getUserQRData = () => {
    if (!authState.isAuthenticated || !authState.user) {
      return null;
    }

    const userData = {
      type: "renaissance_profile",
      fid: authState.user.fid,
      username: authState.user.username,
      displayName: authState.user.displayName,
      pfpUrl: authState.user.pfpUrl,
    };

    return JSON.stringify(userData);
  };

  useEffect(() => {
    if (isVisible && activeTab === "scan") {
      (async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === "granted");
      })();
    }
  }, [isVisible, activeTab]);

  useEffect(() => {
    if (!isVisible) {
      setActiveTab("share");
      setScanned(false);
    }
  }, [isVisible]);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    
    try {
      const parsedData = JSON.parse(data);
      if (parsedData.type === "renaissance_profile") {
        // Handle profile QR code scan
        Alert.alert(
          "Profile Found",
          `@${parsedData.username || "user"}`,
          [
            { text: "View Profile", onPress: () => onScanResult?.(data) },
            { text: "Cancel", onPress: () => setScanned(false), style: "cancel" },
          ]
        );
      } else {
        onScanResult?.(data);
      }
    } catch (e) {
      // Not JSON, treat as plain text
      onScanResult?.(data);
    }

    // Reset after 2 seconds
    setTimeout(() => {
      setScanned(false);
    }, 2000);
  };

  const qrData = getUserQRData();

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
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
                {qrData ? (
                  <>
                    <View style={styles.qrCodeContainer}>
                      <View style={styles.qrCodeWrapper}>
                        <QRCode value={qrData} size={200} />
                        {authState.user?.pfpUrl && (
                          <View style={styles.avatarOverlay}>
                            <Image
                              key={authState.user.pfpUrl}
                              source={{ uri: authState.user.pfpUrl }}
                              style={styles.avatarImage}
                            />
                          </View>
                        )}
                      </View>
                    </View>
                    {authState.user?.username && (
                      <Text style={styles.username}>@{authState.user.username}</Text>
                    )}
                    <Text style={styles.instruction}>
                      Scan this code to view my profile
                    </Text>
                  </>
                ) : (
                  <View style={styles.notAuthenticatedContainer}>
                    <Text style={styles.notAuthenticatedText}>
                      Please log in to view your profile QR code
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.scanContainer}>
                {hasPermission === null ? (
                  <View style={styles.centerContainer}>
                    <Text style={styles.permissionText}>Requesting camera permission...</Text>
                  </View>
                ) : hasPermission === false ? (
                  <View style={styles.centerContainer}>
                    <Text style={styles.permissionText}>
                      No access to camera. Please enable camera permissions.
                    </Text>
                    <TouchableOpacity
                      style={styles.permissionButton}
                      onPress={async () => {
                        const { status } = await BarCodeScanner.requestPermissionsAsync();
                        setHasPermission(status === "granted");
                      }}
                    >
                      <Text style={styles.permissionButtonText}>Grant Permission</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <BarCodeScanner
                      onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                      style={styles.scanner}
                      barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
                    />
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
                          onPress={() => setScanned(false)}
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
  },
  displayContainer: {
    alignItems: "center",
    width: "100%",
    height: 300,
    justifyContent: "center",
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
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarOverlay: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
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
});

