import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Alert, ActivityIndicator } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { Button } from "../Components/Button";
import { getWallet } from "../utils/wallet";
import { submitDPoPAuth } from "../dpop";
import AnimatedSignature from "../Components/AnimatedSignature";

interface DPoPAuthScreenProps {
  navigation: any;
}

const DPoPAuthScreen: React.FC<DPoPAuthScreenProps> = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    console.log("ATTEMPTING TO CONNECT");
    const socket = new WebSocket("ws://192.168.1.153:8080");
    setSocket(socket);
    socket.onopen = () => {
      console.log("Connected");
      setInterval(() => {
        socket.send(JSON.stringify({ type: "ping" }));
      }, 30000); // ping every 30 seconds
    };

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log("Message from server: ", data);
      if (data.type === "pong") {
        console.log("Pong received");
      }
    };
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setLoading(true);

    try {
      // Parse the QR code data to get the client ID
      let client_id;
      let client_sig;
      try {
        console.log("data", data);
        const parsedData = JSON.parse(data);
        client_id = parsedData.client_id;
        client_sig = parsedData.client_sig;
      } catch (e) {}

      if (!client_id) {
        Alert.alert("Error", "Invalid QR code. No client ID found.");
        setLoading(false);
        return;
      }

      // Get the wallet to sign the message
      const wallet = await getWallet();

      const auth_id = `DPoP:WiredInSamurai:${wallet.address}`;

      // Create a DPoP proof by signing the client ID
      const auth_sig = await wallet.signMessage(client_id);

      const result = await submitDPoPAuth({
        client_id: client_id,
        client_sig: client_sig,
        auth_id: auth_id,
        auth_sig: auth_sig,
      });

      console.log("DPoP Auth result", result);
      socket?.send(
        JSON.stringify({
          type: "authenticate",
          client_id: client_id,
          client_sig: client_sig,
          auth_id: auth_id,
          auth_sig: auth_sig,
        })
      );

      Alert.alert(
        "Authentication Successful",
        `Client ID: ${client_id}\nWallet Address: ${wallet.address}`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error("Authentication error:", error);
      Alert.alert(
        "Authentication Failed",
        (error as Error).message || "An error occurred during authentication"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleScanAgain = () => {
    setScanned(false);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera. Please enable camera permissions.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.scannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.scanner}
        />
      </View>

      <View style={styles.overlay}>
        <Text style={styles.title}>DPoP Authentication</Text>
        <Text style={styles.instructions}>
          Scan a QR code containing a client ID
        </Text>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Processing authentication...</Text>
          </View>
        )}

        {scanned && !loading && (
          <Button title="Scan Again" onPress={handleScanAgain} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  scannerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scanner: {
    flex: 1,
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  instructions: {
    fontSize: 16,
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  loadingText: {
    color: "white",
    marginTop: 10,
  },
});

export default DPoPAuthScreen;
