# Tools & Dependencies

This document covers the key libraries, tools, and dependencies used in the Renaissance app.

## Core Framework

### React Native & Expo

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | 19.1.0 | UI library |
| `react-native` | 0.81.5 | Mobile framework |
| `expo` | ^54.0.0 | Development platform |
| `typescript` | ~5.9.2 | Type system |

### Build Tools

| Package | Purpose |
|---------|---------|
| `@babel/core` | JavaScript transpilation |
| `metro` | React Native bundler |
| `patch-package` | Apply patches to node_modules |

## Navigation

| Package | Version | Purpose |
|---------|---------|---------|
| `@react-navigation/native` | ^6.0.10 | Navigation foundation |
| `@react-navigation/stack` | ^6.2.1 | Stack navigator |
| `@react-navigation/bottom-tabs` | ^6.3.1 | Tab navigator |
| `@react-navigation/material-top-tabs` | ^6.2.1 | Top tab navigator |
| `react-native-screens` | ~4.16.0 | Native navigation screens |

## UI Components

### Core UI

| Package | Purpose |
|---------|---------|
| `react-native-paper` | Material Design components |
| `@gorhom/bottom-sheet` | Bottom sheet modals |
| `react-native-modal` | Modal dialogs |
| `react-native-super-grid` | Grid layouts |
| `react-native-tab-view` | Tab view component |
| `react-native-pager-view` | Swipeable pages |

### Gestures & Animation

| Package | Purpose |
|---------|---------|
| `react-native-gesture-handler` | Touch gestures |
| `react-native-reanimated` | Smooth animations |
| `react-native-safe-area-context` | Safe area handling |

### Input & Forms

| Package | Purpose |
|---------|---------|
| `@react-native-community/datetimepicker` | Date/time picker |
| `@react-native-picker/picker` | Dropdown picker |
| `react-native-modal-datetime-picker` | Modal date picker |
| `react-native-modal-selector` | Modal selector |
| `react-native-searchable-dropdown` | Searchable dropdown |
| `react-native-autocomplete-dropdown` | Autocomplete input |
| `react-native-keyboard-controller` | Keyboard handling |

### Icons & Graphics

| Package | Purpose |
|---------|---------|
| `@expo/vector-icons` | Icon library |
| `react-native-svg` | SVG support |
| `react-native-qrcode-svg` | QR code generation |
| `react-qr-code` | QR code (web) |

### Content Display

| Package | Purpose |
|---------|---------|
| `react-native-render-html` | HTML rendering |
| `react-native-webview` | Web content |
| `react-native-youtube-iframe` | YouTube videos |
| `react-native-gifted-chat` | Chat UI |

## Expo Modules

| Module | Purpose |
|--------|---------|
| `expo-av` | Audio/video playback |
| `expo-camera` | Camera access (legacy) |
| `expo-crypto` | Cryptographic operations |
| `expo-dev-client` | Development client |
| `expo-device` | Device information |
| `expo-file-system` | File operations |
| `expo-font` | Custom fonts |
| `expo-image-manipulator` | Image editing |
| `expo-image-picker` | Image selection |
| `expo-linking` | Deep linking |
| `expo-media-library` | Media access |
| `expo-notifications` | Push notifications |
| `expo-random` | Random number generation |
| `expo-secure-store` | Secure storage |
| `expo-share-intent` | Share sheet handling |
| `expo-splash-screen` | Splash screen |
| `expo-status-bar` | Status bar control |
| `expo-updates` | OTA updates |

## Camera & Vision

| Package | Purpose |
|---------|---------|
| `react-native-vision-camera` | Modern camera API |
| `react-native-worklets` | Camera frame processing |

See [MIGRATION_NOTES.md](../MIGRATION_NOTES.md) for camera migration details.

## Web3 & Blockchain

### Ethereum

| Package | Purpose |
|---------|---------|
| `ethers` | Ethereum library |
| `@ethersproject/shims` | React Native shims |
| `react-native-get-random-values` | Crypto polyfill |

### Cosmos

| Package | Purpose |
|---------|---------|
| `@cosmjs/amino` | Amino signing |
| `@cosmjs/proto-signing` | Protobuf signing |
| `@cosmjs/stargate` | Stargate client |

### Cryptography

| Package | Purpose |
|---------|---------|
| `@noble/ed25519` | Ed25519 signatures |
| `@noble/hashes` | Hash functions |
| `buffer` | Buffer polyfill |
| `text-encoding-polyfill` | TextEncoder polyfill |

## Authentication

| Package | Purpose |
|---------|---------|
| `@react-native-google-signin/google-signin` | Google Sign-In |
| `@farcaster/frame-host-react-native` | Farcaster frames |

## Data & Storage

| Package | Purpose |
|---------|---------|
| `@react-native-async-storage/async-storage` | Persistent storage |
| `@react-native-community/netinfo` | Network status |
| `react-native-event-listeners` | Event bus |

## Date & Time

| Package | Purpose |
|---------|---------|
| `date-fns` | Date manipulation |
| `moment` | Date parsing |
| `moment-timezone` | Timezone support |

## Utilities

| Package | Purpose |
|---------|---------|
| `html-entities` | HTML entity decoding |
| `react-native-dotenv` | Environment variables |
| `@react-native-anywhere/polyfill-base64` | Base64 polyfill |

## Maps

| Package | Purpose |
|---------|---------|
| `react-native-maps` | Native maps |

## Development Dependencies

| Package | Purpose |
|---------|---------|
| `@babel/core` | Babel compiler |
| `@types/react` | React type definitions |
| `patch-package` | Dependency patching |
| `postinstall-postinstall` | Post-install hooks |

## CLI Tools (Global)

These tools should be installed globally or accessed via npx:

| Tool | Purpose |
|------|---------|
| `expo-cli` | Expo development |
| `eas-cli` | EAS Build/Update |
| `react-native` | RN commands |

## Recommended VS Code Extensions

| Extension | Purpose |
|-----------|---------|
| ES7+ React/Redux/React-Native snippets | Code snippets |
| ESLint | Code linting |
| Prettier | Code formatting |
| TypeScript Hero | TS organization |
| React Native Tools | Debugging |
| Expo Tools | Expo integration |

## Version Compatibility

The app targets:
- **Node.js**: >= 20.19.0
- **React Native**: 0.81.x
- **Expo SDK**: 54
- **TypeScript**: 5.9.x
- **iOS**: 13.4+
- **Android**: API 21+

## Dependency Updates

When updating dependencies:

1. Check Expo SDK compatibility first
2. Review React Native upgrade guides
3. Test on both iOS and Android
4. Update patch files if needed (`patches/` directory)
5. Run `yarn postinstall` to apply patches
