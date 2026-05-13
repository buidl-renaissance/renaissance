/**
 * Poll All Sources API Route
 * Orchestrator that polls all event sources in sequence
 * Triggered by Vercel cron or manual invocation
 */

import { NextResponse } from 'next/server';
import { pollLumaEvents, pollRAEvents, pollMeetupEvents } from '@/lib/pollers';
import { PollResult } from '@/lib/types';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const maxDuration = 120;

interface OrchestratorResult {
  success: boolean;
  totalEventsProcessed: number;
  totalEventsUpserted: number;
  totalErrors: number;
  results: PollResult[];
  duration: number;
  timestamp: string;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    const isVercelCron = request.headers.get('x-vercel-cron') === 'true';
    if (!isVercelCron) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const startTime = Date.now();
  logger.info('Starting orchestrated poll of all sources', 'orchestrator');

  const results: PollResult[] = [];
  let totalEventsProcessed = 0;
  let totalEventsUpserted = 0;
  let totalErrors = 0;

  const url = new URL(request.url);
  const sourcesParam = url.searchParams.get('sources');
  const enabledSources = sourcesParam 
    ? sourcesParam.split(',') 
    : ['luma', 'ra', 'meetup'];

  if (enabledSources.includes('luma')) {
    try {
      logger.info('Polling Luma...', 'orchestrator');
      const lumaResult = await pollLumaEvents();
      results.push(lumaResult);
      totalEventsProcessed += lumaResult.eventsProcessed;
      totalEventsUpserted += lumaResult.eventsUpserted;
      totalErrors += lumaResult.errors.length;
    } catch (error) {
      logger.error(`Luma poll failed: ${error}`, 'orchestrator');
      results.push({
        source: 'luma',
        success: false,
        eventsProcessed: 0,
        eventsUpserted: 0,
        errors: [String(error)],
        duration: 0,
        timestamp: new Date().toISOString(),
      });
      totalErrors++;
    }
  }

  if (enabledSources.includes('ra')) {
    try {
      logger.info('Polling RA...', 'orchestrator');
      const raResult = await pollRAEvents();
      results.push(raResult);
      totalEventsProcessed += raResult.eventsProcessed;
      totalEventsUpserted += raResult.eventsUpserted;
      totalErrors += raResult.errors.length;
    } catch (error) {
      logger.error(`RA poll failed: ${error}`, 'orchestrator');
      results.push({
        source: 'ra',
        success: false,
        eventsProcessed: 0,
        eventsUpserted: 0,
        errors: [String(error)],
        duration: 0,
        timestamp: new Date().toISOString(),
      });
      totalErrors++;
    }
  }

  if (enabledSources.includes('meetup')) {
    try {
      logger.info('Polling Meetup...', 'orchestrator');
      const meetupResult = await pollMeetupEvents();
      results.push(meetupResult);
      totalEventsProcessed += meetupResult.eventsProcessed;
      totalEventsUpserted += meetupResult.eventsUpserted;
      totalErrors += meetupResult.errors.length;
    } catch (error) {
      logger.error(`Meetup poll failed: ${error}`, 'orchestrator');
      results.push({
        source: 'meetup',
        success: false,
        eventsProcessed: 0,
        eventsUpserted: 0,
        errors: [String(error)],
        duration: 0,
        timestamp: new Date().toISOString(),
      });
      totalErrors++;
    }
  }

  const duration = Date.now() - startTime;
  const overallSuccess = results.every(r => r.success) && totalErrors === 0;

  const orchestratorResult: OrchestratorResult = {
    success: overallSuccess,
    totalEventsProcessed,
    totalEventsUpserted,
    totalErrors,
    results,
    duration,
    timestamp: new Date().toISOString(),
  };

  logger.info(
    `Orchestrated poll complete: ${totalEventsProcessed} processed, ${totalEventsUpserted} upserted, ${totalErrors} errors`,
    'orchestrator',
    { duration }
  );

  return NextResponse.json(orchestratorResult);
}

export async function POST(request: Request) {
  return GET(request);
}
