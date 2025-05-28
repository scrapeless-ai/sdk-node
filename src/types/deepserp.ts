/**
 * SERP API Request Parameters
 */
export interface SerpRequest {
  /**
   * Search query
   */
  query: string;

  /**
   * Target country/region (e.g., "us", "uk", "ca")
   */
  country?: string;

  /**
   * Search language (e.g., "en", "fr", "de")
   */
  language?: string;

  /**
   * Device type
   */
  device?: 'desktop' | 'mobile' | 'tablet';

  /**
   * Search results page number
   */
  page?: number;

  /**
   * Results per page
   */
  pageSize?: number;

  /**
   * Advanced search parameters
   */
  params?: Record<string, string>;

  /**
   * Search engine (default is Google)
   */
  engine?: 'google' | 'bing' | 'yahoo' | 'yandex' | 'duckduckgo';

  /**
   * Proxy configuration
   */
  proxy?:
    | string
    | {
        type: 'http' | 'https' | 'socks4' | 'socks5';
        host: string;
        port: number;
        username?: string;
        password?: string;
      };
}

/**
 * Organic search result entry
 */
export interface SerpOrganicResult {
  position: number;
  title: string;
  url: string;
  displayUrl: string;
  snippet: string;
  cachedUrl?: string;
  relatedUrl?: string;
  sitelinks?: Array<{
    title: string;
    url: string;
    snippet?: string;
  }>;
}

/**
 * Ad result entry
 */
export interface SerpAdResult {
  position: number;
  title: string;
  url: string;
  displayUrl: string;
  snippet: string;
  sitelinks?: Array<{
    title: string;
    url: string;
    snippet?: string;
  }>;
}

/**
 * Local search result entry
 */
export interface SerpLocalResult {
  position: number;
  title: string;
  address: string;
  website?: string;
  phone?: string;
  rating?: number;
  reviewCount?: number;
  categories?: string[];
  hours?: Record<string, string>;
  latitude?: number;
  longitude?: number;
}

/**
 * Product search result entry
 */
export interface SerpProductResult {
  position: number;
  title: string;
  url: string;
  price?: string;
  currency?: string;
  merchant?: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
}

/**
 * SERP API Response Result
 */
export interface SerpResult {
  /**
   * Request status
   */
  status: 'success' | 'error';

  /**
   * Original search query
   */
  query: string;

  /**
   * Search engine
   */
  engine: string;

  /**
   * Total number of search results (estimated)
   */
  totalResults?: number;

  /**
   * Search time
   */
  searchTime?: number;

  /**
   * Organic search results
   */
  organic?: SerpOrganicResult[];

  /**
   * Ad results
   */
  ads?: SerpAdResult[];

  /**
   * Local results
   */
  local?: SerpLocalResult[];

  /**
   * Product results
   */
  products?: SerpProductResult[];

  /**
   * Knowledge graph results
   */
  knowledgeGraph?: Record<string, any>;

  /**
   * Related searches
   */
  relatedSearches?: string[];

  /**
   * Error message (if any)
   */
  error?: string;

  /**
   * Request ID
   */
  requestId: string;

  /**
   * Response timestamp
   */
  timestamp: string;
}
