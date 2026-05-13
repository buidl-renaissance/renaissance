/**
 * Resident Advisor Events Polling API Route
 * Triggered by Vercel cron or manual invocation
 */

import { NextResponse } from 'next/server';
import { pollRAEvents } from '@/lib/pollers/ra';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    const isVercelCron = request.headers.get('x-vercel-cron') === 'true';
    if (!isVercelCron) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    logger.info('RA poll triggered via API', 'ra');
    
    const result = await pollRAEvents();

    return NextResponse.json({
      success: result.success,
      data: result,
    });
  } catch (error) {
    logger.pollError('ra', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
