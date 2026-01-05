import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

const CameraScreen = () => {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = React.useState(false);
  
    const handleBarCodeScanned = ({ data }: { data: string }) => {
      setScanned(true);
      alert(`QR code scanned: ${data}`);
      setTimeout(() => {
        setScanned(false);
      }, 2000);
    };

    if (!permission) {
      return (
        <View style={styles.container}>
          <Text>Requesting camera permission...</Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={styles.container}>
          <Text>No access to camera. Please enable camera permissions.</Text>
        </View>
      );
    }

    return (
        <View style={styles.container}>
            <CameraView 
                style={styles.camera}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            />
        </View>
    );
}
    
const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#d2e4dd',
        // padding: 8,
        // alignItems: 'center',
        // justifyContent: 'center',
        // paddingBottom: 64,
        // borderColor: '#999',
        // borderTopWidth: 1,
    },
    camera: {
       flex: 1,
    }
});

export default CameraScreen;
