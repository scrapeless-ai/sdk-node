/**
 * Base utility functions collection
 */

/**
 * Sleep for specified milliseconds
 * @param ms Milliseconds
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry a specified function until success or maximum attempts reached
 * @param fn Async function to retry
 * @param options Retry options
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoff?: boolean;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> => {
  const { maxAttempts = 3, delay = 1000, backoff = true, onRetry = () => {} } = options;

  let attempt = 0;
  let lastError: Error = new Error('Retry failed');

  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      attempt++;

      if (attempt >= maxAttempts) {
        break;
      }

      onRetry(attempt, lastError);

      // If using backoff strategy, the delay time will double for each retry
      const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;
      await sleep(waitTime);
    }
  }

  throw lastError;
};

/**
 * Parse URL, extract domain and path
 * @param url URL string
 */
export const parseUrl = (
  url: string
): {
  protocol: string;
  hostname: string;
  path: string;
  query: Record<string, string>;
  fragment: string;
} => {
  try {
    const parsedUrl = new URL(url);
    const query: Record<string, string> = {};

    // Parse query parameters
    parsedUrl.searchParams.forEach((value, key) => {
      query[key] = value;
    });

    return {
      protocol: parsedUrl.protocol.replace(':', ''),
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname,
      query,
      fragment: parsedUrl.hash.replace('#', '')
    };
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }
};

/**
 * Generate random string
 * @param length String length
 */
export const randomString = (length = 10): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};

/**
 * Detect browser environment
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};

/**
 * Format date
 * @param date Date object or timestamp
 * @param format Format string
 */
export const formatDate = (date: Date | number | string, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  const d = new Date(date);

  const replacements: Record<string, string> = {
    YYYY: d.getFullYear().toString(),
    MM: (d.getMonth() + 1).toString().padStart(2, '0'),
    DD: d.getDate().toString().padStart(2, '0'),
    HH: d.getHours().toString().padStart(2, '0'),
    mm: d.getMinutes().toString().padStart(2, '0'),
    ss: d.getSeconds().toString().padStart(2, '0')
  };

  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, match => replacements[match]);
};
