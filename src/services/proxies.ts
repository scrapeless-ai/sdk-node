import { BaseService } from './base';
import { ICreateProxy, ScrapelessProxy } from '../types';

/**
 * ProxiesService provides functionality for working with residential proxies
 */
export class ProxiesService extends BaseService implements ScrapelessProxy {
  constructor(apiKey: string, baseUrl: string, timeout: number) {
    super(apiKey, baseUrl, timeout);
  }

  /**
   * Generate a proxy URL string based on the provided configuration
   * @param proxy Proxy configuration
   * @returns Formatted proxy URL string
   */
  proxy(proxy: ICreateProxy): string {
    // The API key is used as the token for proxy authentication
    const token = this.apiKey;

    // Format the base URL for the proxy
    const baseURL = `http://CHANNEL-proxy.${proxy.type}`;

    // Construct the full proxy URL with country, session duration, session ID, and gateway
    let proxyPart = `-country_${proxy.country}`;
    if (proxy.state) {
      proxyPart += `-state_${proxy.state}`;
    }

    if (proxy.city) {
      proxyPart += `-city_${proxy.city}`;
    }

    return `${baseURL}${proxyPart}-r_${proxy.sessionDuration}m-s_${proxy.sessionId}:${token}@${proxy.gateway}`;
  }

  /**
   * Create a new residential proxy with the specified configuration
   * @param options Proxy configuration options
   * @returns Formatted proxy URL string
   */
  createProxy(options: ICreateProxy): string {
    // This method is an alias for the proxy method to maintain API consistency
    return this.proxy(options);
  }

  /**
   * Generate a random session ID for use with proxies
   * @returns A random string suitable for use as a session ID
   */
  generateSessionId(): string {
    // Generate a random session ID using a timestamp and random string
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 10);
    return `${timestamp}-${randomStr}`;
  }
}
