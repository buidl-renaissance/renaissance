/**
 * Structured logging utility for the polling service
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  source?: string;
  message: string;
  data?: Record<string, unknown>;
}

function formatLog(entry: LogEntry): string {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
  const sourcePrefix = entry.source ? ` [${entry.source}]` : '';
  const dataStr = entry.data ? ` ${JSON.stringify(entry.data)}` : '';
  return `${prefix}${sourcePrefix} ${entry.message}${dataStr}`;
}

function log(level: LogLevel, message: string, source?: string, data?: Record<string, unknown>) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    source,
    message,
    data,
  };

  const formatted = formatLog(entry);
  
  switch (level) {
    case 'debug':
      console.debug(formatted);
      break;
    case 'info':
      console.log(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'error':
      console.error(formatted);
      break;
  }

  return entry;
}

export const logger = {
  debug: (message: string, source?: string, data?: Record<string, unknown>) => 
    log('debug', message, source, data),
  
  info: (message: string, source?: string, data?: Record<string, unknown>) => 
    log('info', message, source, data),
  
  warn: (message: string, source?: string, data?: Record<string, unknown>) => 
    log('warn', message, source, data),
  
  error: (message: string, source?: string, data?: Record<string, unknown>) => 
    log('error', message, source, data),

  pollStart: (source: string) => 
    log('info', `Starting poll`, source),

  pollComplete: (source: string, count: number, duration: number) => 
    log('info', `Poll complete`, source, { eventsProcessed: count, durationMs: duration }),

  pollError: (source: string, error: unknown) => 
    log('error', `Poll failed: ${error instanceof Error ? error.message : String(error)}`, source),

  upsertSuccess: (source: string, eventId: string) =>
    log('debug', `Upserted event ${eventId}`, source),

  upsertError: (source: string, eventId: string, error: unknown) =>
    log('error', `Failed to upsert event ${eventId}: ${error instanceof Error ? error.message : String(error)}`, source),
};
