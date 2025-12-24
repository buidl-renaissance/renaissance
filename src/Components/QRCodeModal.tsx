import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Modal, Alert, Image } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import QRCode from "react-qr-code";
import Icon, { IconTypes } from "./Icon";
import { useAuth } from "../context/Auth";

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
            <Text style={styles.title}>QR Code</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon type={IconTypes.Ionicons} name="close" size={24} color="#333" />
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
                        <QRCode value={qrData} size={240} />
                        {authState.user?.pfpUrl && (
                          <View style={styles.avatarOverlay}>
                            <Image
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
                    <View style={styles.scanOverlay}>
                      <Text style={styles.scanInstruction}>
                        Position the QR code within the frame
                      </Text>
                      {scanned && (
                        <TouchableOpacity
                          style={styles.scanAgainButton}
                          onPress={() => setScanned(false)}
                        >
                          <Text style={styles.scanAgainText}>Scan Again</Text>
                        </TouchableOpacity>
                      )}
                    </View>
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
    backgroundColor: "white",
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
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#3449ff",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: "#3449ff",
  },
  contentContainer: {
    minHeight: 300,
  },
  displayContainer: {
    alignItems: "center",
  },
  qrCodeContainer: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
  },
  qrCodeWrapper: {
    position: "relative",
    width: 240,
    height: 240,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarOverlay: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  username: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  instruction: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  notAuthenticatedContainer: {
    alignItems: "center",
    padding: 20,
  },
  notAuthenticatedText: {
    fontSize: 16,
    color: "#666",
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
  scanOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  scanInstruction: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
  },
  scanAgainButton: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "center",
  },
  scanAgainText: {
    color: "#333",
    fontWeight: "600",
  },
  permissionText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#3449ff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

