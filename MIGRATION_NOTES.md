# Migration from expo-camera to react-native-vision-camera

## Overview
This migration moves from `expo-camera` to `react-native-vision-camera` for improved performance and features.

## Important Notes

### Barcode Scanning Complexity
⚠️ **Barcode/QR code scanning requires frame processors**, which need additional setup:

1. **Option 1 (Recommended for Expo)**: Use `vision-camera-code-scanner` plugin
   ```bash
   npm install vision-camera-code-scanner
   ```
   Then configure frame processors in your components.

2. **Option 2**: Implement custom frame processor with MLKit/ZXing
   - More complex, requires native code
   - See: https://react-native-vision-camera.com/docs/guides/frame-processors

3. **Option 3 (Temporary)**: Keep expo-camera for barcode scanning only
   - Use react-native-vision-camera for camera preview/photos
   - Use expo-camera for QR code scanning (hybrid approach)

### Installation Steps

1. Install react-native-vision-camera:
   ```bash
   npm install react-native-vision-camera
   cd ios && pod install  # iOS only
   ```

2. For barcode scanning, install plugin:
   ```bash
   npm install vision-camera-code-scanner
   ```

3. Rebuild the app (native module):
   ```bash
   npx expo prebuild --clean
   npx expo run:android  # or run:ios
   ```

### Files Updated

- ✅ `app.json` - Added react-native-vision-camera plugin configuration
- ✅ `src/hooks/useVisionCamera.ts` - Created camera utility hook
- ✅ `src/hooks/useBarcodeScanner.ts` - Created barcode scanner hook (placeholder)
- ✅ `src/Screens/CameraScreen.tsx` - Updated to use react-native-vision-camera

### Files Still Need Update

- ⚠️ `src/Screens/DPoPAuthScreen.tsx` - Needs barcode scanner integration
- ⚠️ `src/Components/QRCodeModal.tsx` - Needs barcode scanner integration
- ⚠️ `src/Components/WalletModal.tsx` - Needs barcode scanner integration
- ⚠️ `src/Components/EventCheckInButton.tsx` - Needs barcode scanner integration
- ⚠️ `src/Components/AudioRecorder.tsx` - Camera for photos (simpler, no barcode)
- ⚠️ `src/context/FarcasterFrame.tsx` - Permission handling only

### Key API Changes

**Permissions:**
- Old: `useCameraPermissions()` from expo-camera
- New: `useCameraPermission()` from react-native-vision-camera

**Camera Component:**
- Old: `<CameraView facing="back" onBarcodeScanned={...} />`
- New: `<Camera device={device} isActive={true} frameProcessor={...} />`

**Device Selection:**
- Old: `facing="back"` prop
- New: `useCameraDevice('back')` hook

**Photo Capture:**
- Old: `camera.takePictureAsync({ onPictureSaved })`
- New: `camera.takePhoto()` returns promise with file path

### Next Steps

1. Install packages (see Installation Steps above)
2. Implement barcode scanner frame processor (or use plugin)
3. Update remaining components
4. Test on physical devices (not Expo Go)
5. Remove expo-camera from package.json



