/**
 * Shared URLs Storage and Processing
 * 
 * Stores URLs shared to the app with their processing status
 * and auto-triggers scraping for supported platforms.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  detectURLType, 
  checkInstagramCache,
  scrapeInstagramUrl,
  extractEventFromInstagram,
  cacheMeetupEvent,
  resolveShortUrl,
  URLInfo, 
  InstagramScrapeResult,
  ExtractedEventInfo,
  MeetupCacheResult,
} from './urlDetection';

const STORAGE_KEY = 'shared_urls';

export type ProcessingStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export interface SharedURLRecord {
  id: string;
  originalUrl: string;
  resolvedUrl?: string; // Final URL after following redirects
  cleanedUrl: string;
  urlType: string;
  platformName: string;
  status: ProcessingStatus;
  createdAt: string;
  processedAt?: string;
  error?: string;
  // Scraped data
  scrapeResult?: InstagramScrapeResult;
  // Meetup cached data
  meetupEvent?: MeetupCacheResult['event'];
  metadata?: {
    title?: string;
    description?: string;
    image?: string;
  };
  // Extracted event data (from AI vision)
  extractedEvent?: ExtractedEventInfo;
}

/**
 * Generate a unique ID for a URL record
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get all stored shared URLs
 */
export async function getSharedUrls(): Promise<SharedURLRecord[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('[sharedUrls] Error loading shared URLs:', error);
    return [];
  }
}

/**
 * Save shared URLs to storage
 */
async function saveSharedUrls(urls: SharedURLRecord[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
  } catch (error) {
    console.error('[sharedUrls] Error saving shared URLs:', error);
  }
}

/**
 * Check if URL is a short URL that needs resolution
 */
function isShortUrl(url: string): boolean {
  const shortUrlPatterns = [
    /^https?:\/\/(www\.)?meetu\.ps\//i,
    /^https?:\/\/(www\.)?bit\.ly\//i,
    /^https?:\/\/(www\.)?t\.co\//i,
    /^https?:\/\/(www\.)?tinyurl\.com\//i,
  ];
  return shortUrlPatterns.some(pattern => pattern.test(url));
}

/**
 * Add a new shared URL and auto-trigger processing
 */
export async function addSharedUrl(url: string): Promise<SharedURLRecord> {
  let processedUrl = url;
  let resolvedUrl: string | undefined;
  
  // Check if this is a short URL that needs resolution
  if (isShortUrl(url)) {
    console.log('[sharedUrls] Detected short URL, resolving:', url);
    resolvedUrl = await resolveShortUrl(url);
    processedUrl = resolvedUrl;
    console.log('[sharedUrls] Resolved to:', resolvedUrl);
  }
  
  // Detect URL type (this also cleans the URL)
  const urlInfo = detectURLType(processedUrl);
  
  // Create the record
  const record: SharedURLRecord = {
    id: generateId(),
    originalUrl: url,
    resolvedUrl: resolvedUrl,
    cleanedUrl: urlInfo.url,
    urlType: urlInfo.type,
    platformName: urlInfo.platformName,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  // Save to storage
  const existingUrls = await getSharedUrls();
  
  // Check if URL already exists (by cleaned URL)
  const existingIndex = existingUrls.findIndex(u => u.cleanedUrl === record.cleanedUrl);
  if (existingIndex >= 0) {
    // Update existing record timestamp but keep existing data
    const existing = existingUrls[existingIndex];
    console.log('[sharedUrls] URL already exists, updating timestamp:', record.cleanedUrl);
    existing.createdAt = record.createdAt;
    // If it failed before, reset to pending
    if (existing.status === 'failed') {
      existing.status = 'pending';
      existing.error = undefined;
    }
    
    // Force reprocess Meetup URLs that don't have cached event data or had an error
    if (existing.urlType === 'meetup' && (!existing.meetupEvent || existing.error)) {
      console.log('[sharedUrls] Meetup URL missing cached event data or had error, reprocessing...');
      existing.status = 'pending';
      existing.error = undefined;
    }
    
    await saveSharedUrls(existingUrls);
    
    // If not yet processed, trigger processing
    if (existing.status === 'pending') {
      return processSharedUrl(existing.id);
    }
    return existing;
  }

  // Add new record
  existingUrls.unshift(record); // Add to beginning
  await saveSharedUrls(existingUrls);
  
  console.log('[sharedUrls] Added new shared URL:', record);

  // Auto-trigger processing
  return processSharedUrl(record.id);
}

/**
 * Process a shared URL (scrape/fetch metadata)
 */
export async function processSharedUrl(id: string): Promise<SharedURLRecord> {
  const urls = await getSharedUrls();
  const recordIndex = urls.findIndex(u => u.id === id);
  
  if (recordIndex < 0) {
    throw new Error(`URL record not found: ${id}`);
  }

  const record = urls[recordIndex];
  
  // Update status to processing
  record.status = 'processing';
  await saveSharedUrls(urls);
  console.log('[sharedUrls] Processing URL:', record.cleanedUrl);

  try {
    // Process based on URL type
    if (record.urlType === 'instagram') {
      // First, check if the URL is already cached
      console.log('[sharedUrls] Checking Instagram cache...');
      const cacheResult = await checkInstagramCache(record.cleanedUrl);
      console.log('[sharedUrls] Instagram cache result:', JSON.stringify(cacheResult, null, 2));
      
      if (cacheResult.success && cacheResult.cached && cacheResult.data?.featuredPost) {
        // Use cached data
        console.log('[sharedUrls] Using cached Instagram data');
        const post = cacheResult.data.featuredPost;
        
        record.scrapeResult = {
          success: true,
          featuredPost: post,
          relatedPosts: cacheResult.data.relatedPosts,
        };
        
        const captionLines = post.caption?.split('\n') || [];
        record.metadata = {
          title: captionLines[0]?.substring(0, 100) || 'Instagram Post',
          description: post.caption || undefined,
          image: post.images?.[0] || undefined,
        };
        
        // If event data is already cached, use it
        if (cacheResult.data.event) {
          console.log('[sharedUrls] Using cached event data');
          record.extractedEvent = {
            success: true,
            event: cacheResult.data.event,
          };
          
          // Update metadata with cached event info
          record.metadata.title = cacheResult.data.event.name || record.metadata.title;
          record.metadata.description = cacheResult.data.event.description || record.metadata.description;
        }
        
        record.status = 'completed';
      } else {
        // Not cached, need to scrape
        console.log('[sharedUrls] Scraping Instagram URL...');
        const scrapeResult = await scrapeInstagramUrl(record.cleanedUrl);
        console.log('[sharedUrls] Instagram scrape result:', JSON.stringify(scrapeResult, null, 2));
        
        record.scrapeResult = scrapeResult;
        
        if (scrapeResult.success && scrapeResult.featuredPost) {
          const post = scrapeResult.featuredPost;
          const captionLines = post.caption?.split('\n') || [];
          record.metadata = {
            title: captionLines[0]?.substring(0, 100) || 'Instagram Post',
            description: post.caption || undefined,
            image: post.images?.[0] || undefined,
          };
          
          // Auto-trigger event extraction if we have an image
          if (post.images?.[0]) {
            console.log('[sharedUrls] Extracting event info from Instagram post...');
            const eventResult = await extractEventFromInstagram(
              post.postCode,
              post.images[0],
              post.caption
            );
            console.log('[sharedUrls] Event extraction result:', JSON.stringify(eventResult, null, 2));
            record.extractedEvent = eventResult;
            
            // Update metadata with extracted event info if available
            if (eventResult.success && eventResult.event) {
              record.metadata.title = eventResult.event.name || record.metadata.title;
              record.metadata.description = eventResult.event.description || record.metadata.description;
            }
          }
          
          record.status = 'completed';
        } else {
          record.status = 'failed';
          record.error = scrapeResult.error || 'Failed to scrape Instagram post';
        }
      }
    } else if (record.urlType === 'meetup') {
      // Cache Meetup event data
      console.log('[sharedUrls] Caching Meetup event...');
      const meetupResult = await cacheMeetupEvent(record.cleanedUrl);
      console.log('[sharedUrls] Meetup cache result:', JSON.stringify(meetupResult, null, 2));
      
      if (meetupResult.success && meetupResult.event) {
        record.meetupEvent = meetupResult.event;
        record.metadata = {
          title: meetupResult.event.title,
          description: meetupResult.event.description,
          image: meetupResult.event.featuredPhoto?.highResUrl || meetupResult.event.featuredPhoto?.baseUrl,
        };
        record.status = 'completed';
      } else {
        // Even if caching fails, mark as completed (we can still open the URL)
        record.status = 'completed';
        record.error = meetupResult.error;
      }
    } else {
      // For other URLs, just mark as completed
      // (OG metadata is fetched separately in the UI)
      record.status = 'completed';
    }

    record.processedAt = new Date().toISOString();
    await saveSharedUrls(urls);
    console.log('[sharedUrls] URL processed:', record);
    
    return record;
  } catch (error) {
    console.error('[sharedUrls] Error processing URL:', error);
    record.status = 'failed';
    record.error = error instanceof Error ? error.message : 'Unknown error';
    record.processedAt = new Date().toISOString();
    await saveSharedUrls(urls);
    return record;
  }
}

/**
 * Get a single shared URL by ID
 */
export async function getSharedUrlById(id: string): Promise<SharedURLRecord | null> {
  const urls = await getSharedUrls();
  return urls.find(u => u.id === id) || null;
}

/**
 * Get a shared URL by cleaned URL
 */
export async function getSharedUrlByUrl(cleanedUrl: string): Promise<SharedURLRecord | null> {
  const urls = await getSharedUrls();
  return urls.find(u => u.cleanedUrl === cleanedUrl) || null;
}

/**
 * Delete a shared URL record
 */
export async function deleteSharedUrl(id: string): Promise<void> {
  const urls = await getSharedUrls();
  const filtered = urls.filter(u => u.id !== id);
  await saveSharedUrls(filtered);
  console.log('[sharedUrls] Deleted URL record:', id);
}

/**
 * Clear all shared URLs
 */
export async function clearAllSharedUrls(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
  console.log('[sharedUrls] Cleared all shared URLs');
}

/**
 * Get pending URLs that need processing
 */
export async function getPendingUrls(): Promise<SharedURLRecord[]> {
  const urls = await getSharedUrls();
  return urls.filter(u => u.status === 'pending');
}

/**
 * Process all pending URLs
 */
export async function processAllPending(): Promise<SharedURLRecord[]> {
  const pending = await getPendingUrls();
  const results: SharedURLRecord[] = [];
  
  for (const record of pending) {
    try {
      const processed = await processSharedUrl(record.id);
      results.push(processed);
    } catch (error) {
      console.error('[sharedUrls] Error processing pending URL:', record.id, error);
    }
  }
  
  return results;
}
