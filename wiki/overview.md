# Overview

This document provides a high-level overview of the Renaissance mobile application, its purpose, key files, and architecture.

## What This Repo Does

**Renaissance** is a React Native / Expo mobile application that serves as a community platform for event discovery and social engagement. The app aggregates events from multiple external sources (Luma, Resident Advisor, Meetup, Instagram) and internal submissions, providing users with a unified calendar experience.

### Core Capabilities

| Capability | Description |
|------------|-------------|
| **Event Aggregation** | Pulls events from 5+ sources into a unified view |
| **Calendar & Discovery** | Browse events by date, location, category |
| **Social Features** | Connect with users, share events, view shared bookmarks |
| **Rewards System** | Earn points for check-ins, referrals, content creation |
| **Web3 Integration** | Wallet management, USDC transactions, DPoP authentication |
| **Farcaster Support** | Sign in with Farcaster, view profiles, interact with frames |
| **Content Creation** | Submit event flyers with AI-powered data extraction |
| **Multi-Tenant** | Support for multiple cities (Detroit, Denver) |

## Key Files

### Entry Points

| File | Purpose |
|------|---------|
| `App.tsx` | Main entry point; sets up providers, navigation, deep linking, push notifications |
| `src/Navigation/HomeNavigationStack.tsx` | Defines all 40+ screen routes |

### Data Layer

| File | Purpose |
|------|---------|
| `src/dpop.ts` | Primary API client for authentication, events, content, media uploads |
| `src/interfaces.ts` | Core TypeScript interfaces (`DAEvent`, `DAVenue`, `User`, etc.) |
| `src/api/*.ts` | Specialized API modules (connections, bookmarks, Web3, etc.) |

### State Management

| File | Purpose |
|------|---------|
| `src/context/Auth.tsx` | Authentication state and user session |
| `src/context/LocalStorage.tsx` | AsyncStorage wrapper for persistent data |
| `src/context/TenantContext.tsx` | Multi-tenant/location configuration |
| `src/context/Web3.tsx` | Wallet and blockchain state |
| `src/context/FarcasterFrame.tsx` | Farcaster frame/auth integration |

### UI Foundation

| File | Purpose |
|------|---------|
| `src/colors.ts` | Theme system (dark/light themes, semantic color tokens) |
| `src/Components/*.tsx` | 70+ reusable UI components |
| `src/Screens/*.tsx` | 30+ screen components |

### Event Data Hooks

| Hook | Source |
|------|--------|
| `useAllEvents.ts` | Aggregates all event sources |
| `useLumaEvents.ts` | Luma tech/community events |
| `useRAEvents.ts` | Resident Advisor music events |
| `useMeetupEvents.ts` | Meetup group events |
| `useInstagramEvents.ts` | Events from Instagram posts |
| `useRenaissanceEvents.ts` | Native Renaissance events |

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx                               │
│  (Providers → Navigation → Screens)                          │
├─────────────────────────────────────────────────────────────┤
│                    Context Providers                         │
│  LocalStorage │ Tenant │ Auth │ Farcaster │ Audio │ Web3    │
├─────────────────────────────────────────────────────────────┤
│                  HomeNavigationStack                         │
│  (40+ screens: Calendar, Event, Account, Wallet, etc.)      │
├─────────────────────────────────────────────────────────────┤
│                       Components                             │
│  Event Cards │ Modals │ Forms │ Navigation UI                │
├─────────────────────────────────────────────────────────────┤
│                    Hooks & Utilities                         │
│  Event fetching │ Rewards │ Wallet │ Auth │ Formatting      │
├─────────────────────────────────────────────────────────────┤
│                      API Layer                               │
│  dpop.ts (main) │ src/api/* (specialized modules)           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌─────────────────────────────────┐
              │         Backend Services         │
              │  api.detroiter.network          │
              │  events.builddetroit.xyz        │
              │  dpop.nyc3.digitaloceanspaces   │
              └─────────────────────────────────┘
```

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | React Native | 0.81.5 |
| Platform | Expo SDK | 54 |
| Language | TypeScript | 5.9.x |
| Navigation | React Navigation | 6.x |
| State | React Context API | - |
| Web3 | ethers.js | 5.x |
| Cosmos | CosmJS | 0.33.x |

## Related Documentation

- [Project Overview](./project-overview.md) – Detailed goals and target users
- [Architecture](./architecture.md) – Technical architecture deep dive
- [Repository Structure](./repo-structure.md) – Full codebase tour
- [Features](./features.md) – Feature documentation
