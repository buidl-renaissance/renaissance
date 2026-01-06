/**
 * URL Detection and Metadata Fetching Utilities
 * 
 * Detects event platform URLs and fetches Open Graph metadata for rich previews.
 */

export type URLType = 
  | 'luma'
  | 'ra'
  | 'meetup'
  | 'eventbrite'
  | 'instagram'
  | 'generic';

export interface URLInfo {
  type: URLType;
  url: string;
  eventId?: string;
  platformName: string;
  platformColor: string;
}

export interface OGMetadata {
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  url: string;
}

export interface InstagramScrapeResult {
  success: boolean;
  featuredPost?: {
    postCode: string;
    caption: string;
    images: string[];
    timestamp: string;
    likes?: number;
    comments?: number;
  };
  relatedPosts?: Array<{
    postCode: string;
    caption: string;
    images: string[];
    timestamp: string;
  }>;
  error?: string;
}

export interface ExtractedEventInfo {
  success: boolean;
  event?: {
    name?: string;
    description?: string;
    type?: string;
    startDatetime?: string;
    endDatetime?: string;
    venue?: string;
    location?: string;
    artistNames?: string[];
    price?: string;
    ticketUrl?: string;
    additionalInfo?: string;
  };
  error?: string;
}

export interface InstagramCacheResult {
  success: boolean;
  cached: boolean;
  data?: {
    featuredPost?: InstagramScrapeResult['featuredPost'];
    relatedPosts?: InstagramScrapeResult['relatedPosts'];
    event?: ExtractedEventInfo['event'];
  };
  error?: string;
}

export interface MeetupCacheResult {
  success: boolean;
  event?: {
    id: number;
    eventId: string;
    title: string;
    description: string;
    dateTime: string;
    venue: {
      name: string;
      address: string;
      city: string;
      state: string;
      country: string;
    } | null;
    group: {
      id: string;
      name: string;
      urlname: string;
    };
    eventUrl: string;
    featuredPhoto?: {
      baseUrl: string;
      highResUrl: string;
    };
    rsvpCount?: number;
  };
  error?: string;
}

/**
 * URL patterns for event platforms
 */
const URL_PATTERNS: Record<URLType, RegExp[]> = {
  luma: [
    /^https?:\/\/(www\.)?lu\.ma\//i,
    /^https?:\/\/(www\.)?luma\.events\//i,
  ],
  ra: [
    /^https?:\/\/(www\.)?ra\.co\//i,
    /^https?:\/\/(www\.)?residentadvisor\.net\//i,
  ],
  meetup: [
    /^https?:\/\/(www\.)?meetup\.com\//i,
    /^https?:\/\/(www\.)?meetu\.ps\//i,
  ],
  eventbrite: [
    /^https?:\/\/(www\.)?eventbrite\.(com|co\.uk|ca|com\.au)\//i,
  ],
  instagram: [
    /^https?:\/\/(www\.)?instagram\.com\//i,
  ],
  generic: [],
};

/**
 * Platform display configuration
 */
const PLATFORM_CONFIG: Record<URLType, { name: string; color: string }> = {
  luma: { name: 'Luma', color: '#FF6B6B' },
  ra: { name: 'Resident Advisor', color: '#7C3AED' },
  meetup: { name: 'Meetup', color: '#F97316' },
  eventbrite: { name: 'Eventbrite', color: '#F05537' },
  instagram: { name: 'Instagram', color: '#E4405F' },
  generic: { name: 'Link', color: '#6B7280' },
};

/**
 * Check if URL is a short/redirect URL that needs resolution
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
 * Resolve a short URL by following redirects to get the final URL
 */
export async function resolveShortUrl(url: string): Promise<string> {
  try {
    console.log('[urlDetection] Resolving short URL:', url);
    
    // Use HEAD request to follow redirects without downloading content
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
    });
    
    const finalUrl = response.url;
    console.log('[urlDetection] Resolved URL:', finalUrl);
    
    return finalUrl;
  } catch (error) {
    console.error('[urlDetection] Error resolving short URL:', error);
    // If HEAD fails, try GET
    try {
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
      });
      console.log('[urlDetection] Resolved URL (via GET):', response.url);
      return response.url;
    } catch (getError) {
      console.error('[urlDetection] Error resolving short URL via GET:', getError);
      return url; // Return original if resolution fails
    }
  }
}

/**
 * Clean Instagram URL by removing tracking parameters like igsh
 */
function cleanInstagramUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove Instagram tracking parameters
    urlObj.searchParams.delete('igsh');
    urlObj.searchParams.delete('igshid');
    urlObj.searchParams.delete('utm_source');
    urlObj.searchParams.delete('utm_medium');
    urlObj.searchParams.delete('utm_campaign');
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Clean Meetup URL by removing tracking parameters
 */
function cleanMeetupUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove Meetup tracking parameters
    urlObj.searchParams.delete('_xtd');
    urlObj.searchParams.delete('from');
    urlObj.searchParams.delete('utm_source');
    urlObj.searchParams.delete('utm_medium');
    urlObj.searchParams.delete('utm_campaign');
    urlObj.searchParams.delete('rv');
    urlObj.searchParams.delete('_af');
    urlObj.searchParams.delete('_af_eid');
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Clean generic URL by removing common tracking parameters
 */
function cleanGenericUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove common tracking parameters
    urlObj.searchParams.delete('utm_source');
    urlObj.searchParams.delete('utm_medium');
    urlObj.searchParams.delete('utm_campaign');
    urlObj.searchParams.delete('utm_term');
    urlObj.searchParams.delete('utm_content');
    urlObj.searchParams.delete('fbclid');
    urlObj.searchParams.delete('gclid');
    urlObj.searchParams.delete('ref');
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Detect the type of URL and extract relevant information
 */
export function detectURLType(url: string): URLInfo {
  let normalizedUrl = url.trim();
  
  for (const [type, patterns] of Object.entries(URL_PATTERNS) as [URLType, RegExp[]][]) {
    if (type === 'generic') continue;
    
    for (const pattern of patterns) {
      if (pattern.test(normalizedUrl)) {
        // Clean URLs by removing tracking params based on type
        if (type === 'instagram') {
          normalizedUrl = cleanInstagramUrl(normalizedUrl);
        } else if (type === 'meetup') {
          normalizedUrl = cleanMeetupUrl(normalizedUrl);
        } else {
          normalizedUrl = cleanGenericUrl(normalizedUrl);
        }
        
        const config = PLATFORM_CONFIG[type];
        return {
          type,
          url: normalizedUrl,
          eventId: extractEventId(normalizedUrl, type),
          platformName: config.name,
          platformColor: config.color,
        };
      }
    }
  }
  
  // Default to generic - still clean it
  normalizedUrl = cleanGenericUrl(normalizedUrl);
  const config = PLATFORM_CONFIG.generic;
  return {
    type: 'generic',
    url: normalizedUrl,
    platformName: config.name,
    platformColor: config.color,
  };
}

/**
 * Extract event ID from URL based on platform
 */
function extractEventId(url: string, type: URLType): string | undefined {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    switch (type) {
      case 'luma':
        // lu.ma/event-slug or lu.ma/e/event-id
        const lumaMatch = pathname.match(/^\/(?:e\/)?([^\/\?]+)/);
        return lumaMatch?.[1];
        
      case 'ra':
        // ra.co/events/123456
        const raMatch = pathname.match(/\/events\/(\d+)/);
        return raMatch?.[1];
        
      case 'meetup':
        // meetup.com/group-name/events/123456
        const meetupMatch = pathname.match(/\/events\/(\d+)/);
        return meetupMatch?.[1];
        
      case 'eventbrite':
        // eventbrite.com/e/event-name-tickets-123456
        const eventbriteMatch = pathname.match(/\/e\/[^\/]+-(\d+)/);
        return eventbriteMatch?.[1];
        
      case 'instagram':
        // instagram.com/p/ABC123 or instagram.com/reel/ABC123
        const igMatch = pathname.match(/\/(?:p|reel)\/([^\/\?]+)/);
        return igMatch?.[1];
        
      default:
        return undefined;
    }
  } catch {
    return undefined;
  }
}

/**
 * Check if URL is an event platform URL
 */
export function isEventURL(urlInfo: URLInfo): boolean {
  return ['luma', 'ra', 'meetup', 'eventbrite'].includes(urlInfo.type);
}

/**
 * Map URLType to WebModalEventType
 */
export function getWebModalEventType(urlType: URLType): 'ra' | 'luma' | 'meetup' | 'instagram' | undefined {
  switch (urlType) {
    case 'luma':
      return 'luma';
    case 'ra':
      return 'ra';
    case 'meetup':
      return 'meetup';
    case 'instagram':
      return 'instagram';
    default:
      return undefined;
  }
}

/**
 * Extract metadata from URL path for known platforms
 */
function extractMetadataFromUrl(url: string): OGMetadata {
  try {
    const urlObj = new URL(url);
    const urlInfo = detectURLType(url);
    const pathname = urlObj.pathname;
    
    let title = urlInfo.platformName;
    let description: string | null = null;
    
    // Extract meaningful info from URL paths
    if (urlInfo.type === 'meetup') {
      // meetup.com/group-name/events/123456
      const groupMatch = pathname.match(/^\/([^\/]+)/);
      const groupName = groupMatch?.[1]?.replace(/-/g, ' ');
      if (groupName) {
        title = `${groupName} - Meetup Event`;
        description = `Event from ${groupName} on Meetup`;
      }
    } else if (urlInfo.type === 'luma') {
      // lu.ma/event-slug
      const eventMatch = pathname.match(/^\/(?:e\/)?([^\/\?]+)/);
      const eventSlug = eventMatch?.[1]?.replace(/-/g, ' ');
      if (eventSlug) {
        title = eventSlug;
        description = 'Event on Luma';
      }
    } else if (urlInfo.type === 'eventbrite') {
      // eventbrite.com/e/event-name-tickets-123456
      const eventMatch = pathname.match(/\/e\/([^\/]+)/);
      const eventName = eventMatch?.[1]?.replace(/-tickets-\d+$/, '').replace(/-/g, ' ');
      if (eventName) {
        title = eventName;
        description = 'Event on Eventbrite';
      }
    } else if (urlInfo.type === 'ra') {
      title = 'Resident Advisor Event';
      description = 'Event on Resident Advisor';
    }
    
    return {
      title,
      description,
      image: null,
      siteName: urlInfo.platformName,
      url: url,
    };
  } catch {
    return {
      title: 'Shared Link',
      description: url,
      image: null,
      siteName: null,
      url: url,
    };
  }
}

/**
 * Fetch Open Graph metadata from a URL
 * Uses a metadata extraction API to avoid CORS issues in React Native
 */
export async function fetchOGMetadata(url: string): Promise<OGMetadata> {
  try {
    // Use a public Open Graph metadata extraction service
    // You can replace this with your own backend endpoint
    const encodedUrl = encodeURIComponent(url);
    
    // Try using opengraph.io API (free tier available)
    // Alternative: use your own backend proxy
    const response = await fetch(
      `https://opengraph.io/api/1.1/site/${encodedUrl}?app_id=default`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status}`);
    }
    
    const data = await response.json();
    
    // opengraph.io response structure
    if (data.hybridGraph) {
      return {
        title: data.hybridGraph.title || null,
        description: data.hybridGraph.description || null,
        image: data.hybridGraph.image || data.hybridGraph.imageSecureUrl || null,
        siteName: data.hybridGraph.site_name || null,
        url: data.hybridGraph.url || url,
      };
    }
    
    // Fallback: return basic info
    return extractMetadataFromUrl(url);
  } catch (error) {
    console.error('[urlDetection] Error fetching OG metadata:', error);
    
    // Return URL-based fallback with smart extraction
    return extractMetadataFromUrl(url);
  }
}

/**
 * Cache a Meetup event from its URL
 * Uses meetup.builddetroit.xyz API
 */
export async function cacheMeetupEvent(url: string): Promise<MeetupCacheResult> {
  const apiUrl = 'https://meetup.builddetroit.xyz/api/meetup/cache';
  const requestBody = { url };
  
  console.log('[urlDetection] ========== MEETUP CACHE REQUEST ==========');
  console.log('[urlDetection] API URL:', apiUrl);
  console.log('[urlDetection] Request body:', JSON.stringify(requestBody, null, 2));
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('[urlDetection] Meetup cache API response status:', response.status);
    console.log('[urlDetection] Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));

    const responseText = await response.text();
    console.log('[urlDetection] Meetup cache API raw response text:', responseText);

    if (!response.ok) {
      console.error('[urlDetection] Meetup cache API error - status:', response.status, 'body:', responseText);
      return {
        success: false,
        error: `Failed to cache Meetup event: ${response.status}`,
      };
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('[urlDetection] Failed to parse response as JSON:', e);
      return {
        success: false,
        error: 'Invalid JSON response from Meetup cache API',
      };
    }
    
    console.log('[urlDetection] Meetup cache API parsed response:', JSON.stringify(data, null, 2));

    return {
      success: true,
      event: data.event || data.data || data,
    };
  } catch (error) {
    console.error('[urlDetection] Error caching Meetup event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cache Meetup event',
    };
  }
}

/**
 * Check if an Instagram URL is already cached and has event data
 * Uses instagram.builddetroit.xyz API
 */
export async function checkInstagramCache(url: string): Promise<InstagramCacheResult> {
  try {
    console.log('[urlDetection] Checking Instagram cache for:', url);
    const response = await fetch('https://instagram.builddetroit.xyz/api/check-cache', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    console.log('[urlDetection] Instagram cache check response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[urlDetection] Instagram cache check error response:', errorText);
      return {
        success: false,
        cached: false,
        error: `Failed to check cache: ${response.status}`,
      };
    }

    const data = await response.json();
    console.log('[urlDetection] Instagram cache check raw response:', JSON.stringify(data, null, 2));

    // Check if we have cached data
    const hasCachedData = data.success && data.data?.featuredPost;
    const hasEvent = !!data.data?.event;

    return {
      success: true,
      cached: hasCachedData,
      data: hasCachedData ? {
        featuredPost: data.data.featuredPost,
        relatedPosts: data.data.relatedPosts,
        event: data.data.event,
      } : undefined,
    };
  } catch (error) {
    console.error('[urlDetection] Error checking Instagram cache:', error);
    return {
      success: false,
      cached: false,
      error: error instanceof Error ? error.message : 'Failed to check cache',
    };
  }
}

/**
 * Scrape Instagram URL to extract images and metadata
 * Uses instagram.builddetroit.xyz API
 */
export async function scrapeInstagramUrl(url: string): Promise<InstagramScrapeResult> {
  try {
    console.log('[urlDetection] Calling Instagram scrape API for:', url);
    const response = await fetch('https://instagram.builddetroit.xyz/api/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    console.log('[urlDetection] Instagram API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[urlDetection] Instagram API error response:', errorText);
      throw new Error(`Failed to scrape Instagram: ${response.status}`);
    }

    const data = await response.json();
    console.log('[urlDetection] Instagram API raw response:', JSON.stringify(data, null, 2));
    
    // The API might return data in different structures, let's handle them
    const featuredPost = data.featuredPost || data.post || data.data?.featuredPost || data.data?.post;
    const relatedPosts = data.relatedPosts || data.posts || data.data?.relatedPosts || data.data?.posts;
    
    return {
      success: true,
      featuredPost,
      relatedPosts,
    };
  } catch (error) {
    console.error('[urlDetection] Error scraping Instagram URL:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to scrape Instagram post',
    };
  }
}

/**
 * Extract event information from an Instagram post image using AI vision
 * Uses instagram.builddetroit.xyz API
 */
export async function extractEventFromInstagram(
  postCode: string,
  imageUrl: string,
  caption?: string
): Promise<ExtractedEventInfo> {
  try {
    console.log('[urlDetection] Extracting event from Instagram post:', {
      postCode,
      imageUrl,
      hasCaption: !!caption,
    });
    
    // Validate required fields
    if (!postCode || !imageUrl) {
      console.error('[urlDetection] Missing required fields for event extraction:', { postCode, imageUrl });
      return {
        success: false,
        error: 'postCode and imageUrl are required',
      };
    }
    
    const requestBody = { 
      postCode, 
      imageUrl,
      ...(caption && { caption }),
    };
    console.log('[urlDetection] Event extraction request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch('https://instagram.builddetroit.xyz/api/events/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('[urlDetection] Event extraction API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[urlDetection] Event extraction API error response:', errorText);
      throw new Error(`Failed to extract event: ${response.status}`);
    }

    const data = await response.json();
    console.log('[urlDetection] Event extraction API raw response:', JSON.stringify(data, null, 2));

    return {
      success: true,
      event: data.event || data.data?.event || data,
    };
  } catch (error) {
    console.error('[urlDetection] Error extracting event from Instagram:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract event information',
    };
  }
}

/**
 * Convert Instagram scrape result to OGMetadata format
 */
export function instagramScrapeToMetadata(scrapeResult: InstagramScrapeResult, url: string): OGMetadata {
  if (!scrapeResult.success || !scrapeResult.featuredPost) {
    return {
      title: 'Instagram Post',
      description: null,
      image: null,
      siteName: 'Instagram',
      url,
    };
  }

  const post = scrapeResult.featuredPost;
  
  // Extract first line or first 100 chars of caption for title
  const captionLines = post.caption?.split('\n') || [];
  const title = captionLines[0]?.substring(0, 100) || 'Instagram Post';
  
  return {
    title,
    description: post.caption || null,
    image: post.images?.[0] || null,
    siteName: 'Instagram',
    url,
  };
}

/**
 * Alternative metadata fetcher that tries multiple sources
 */
export async function fetchMetadataWithFallback(url: string): Promise<OGMetadata> {
  // First, try the primary method
  const metadata = await fetchOGMetadata(url);
  
  // If we got meaningful data, return it
  if (metadata.title && metadata.title !== new URL(url).hostname) {
    return metadata;
  }
  
  // Fallback: extract basic info from URL
  try {
    const urlObj = new URL(url);
    const urlInfo = detectURLType(url);
    
    // Generate a friendly title based on platform
    let title = urlObj.hostname;
    if (urlInfo.type !== 'generic') {
      title = `${urlInfo.platformName} Link`;
    }
    
    return {
      title: metadata.title || title,
      description: metadata.description || `View this link on ${urlInfo.platformName}`,
      image: metadata.image,
      siteName: metadata.siteName || urlInfo.platformName,
      url: url,
    };
  } catch {
    return metadata;
  }
}
