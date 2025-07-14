import { BaseService } from './base';
import { ExtensionService } from './extension';
import { getEnvWithDefault } from '../env';
import { ICreateBrowser, ICreateBrowserResponse, ICreateBrowserHttpResponse } from '../types';

// Define default parameters
const DEFAULT_BROWSER_OPTIONS: ICreateBrowser = {
  session_name: '',
  session_ttl: 180,
  proxy_country: 'ANY'
};

export class BrowserService extends BaseService {
  public readonly extension: ExtensionService;

  constructor(apiKey: string, baseUrl: string, timeout: number = 30_000) {
    super(apiKey, baseUrl, timeout);

    const baseApiURL = getEnvWithDefault('SCRAPELESS_BASE_API_URL', 'https://api.scrapeless.com');
    this.extension = new ExtensionService(apiKey, baseApiURL, timeout);
  }

  /**
   * Create a browser session
   * @param options Browser session configuration
   * @returns Response containing devtoolsUrl
   */
  create(options: ICreateBrowser = {}): ICreateBrowserResponse {
    // Merge default options with user provided options
    const data = { ...DEFAULT_BROWSER_OPTIONS, ...options };

    // Build parameter object directly, handle special type conversions
    const params = {
      token: this.apiKey,
      session_name: data.session_name,
      session_ttl: data.session_ttl?.toString(),
      session_recording: data.session_recording?.toString(),
      proxy_country: data.proxy_country,
      proxy_url: data.proxy_url,
      fingerprint: data.fingerprint ? JSON.stringify(data.fingerprint) : undefined,
      extension_ids: data.extension_ids
    };

    if (data.proxy_url) {
      delete params.proxy_country;
    }

    // Filter out empty values
    const filteredParams = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== '')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    const search = new URLSearchParams(filteredParams);

    let protocol = 'wss';
    if (this.baseUrl.startsWith('http://')) {
      protocol = 'ws';
    }
    return {
      browserWSEndpoint: `${protocol}://${this.baseUrl.replace(/^(.*?):\/\//, '')}/browser?${search.toString()}`
    };
  }

  /**
   * Async version of create method (maintains compatibility but calls the sync method directly)
   */
  async createAsync(options: ICreateBrowser = {}): Promise<ICreateBrowserResponse> {
    return this.create(options);
  }

  /**
   * Create a browser session
   * @param options Browser session configuration
   * @returns Response containing devtoolsUrl
   */
  async createSession(options: ICreateBrowser = {}): Promise<ICreateBrowserResponse> {
    // Merge default options with user provided options
    const data = { ...DEFAULT_BROWSER_OPTIONS, ...options };

    // Build parameter object directly, handle special type conversions
    const params: { [key: string]: string } = {
      token: this.apiKey,
      session_name: data.session_name || '',
      session_ttl: data.session_ttl?.toString() || '',
      session_recording: data.session_recording?.toString() || '',
      proxy_country: data.proxy_country || 'ANY',
      proxy_url: data.proxy_url || '',
      fingerprint: data.fingerprint ? JSON.stringify(data.fingerprint) : '',
      extension_ids: data.extension_ids || ''
    };

    if (data.proxy_url) {
      delete params.proxy_country;
    }

    const searchParams = new URLSearchParams(params);

    try {
      const task = await this.request<ICreateBrowserHttpResponse, true>(
        `/browser?${searchParams.toString()}`,
        'GET',
        undefined,
        {},
        true
      );
      if (!task.data.success) {
        throw new Error(`Failed to create browser session: ${JSON.stringify(task.data)}`);
      }

      if (!task.data.taskId) {
        throw new Error('Failed to create browser session: taskId is missing');
      }

      return {
        browserWSEndpoint: `wss://browser.scrapeless.com/browser/${task.data.taskId}?token=${this.apiKey}`
      };
    } catch (error) {
      // Handle errors gracefully
      throw new Error(`Failed to create browser session: ${error}`);
    }
  }
}
