# Specification

This document describes what the Renaissance app is intended to do—its functional requirements and design goals.

## Purpose

Renaissance is intended to be a **community-first mobile platform** that helps users discover local events, connect with like-minded people, and engage with their community through Web3-enabled social features.

## Target Users

| User Type | Needs |
|-----------|-------|
| **Event Seekers** | Find local events, concerts, meetups, cultural experiences |
| **Community Members** | Connect with others, share experiences, track engagement |
| **Event Organizers** | Promote events, track RSVPs, gather check-in data |
| **Creators/Artists** | Showcase work, participate in grants, build reputation |
| **Web3 Enthusiasts** | Use decentralized identity, earn rewards, manage wallet |

## Functional Requirements

### 1. Event Discovery

The app shall:
- Aggregate events from multiple external sources (Luma, Resident Advisor, Meetup, Instagram)
- Display events in a unified calendar view with date grouping
- Support filtering by source, category, date range, and location
- Provide detailed event views with venue, time, description, and imagery
- Enable keyword search across all event sources
- Show events on an interactive map

### 2. Event Interaction

The app shall:
- Allow users to RSVP to events
- Enable check-in at events (for reward points)
- Support bookmarking/saving events
- Allow users to share events with connections
- Enable commenting on events

### 3. Social Features

The app shall:
- Support user profiles with name, bio, organization
- Enable connections between users via QR code scanning
- Show shared events between connected users
- Display mutual connections
- Support connection-based event recommendations

### 4. Rewards System

The app shall:
- Award points for specific actions:
  - Event check-in: 50 points
  - Create flyer: 100 points
  - Referral (referrer): 200 points
  - Referral (referee): 50 points
  - Daily login: 10 points
- Display badge achievements for milestones
- Allow conversion of points to USDC (100 points = $1)
- Maintain points history and balance

### 5. Content Creation

The app shall:
- Accept event flyer image uploads
- Use AI to extract event details from flyers (title, date, venue, description)
- Allow manual editing of extracted data
- Submit flyers for review and publication
- Support audio and video content uploads

### 6. Wallet & Web3

The app shall:
- Display wallet address and balances
- Show USDC balance
- Support USDC transfers
- Enable points-to-USDC conversion
- Use DPoP (Decentralized Proof of Participation) for authentication
- Support Web3 wallet connections

### 7. Farcaster Integration

The app shall:
- Support sign-in with Farcaster account
- Display Farcaster profile information
- Render Farcaster frames in-app
- Support frame interactions

### 8. Multi-Tenant Support

The app shall:
- Support multiple location tenants (Detroit, Denver, etc.)
- Provide location-specific event feeds
- Apply tenant-specific branding/configuration
- Allow users to switch between tenants

### 9. Authentication

The app shall support multiple auth methods:
- Email/password registration and login
- Google Sign-In
- Farcaster/Neynar authentication
- DPoP token-based session management

### 10. Push Notifications

The app shall:
- Register for and receive push notifications
- Display notification alerts
- Handle notification responses
- Support event reminders

## Non-Functional Requirements

### Performance
- App should load initial event list within 3 seconds
- Smooth scrolling through event lists (60 FPS)
- Images should be optimized and lazy-loaded

### Offline Support
- Cached events should be viewable offline
- Bookmarks should be accessible offline
- Actions should queue for sync when online

### Updates
- Support over-the-air (OTA) updates via Expo Updates
- Auto-reload on new update detection
- Support forced reload for critical updates

### Platform Support
- iOS 13.4+
- Android API 21+
- React Native 0.81.x compatibility

## Design Goals

### User Experience
- Dark theme by default with light theme option
- Consistent, Material-inspired design language
- Bottom sheet modals for contextual actions
- Gesture-based navigation where appropriate

### Developer Experience
- TypeScript with strict mode for type safety
- React Context for simple, predictable state management
- Custom hooks for encapsulated data fetching
- StyleSheet-based theming with semantic color tokens
