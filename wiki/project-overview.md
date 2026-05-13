# Project Overview

## What is Renaissance?

**Renaissance** is a React Native / Expo mobile application for the Renaissance community platform. It serves as a comprehensive event discovery, social networking, and community engagement app focused on connecting users with local events, art, music, and cultural experiences.

The app is part of the broader `buidl-renaissance` ecosystem, which includes smart contracts, authentication protocols, and generative art components.

## Who is Renaissance For?

- **Event Enthusiasts** – People looking to discover local events, concerts, meetups, and cultural experiences
- **Community Members** – Users who want to connect with like-minded individuals and share experiences
- **Event Organizers** – People creating and promoting events, submitting flyers, and managing RSVPs
- **Artists & Creators** – Individuals showcasing artwork and participating in the creative community
- **Tech Enthusiasts** – Users interested in Web3 features, Farcaster integration, and blockchain-based rewards

## High-Level Goals

### Core User Value
- Aggregate events from multiple sources (Luma, Resident Advisor, Meetup, Instagram, local submissions)
- Provide a unified calendar and discovery experience for local events
- Enable social features like bookmarking, sharing, and connecting with other users
- Reward community participation through a points/rewards system

### Technical Goals
- Build a performant, cross-platform mobile app with React Native and Expo
- Integrate with Web3 protocols (DPoP authentication, wallet support, USDC transactions)
- Support Farcaster frames and social authentication
- Maintain a clean, themeable UI with dark mode support

### Community Goals
- Foster local community engagement through shared events
- Enable decentralized identity and authentication
- Support content creation and curation by community members

## Key Features

- **Event Discovery** – Browse events from multiple aggregated sources
- **Calendar View** – Visual calendar with event grouping and filtering
- **Social Connections** – Connect with other users, share events, view shared bookmarks
- **Bookmarks** – Save events and share bookmark lists with connections
- **Rewards System** – Earn points for check-ins, referrals, and engagement
- **Mini Apps** – In-app webview for partner applications and services
- **Wallet Integration** – View balances, convert points to USDC, manage Web3 identity
- **Farcaster Integration** – Authenticate with Farcaster, view profiles, support frames
- **Flyer Submission** – Upload event flyers with AI-powered data extraction
- **QR Code Sharing** – Share profiles and connect via QR codes
- **Multi-tenant Support** – Location-based experiences (Detroit, Denver, etc.)

## Related Repositories

| Repository | Description |
|------------|-------------|
| [renaissance-contracts](https://github.com/buidl-renaissance/renaissance-contracts) | Smart contracts for Renaissance ecosystem |
| [dpop](https://github.com/buidl-renaissance/dpop) | DPoP (Decentralized Proof of Participation) authentication |
| [regen-art](https://github.com/buidl-renaissance/regen-art) | Generative art components and tools |

## Backend Services

The app communicates with several backend services:

- **Detroiter Network API** (`api.detroiter.network`) – Primary backend for events, users, content
- **Events Build Detroit** (`events.builddetroit.xyz`) – Event extraction and flyer processing
- **DPoP Spaces** (`dpop.nyc3.digitaloceanspaces.com`) – Content storage

## Tech Stack Summary

- **Framework**: React Native 0.81.x with Expo SDK 54
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State Management**: React Context API
- **Styling**: StyleSheet (inline), with theme support
- **Web3**: ethers.js, CosmJS
- **Authentication**: DPoP, Farcaster/Neynar, Google Sign-In

For detailed technical architecture, see [Architecture](./architecture.md).
