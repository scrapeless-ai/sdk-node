export type IProxyType = 'residential' | 'ipv6' | 'datacenter';

/**
 * Proxy configuration interface for creating residential proxies
 */
export interface ICreateProxy {
  /**
   * Proxy type (e.g., 'residential', 'ipv6', 'datacenter')
   */
  type: IProxyType;

  /**
   * Country code for the proxy (e.g., 'US', 'UK', 'JP')
   */
  country: string;

  /**
   * Session duration in minutes
   */
  sessionDuration: number;

  /**
   * Unique session identifier
   */
  sessionId: string;

  /**
   * Gateway hostname for the proxy
   */
  gateway: string;
}

/**
 * Interface for proxy service
 */
export interface ScrapelessProxy {
  /**
   * Generate a proxy URL string based on the provided configuration
   * @param proxy Proxy configuration
   * @returns Formatted proxy URL string
   */
  proxy: (proxy: ICreateProxy) => string;
}
