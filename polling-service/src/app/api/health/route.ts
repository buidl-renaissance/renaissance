/**
 * Health Check API Route
 * Returns service status and configuration
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const config = {
    lumaApiUrl: process.env.LUMA_API_URL || 'https://luma-events-inky.vercel.app',
    raApiUrl: process.env.RA_API_URL || 'https://ra-events.vercel.app',
    meetupApiUrl: process.env.MEETUP_API_URL || 'https://meetup.builddetroit.xyz',
    eventsApiUrl: process.env.EVENTS_API_URL || 'https://events.builddetroit.xyz',
    hasApiKey: !!process.env.EVENTS_API_KEY,
    hasCronSecret: !!process.env.CRON_SECRET,
  };

  return NextResponse.json({
    status: 'healthy',
    service: 'renaissance-event-polling',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    config,
    endpoints: {
      'GET /api/poll/all': 'Poll all event sources',
      'GET /api/poll/luma': 'Poll Luma events',
      'GET /api/poll/ra': 'Poll Resident Advisor events',
      'GET /api/poll/meetup': 'Poll Meetup events',
      'GET /api/health': 'Health check',
    },
    cron: {
      '/api/poll/all': 'Every 4 hours (0 */4 * * *)',
      '/api/poll/luma': 'Every 6 hours at :15 (15 */6 * * *)',
      '/api/poll/ra': 'Every 6 hours at :30 (30 */6 * * *)',
      '/api/poll/meetup': 'Every 6 hours at :45 (45 */6 * * *)',
    },
  });
}
