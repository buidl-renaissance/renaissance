import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { QRCodeContent } from "../Components/QRCodeContent";
import { theme } from "../colors";

interface QRCodeScreenProps {
  navigation: any;
  route: any;
}

const QRCodeScreen: React.FC<QRCodeScreenProps> = ({ navigation, route }) => {
  // Get initial tab from route params if provided
  const initialTab = route.params?.initialTab || "share";

  // Set header options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Connect",
    });
  }, [navigation]);

  const handleConnectionCreated = useCallback(() => {
    // Navigate back or to connections screen after successful connection
    navigation.goBack();
  }, [navigation]);

  const handleScanResult = useCallback((data: string) => {
    // Handle non-connection QR scan results
    console.log("Scanned data:", data);
  }, []);

  const handleAuthenticationScan = useCallback((token: string) => {
    // Navigate to Authenticate screen with the token
    console.log("[QRCodeScreen] Authentication QR scanned, navigating with token:", token);
    navigation.navigate("Authenticate", { token });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <QRCodeContent
        isVisible={true}
        initialTab={initialTab}
        onConnectionCreated={handleConnectionCreated}
        onScanResult={handleScanResult}
        onAuthenticationScan={handleAuthenticationScan}
        containerStyle={styles.content}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20,
  },
});

export default QRCodeScreen;
