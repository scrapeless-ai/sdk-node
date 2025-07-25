import { BaseService } from './base';
import { ExtensionService } from './extension';
import { getEnvWithDefault } from '../env';
import { ICreateBrowser, ICreateBrowserResponse, ICreateBrowserHttpResponse } from '../types';

// Define default parameters
const DEFAULT_BROWSER_OPTIONS: ICreateBrowser = {
  sessionName: '',
  sessionTTL: 180,
  proxyCountry: 'ANY'
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

    // Build parameter object directly, handle special type conversions
    const params = {
      token: this.apiKey,
      sessionName: data.sessionName,
      sessionTTL: data.sessionTTL?.toString(),
      sessionRecording: data.sessionRecording?.toString(),
      proxyCountry: data.proxyCountry,
      proxyURL: data.proxyURL,
      fingerprint: data.fingerprint ? JSON.stringify(data.fingerprint) : undefined,
      extensionIds: data.extensionIds,
      profileId: data.profileId,
      profilePersist: data.profilePersist?.toString()
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
