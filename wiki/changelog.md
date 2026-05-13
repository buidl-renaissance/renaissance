# Changelog

This document tracks recent significant changes to the Renaissance codebase.

## Recent Changes

### May 2026

#### Developer Wiki Bootstrap
- Added comprehensive developer documentation under `wiki/`
- Created project overview, architecture, features documentation
- Added local development setup guide
- Created AGENTS.md for AI assistant context
- Added contributing guidelines and code style documentation

#### Denver / ETH Denver Events
- Added multi-tenant support for Denver location
- Implemented `useDenverEvents.ts` hook
- Added `useEthDenverEvents.ts` for ETH Denver conference events
- Tenant selection screen for switching between cities

#### QR Authentication
- Enhanced QR code authentication flow
- Improved deep link handling for `renaissance://authenticate`
- Better callback URL and app name parameter support

### Recent Feature Work

#### App Blocks
- Multiple commits implementing "app blocks" functionality
- New component architecture for modular app sections

#### Mobile App Updates
- General mobile app improvements and refinements
- UI/UX enhancements

## Version History

### Current Version: 1.0.0

**Core Stack:**
- React Native 0.81.5
- Expo SDK 54
- TypeScript 5.9.x
- React 19.1.0

**Key Dependencies Updated:**
- `react-native-vision-camera` 4.7.3
- `@gorhom/bottom-sheet` 4.4.7
- `@react-navigation/*` 6.x

## Migration Notes

### Camera Migration
The app has migrated from `expo-camera` to `react-native-vision-camera` for improved camera functionality. See `MIGRATION_NOTES.md` in the repo root for details.

### React 19 Upgrade
The app uses React 19.1.0. Some third-party libraries (e.g., `react-native-render-html`) emit `defaultProps` deprecation warnings which are suppressed in `App.tsx`.

## Upcoming Changes

Based on active branches:

| Branch | Description |
|--------|-------------|
| `feature/prd-github-actions-eas-preview-ota-for-renaissance` | CI/CD for EAS preview builds |
| `feature/prd-renaissance-event-polling-background-ingestion` | Background event polling |
| `grant-contracts-web3-calls` | Grant governance Web3 integration |
| `web3-api-calls` | Additional Web3 API functionality |

## How to Update This Document

When making significant changes:

1. Add an entry under the current month/year section
2. Include a brief description of what changed
3. Reference relevant files or PRs if applicable
4. For breaking changes, add migration notes

**Significant changes include:**
- New features or screens
- Architecture changes
- Dependency version updates
- API contract changes
- Build/deployment configuration changes
