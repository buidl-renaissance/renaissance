import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';

const CameraScreen = () => {
    const [type, setType] = React.useState(CameraType.back);
    const [permission, requestPermission] = Camera.useCameraPermissions();
  
    const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean>(false);

    const [scanned, setScanned] = React.useState(false);
    const [hasPermission, setHasPermission] = React.useState<boolean>(false);

    React.useEffect(() => {
      const getBarCodeScannerPermissions = async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      };
  
      getBarCodeScannerPermissions();
    }, []);
  
    const handleBarCodeScanned = ({ type, data }) => {
      setScanned(true);
      alert(`Bar code with type ${type} and data ${data} has been scanned!`);
      setTimeout(() => {
        setScanned(false);
      }, 2000);
    };

    React.useEffect(() => {
            (async () => {
            const cameraStatus = await Camera.requestCameraPermissionsAsync();
            setHasCameraPermission(cameraStatus.status === 'granted');
        })();
    }, []);

    // function toggleCameraType() {
    //     setType((current) => (
    //       current === CameraType.back ? CameraType.front : CameraType.back
    //     ));
    //   }

    return (
        <View style={styles.container}>
            <Camera 
                style={styles.camera}
                type={type}
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                barCodeScannerSettings={{
                    barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
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