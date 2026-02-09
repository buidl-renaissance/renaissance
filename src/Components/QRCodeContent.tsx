import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import QRCode from "react-qr-code";
import Icon, { IconTypes } from "./Icon";
import { useAuth } from "../context/Auth";
import { theme } from "../colors";
import {
  generateConnectionRequest,
  createConnection,
  ConnectionRequest,
  getConnectionsForUser,
} from "../utils/connections";
import { getWallet } from "../utils/wallet";
import { CameraView, useCameraPermissions } from "expo-camera";

export interface QRCodeContentProps {
  /** Whether the content is currently visible (controls QR generation) */
  isVisible?: boolean;
  /** Called when a QR code is scanned (non-connection data) */
  onScanResult?: (data: string) => void;
  /** Called when a connection is successfully created */
  onConnectionCreated?: () => void;
  /** Called when an authentication QR code is scanned (token, optional callbackUrl and appName from URL) */
  onAuthenticationScan?: (token: string, callbackUrl?: string, appName?: string) => void;
  /** Initial tab to show */
  initialTab?: "share" | "scan";
  /** Style for the container */
  containerStyle?: object;
  /** Whether to show the tab switcher */
  showTabs?: boolean;
}

export const QRCodeContent: React.FC<QRCodeContentProps> = ({
  isVisible = true,
  onScanResult,
  onConnectionCreated,
  onAuthenticationScan,
  initialTab = "share",
  containerStyle,
  showTabs = true,
}) => {
  const { state: authState } = useAuth();
  // On Android, always use "share" tab due to camera bug
  const isAndroid = Platform.OS === "android";
  const effectiveInitialTab = isAndroid ? "share" : initialTab;
  const [activeTab, setActiveTab] = useState<"share" | "scan">(effectiveInitialTab);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isGeneratingConnection, setIsGeneratingConnection] = useState(false);
  const [connectionQrData, setConnectionQrData] = useState<string | null>(null);
  const isProcessingScan = useRef(false);
  const lastScannedData = useRef<string | null>(null);

  // Get connection QR code data
  const getConnectionQRData = () => {
    return connectionQrData;
  };

  // Generate connection request QR code
  const generateConnectionQR = useCallback(async () => {
    if (!authState.isAuthenticated || !authState.user) {
      return;
    }

    setIsGeneratingConnection(true);
    try {
      const wallet = await getWallet();
      const userId = authState.user.fid?.toString() || wallet.address;

      const profileUrl = authState.user.username
        ? `https://people.builddetroit.xyz/users/${authState.user.username}`
        : undefined;

      const connectionRequest = await generateConnectionRequest(
        userId,
        wallet.address,
        authState.user.username,
        authState.user.displayName,
        authState.user.pfpUrl,
        profileUrl
      );

      const qrData = JSON.stringify(connectionRequest);
      setConnectionQrData(qrData);
    } catch (error) {
      console.error("Error generating connection QR:", error);
      Alert.alert("Error", "Failed to generate connection QR code");
    } finally {
      setIsGeneratingConnection(false);
    }
  }, [authState.isAuthenticated, authState.user]);

  // Handle app authentication scan
  const handleAppAuthScan = useCallback(
    async (authData: { type: string; token: string; callbackUrl: string; appName?: string }) => {
      if (!authState.isAuthenticated || !authState.user) {
        Alert.alert("Error", "Please log in to authenticate with apps");
        setScanned(false);
        isProcessingScan.current = false;
        lastScannedData.current = null;
        return;
      }

      const appName = authData.appName || "this app";
      
      Alert.alert(
        "Sign In Request",
        `${appName} wants to sign you in. Allow?`,
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
            text: "Allow",
            onPress: async () => {
              try {
                const wallet = await getWallet();
                const userId = authState.user?.fid?.toString() || wallet.address;
                
                // Sign the message to prove ownership (must match server expectation)
                const message = `Authenticate session: ${authData.token}`;
                const signature = await wallet.signMessage(message);
                
                // Make API call to authenticate
                const response = await fetch(authData.callbackUrl, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    token: authData.token,
                    signature,
                    publicAddress: wallet.address,
                    userId,
                    renaissanceId: authState.user?.fid?.toString(),
                    username: authState.user?.username,
                    displayName: authState.user?.displayName,
                    pfpUrl: authState.user?.pfpUrl,
                  }),
                });

                const result = await response.json();

                if (response.ok && result.success) {
                  Alert.alert(
                    "Success",
                    `You are now signed in to ${appName}!`,
                    [
                      {
                        text: "OK",
                        onPress: () => {
                          setScanned(false);
                          isProcessingScan.current = false;
                          lastScannedData.current = null;
                        },
                      },
                    ]
                  );
                } else {
                  throw new Error(result.error || "Authentication failed");
                }
              } catch (error) {
                console.error("App auth error:", error);
                Alert.alert(
                  "Authentication Failed",
                  error instanceof Error ? error.message : "An error occurred"
                );
                setScanned(false);
                isProcessingScan.current = false;
                lastScannedData.current = null;
              }
            },
          },
        ]
      );
    },
    [authState.isAuthenticated, authState.user]
  );

  // Handle connection request scan
  const handleConnectionScan = useCallback(
    async (scannedRequest: ConnectionRequest) => {
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

                Alert.alert(
                  "Success",
                  "Connection request sent! The other user will need to confirm the connection.",
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        setScanned(false);
                        isProcessingScan.current = false;
                        lastScannedData.current = null;
                        onConnectionCreated?.();
                      },
                    },
                  ]
                );
              } catch (error) {
                console.error("Error creating connection:", error);
                const errorMessage =
                  error instanceof Error ? error.message : "Failed to create connection";
                Alert.alert("Error", errorMessage);
                setScanned(false);
                isProcessingScan.current = false;
                lastScannedData.current = null;
              }
            },
          },
        ]
      );
    },
    [authState.isAuthenticated, authState.user, onConnectionCreated]
  );

  // Reset state when visibility changes
  useEffect(() => {
    if (!isVisible) {
      setActiveTab(initialTab);
      setScanned(false);
      setConnectionQrData(null);
      isProcessingScan.current = false;
      lastScannedData.current = null;
    }
  }, [isVisible, initialTab]);

  // Generate QR code when visible and on share tab
  useEffect(() => {
    if (
      isVisible &&
      activeTab === "share" &&
      !connectionQrData &&
      authState.isAuthenticated &&
      authState.user
    ) {
      generateConnectionQR();
    }
  }, [isVisible, activeTab, connectionQrData, authState.isAuthenticated, authState.user, generateConnectionQR]);

  // Parse auth params from URL (token, callbackUrl, appName)
  // Supports deep links (renaissance://authenticate?token=xxx&callbackUrl=...&appName=...)
  // and web URLs (http(s)://*/api/auth/qr-authenticate?token=xxx)
  const parseAuthUrl = useCallback((url: string): { token: string; callbackUrl?: string; appName?: string } | null => {
    const isDeepLink = url.startsWith("renaissance://authenticate");
    const isWebAuthUrl = url.includes("/api/auth/qr-authenticate");
    
    if (!isDeepLink && !isWebAuthUrl) {
      return null;
    }
    
    try {
      const urlObj = new URL(url);
      const token = urlObj.searchParams.get("token");
      if (!token) return null;
      const callbackUrl = urlObj.searchParams.get("callbackUrl") ?? undefined;
      const appName = urlObj.searchParams.get("appName") ?? undefined;
      return { token, callbackUrl, appName };
    } catch (e) {
      const match = url.match(/[?&]token=([^&]+)/);
      if (!match) return null;
      return { token: decodeURIComponent(match[1]) };
    }
  }, []);

  const handleBarCodeScanned = useCallback(
    (event: { data: string }) => {
      const data = event.data;
      console.log("[QRCodeContent] Scan detected:", data?.substring?.(0, 50) || data);

      // Prevent multiple scans
      if (isProcessingScan.current) {
        console.log("[QRCodeContent] Already processing scan, ignoring");
        return;
      }

      // Prevent processing the same QR code data multiple times
      if (lastScannedData.current === data) {
        console.log("[QRCodeContent] Duplicate scan detected, ignoring");
        return;
      }

      // Set both state and ref immediately to prevent duplicate scans
      isProcessingScan.current = true;
      lastScannedData.current = data;
      setScanned(true);

      console.log("[QRCodeContent] Processing scan...");

      // Check if this is an authentication QR code (URL with token)
      const authParams = parseAuthUrl(data);
      if (authParams) {
        console.log("[QRCodeContent] Authentication QR detected, token:", authParams.token, "callbackUrl:", authParams.callbackUrl);
        if (onAuthenticationScan) {
          onAuthenticationScan(authParams.token, authParams.callbackUrl, authParams.appName);
          // Reset scan state after callback
          setScanned(false);
          isProcessingScan.current = false;
          lastScannedData.current = null;
        } else {
          // No handler provided, show alert
          Alert.alert(
            "Sign In Request",
            "This is a web sign-in QR code. Use the deep link or tap the button on the website instead.",
            [
              {
                text: "OK",
                onPress: () => {
                  setScanned(false);
                  isProcessingScan.current = false;
                  lastScannedData.current = null;
                },
              },
            ]
          );
        }
        return;
      }

      try {
        const parsedData = JSON.parse(data);
        if (parsedData.type === "renaissance_connection") {
          // Handle connection request scan
          handleConnectionScan(parsedData as ConnectionRequest);
        } else if (parsedData.type === "renaissance_app_auth") {
          // Handle app authentication scan
          handleAppAuthScan(parsedData);
        } else {
          // Legacy support - if it's a profile QR, try to convert it
          if (parsedData.type === "renaissance_profile") {
            Alert.alert(
              "Profile QR Code",
              "This appears to be a profile QR code. Please use a connection QR code to connect.",
              [
                {
                  text: "OK",
                  onPress: () => {
                    setScanned(false);
                    isProcessingScan.current = false;
                    lastScannedData.current = null;
                  },
                },
              ]
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
        Alert.alert("Invalid QR Code", "This QR code is not a valid connection request.", [
          {
            text: "OK",
            onPress: () => {
              setScanned(false);
              isProcessingScan.current = false;
              lastScannedData.current = null;
            },
          },
        ]);
      }
    },
    [
      handleConnectionScan,
      handleAppAuthScan,
      onScanResult,
      onAuthenticationScan,
      parseAuthUrl,
    ]
  );

  const resetScan = useCallback(() => {
    setScanned(false);
    isProcessingScan.current = false;
    lastScannedData.current = null;
  }, []);

  const qrData = getConnectionQRData();

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Tabs - Hide Scan tab on Android due to camera bug */}
      {showTabs && !isAndroid && (
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
      )}

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
                <Text style={styles.instruction}>Scan this code to connect with me</Text>
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
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
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
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
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
                    <TouchableOpacity style={styles.scanAgainButton} onPress={resetScan}>
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
  );
};

const styles = StyleSheet.create({
  container: {
    // Don't use flex: 1 here as it breaks modal layout
    // Parent should control the height via containerStyle
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: theme.inputBackground,
    borderRadius: 25,
    padding: 4,
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 20,
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
    minHeight: 360,
    overflow: "hidden",
    paddingBottom: 20,
  },
  displayContainer: {
    alignItems: "center",
    width: "100%",
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
    height: 300,
    marginHorizontal: 16,
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

export default QRCodeContent;
