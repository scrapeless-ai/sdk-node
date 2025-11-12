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
   * Build browser search params
   * @param options Browser session configuration
   * @returns URLSearchParams
   */
  private buildBrowserSearchParams(options: ICreateBrowser) {
    // Merge default options with user provided options
    const data = { ...DEFAULT_BROWSER_OPTIONS, ...options };
    const {
      session_name,
      session_ttl,
      session_recording,
      proxy_country,
      proxy_state,
      proxy_city,
      proxy_url,
      extension_ids,
      profile_id,
      profile_persist
    } = data;
    const {
      sessionName = session_name,
      sessionTTL = session_ttl,
      sessionRecording = session_recording,
      proxyCountry = proxy_country,
      proxyState = proxy_state,
      proxyCity = proxy_city,
      proxyURL = proxy_url,
      fingerprint,
      extensionIds = extension_ids,
      profileId = profile_id,
      profilePersist = profile_persist
    } = data;

    // Build parameter object directly, handle special type conversions
    const params = {
      token: this.apiKey,
      sessionName,
      sessionTTL: sessionTTL?.toString(),
      sessionRecording: sessionRecording?.toString(),
      proxyCountry,
      proxyState,
      proxyCity,
      proxyURL,
      fingerprint: fingerprint ? JSON.stringify(fingerprint) : undefined,
      extensionIds,
      profileId,
      profilePersist: profilePersist?.toString()
    };

    if (data.proxyURL) {
      delete params.proxyCountry;
    }

    // Filter out empty values
    const filteredParams = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== '')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    return new URLSearchParams(filteredParams);
  }

  /**
   * Create a browser session
   * @param options Browser session configuration
   * @returns Response containing devtoolsUrl
   */
  create(options: ICreateBrowser = {}): ICreateBrowserResponse {
    const search = this.buildBrowserSearchParams(options);

    let protocol = 'wss';
    if (this.baseUrl.startsWith('http://')) {
      protocol = 'ws';
    }
    return {
      browserWSEndpoint: `${protocol}://${this.baseUrl.replace(/^(.*?):\/\//, '')}/api/v2/browser?${search.toString()}`
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
    const search = this.buildBrowserSearchParams(options);

    try {
      const task = await this.request<ICreateBrowserHttpResponse, true>(
        `/api/v2/browser?${search.toString()}`,
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
