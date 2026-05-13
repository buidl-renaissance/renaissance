# Renaissance Event Polling Service

A Next.js service that polls multiple event sources (Luma, Resident Advisor, Meetup) and ingests normalized events into the Renaissance app database.

## Overview

This service runs as a standalone Vercel deployment with cron-triggered polling. Events are:
1. Fetched from source APIs
2. Normalized to a common schema
3. Deduplicated
4. Upserted to the Renaissance events database

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Polling Service (Vercel)                   │
├──────────────────┬──────────────────┬──────────────────────┤
│  /api/poll/luma  │  /api/poll/ra    │  /api/poll/meetup    │
│  (cron: */6h)    │  (cron: */6h)    │  (cron: */6h)        │
├──────────────────┴──────────────────┴──────────────────────┤
│                    /api/poll/all                            │
│                    (cron: */4h)                             │
├─────────────────────────────────────────────────────────────┤
│  Normalize → Deduplicate → Upsert                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                ┌─────────────────────────────┐
                │ Renaissance Events API       │
                │ events.builddetroit.xyz      │
                └─────────────────────────────┘
```

## API Endpoints

| Endpoint | Description | Cron Schedule |
|----------|-------------|---------------|
| `GET /api/poll/all` | Poll all sources | Every 4 hours |
| `GET /api/poll/luma` | Poll Luma events | Every 6 hours at :15 |
| `GET /api/poll/ra` | Poll RA events | Every 6 hours at :30 |
| `GET /api/poll/meetup` | Poll Meetup events | Every 6 hours at :45 |
| `GET /api/health` | Health check | - |

## Event Sources

### Luma Events
- **API**: `https://luma-events-inky.vercel.app/api/events/{city}`
- **Default Cities**: detroit, ann-arbor, chicago
- **Event Type**: Tech, community, social events

### Resident Advisor (RA)
- **API**: `https://ra-events.vercel.app/api/events/upcoming`
- **Event Type**: Music, nightlife, club events

### Meetup
- **API**: `https://meetup.builddetroit.xyz/api/meetup/events`
- **Event Type**: Community meetups, tech groups

## Environment Variables

```bash
# External Event Source APIs
LUMA_API_URL=https://luma-events-inky.vercel.app
RA_API_URL=https://ra-events.vercel.app
MEETUP_API_URL=https://meetup.builddetroit.xyz

# Renaissance Events API
EVENTS_API_URL=https://events.builddetroit.xyz
EVENTS_API_KEY=your-api-key

# Cron authentication (optional)
CRON_SECRET=your-cron-secret
```

## Development

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Type check
yarn typecheck

# Build for production
yarn build
```

## Deployment

This service is designed to be deployed on Vercel:

1. Deploy the `/polling-service` directory as a separate Vercel project
2. Configure environment variables in Vercel dashboard
3. Cron jobs are automatically configured via `vercel.json`

## Normalized Event Schema

All events are normalized to this schema before upserting:

```typescript
interface RenaissanceEvent {
  name: string;
  location: string;
  startTime: string;      // ISO 8601
  endTime: string;        // ISO 8601
  flyerImage?: string;    // URL
  metadata?: {
    description?: string;
    host?: { name: string; username?: string };
    venue?: { name: string; address?: string; city?: string };
    artists?: string[];
    ticketPrice?: string;
    rsvpCount?: number;
  };
  tags?: string[];
  eventType: 'in-person' | 'online';
  source: 'luma' | 'ra' | 'meetup';
  sourceId: string;       // Original event ID
  sourceUrl?: string;     // Link to original event
}
```

## Adding a New Event Source

1. Create a new poller in `src/lib/pollers/`
2. Add normalization logic in `src/lib/normalize.ts`
3. Create API route in `src/app/api/poll/{source}/`
4. Add cron schedule in `vercel.json`
5. Update the orchestrator in `src/app/api/poll/all/route.ts`

## Monitoring

- Poll results are logged with structured logging
- Each poll returns a `PollResult` with:
  - `eventsProcessed`: Number of events fetched
  - `eventsUpserted`: Number successfully saved
  - `errors`: Array of error messages
  - `duration`: Time taken in milliseconds
