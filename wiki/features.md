# Features

This document provides an overview of the key features in the Renaissance app.

## Event Discovery

### Calendar View
The primary screen (`CalendarScreen`) displays events in a comprehensive calendar format:
- Date-based grouping with visual date headers
- Multiple view modes (list, calendar grid)
- Pull-to-refresh for latest events
- Infinite scroll for loading more events

### Event Sources
Events are aggregated from multiple platforms:

| Source | Description | Card Component |
|--------|-------------|----------------|
| **Luma** | Tech and community events | `LumaEventCard.tsx` |
| **Resident Advisor** | Music and nightlife events | `RAEventCard.tsx` |
| **Meetup** | Group meetups and activities | `MeetupEventCard.tsx` |
| **Instagram** | Events extracted from Instagram posts | `InstagramEventCard.tsx` |
| **Renaissance** | Native Renaissance events | `RenaissanceEventCard.tsx` |
| **Sports** | Local sports games | `SportsGameCard.tsx` |

### Event Details
Each event type has a dedicated detail view showing:
- Event title, description, and image
- Date, time, and venue information
- RSVP and booking options
- Share and bookmark actions
- Check-in functionality

### Filtering & Search
- Filter by event type/source
- Search by keyword
- Location-based filtering (via Tenant context)
- Date range selection

## Social Features

### Connections
Connect with other Renaissance users:
- QR code sharing for easy connection
- Connection list management
- View mutual connections
- Share events with connections

### Shared Events
When connected with other users:
- View events both users have bookmarked
- See shared interests and overlap
- Send event recommendations

### QR Code System
- Generate personal QR code for profile sharing
- Scan QR codes to connect with others
- Event check-in via QR code

## Bookmarks

### Save Events
- Bookmark any event from any source
- Organize saved events chronologically
- Access bookmarks from dedicated screen
- Sync bookmarks across sessions

### Bookmark Lists
- Create and manage bookmark collections
- Share bookmark lists with connections
- Export bookmark data

## Rewards System

### Points
Earn points through engagement:

| Action | Points |
|--------|--------|
| Event check-in | 50 |
| Create flyer | 100 |
| Referral (referrer) | 200 |
| Referral (referee) | 50 |
| Daily login | 10 |

### Badges
Earn badges for achievements:
- Check-in milestones
- Referral counts
- Content creation
- Community participation

### Points Conversion
- Convert points to USDC at 100 points = $1
- Minimum conversion: 100 points
- Direct transfer to connected wallet

## Wallet & Web3

### Wallet Management
- View wallet address and balances
- USDC balance display
- Transaction history
- Points balance and conversion

### Web3 Integration
- ethers.js for Ethereum interactions
- CosmJS for Cosmos chain support
- DPoP authentication protocol
- Secure key storage via Expo SecureStore

### USDC Transactions
- Send USDC to other addresses
- Receive USDC from points conversion
- View transaction status

## Farcaster Integration

### Authentication
- Sign in with Farcaster account
- Neynar API integration
- Frame support for Farcaster actions

### Profile
- View Farcaster profile information
- Display Farcaster username and avatar
- Link Farcaster identity to Renaissance account

### Frames
- Render Farcaster frames in-app
- Interact with frame actions
- Share frames with connections

## Mini Apps

### In-App Browser
Load partner applications and services within the app:
- Secure webview container
- Message passing between app and webview
- Deep link handling
- Custom header with navigation controls

### Available Mini Apps
Mini apps are configured and displayed via:
- Grid view in MiniAppsModal
- Quick access buttons
- URL-based launching

## Content Creation

### Flyer Submission
Upload event flyers with AI-powered extraction:
1. Select or capture flyer image
2. AI extracts event details (title, date, venue, description)
3. Review and edit extracted data
4. Submit for publication

### Audio Content
- Record audio content
- Upload audio recordings
- Associate audio with events/artwork

### Media Upload
- Image upload with EXIF data preservation
- Video upload support
- Automatic resizing and optimization

## Location Features

### Multi-Tenant Support
The app supports multiple locations/tenants:
- Detroit (default)
- Denver
- Other cities as added

Each tenant provides:
- Location-specific events
- Custom branding/theming
- Regional API endpoints

### Map Views
- Browse events on map
- Venue locations with markers
- Direction links to mapping apps

## Account Management

### Profile
- Display name and avatar
- Bio and organization
- Contact information
- Attribution links

### Settings
- Notification preferences
- Theme settings (dark/light)
- Privacy controls
- Data export

### Authentication
Multiple auth methods:
- Email/password
- Google Sign-In
- Farcaster/Neynar
- DPoP authentication

## Restaurants & Local Discovery

### Restaurant Listings
- Browse local restaurants
- Category filtering (pizza, tacos, etc.)
- Rating and points system

### Bucket Lists
- Create restaurant bucket lists
- Share with friends
- Track visited locations

### Best Of Rankings
- Category-based rankings
- Community voting
- Leaderboards

## Admin Features

### Event Review
Admin users can:
- Review submitted events
- Edit event details
- Approve/reject submissions
- Manage featured events

### Block Submissions
- Review community block submissions
- Moderation tools
- Content flagging

### Grant Governance
- Create grant proposals
- Vote on proposals
- Track grant disbursement

## Technical Features

### OTA Updates
- Automatic updates via Expo Updates
- Background update checking
- Forced reload on critical updates

### Deep Linking
- Handle `renaissance://` scheme
- Process shared URLs
- Authentication callbacks

### Push Notifications
- Event reminders
- Connection requests
- System announcements

### Offline Support
- Cached event data
- Offline bookmark access
- Queue actions for sync
