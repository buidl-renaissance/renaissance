import React, { useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useVisionCamera, Camera } from '../hooks/useVisionCamera';

const CameraScreen = () => {
  const { device, hasPermission, requestPermission } = useVisionCamera('back');
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    alert(`QR code scanned: ${data}`);
    setTimeout(() => {
      setScanned(false);
    }, 2000);
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text>No access to camera. Please enable camera permissions.</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text>No camera device available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        device={device}
        isActive={true}
        // TODO: Add barcode scanner frame processor
        // frameProcessor={barcodeScanner.frameProcessor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
  },
});

export default CameraScreen;
