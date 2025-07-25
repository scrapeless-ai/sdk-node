import { UniversalService } from '../services';
import { getEnv, getEnvWithDefault } from '../env';
import {
  UniversalScrapingRequest,
  UniversalProxy,
  UniversalJsRenderInput,
  UniversalWebUnlockerInput,
  UniversalAkamaiWebCookieInput,
  UniversalAkamaiWebSensorInput,
  UniversalConfig
} from '../types';

export class Universal {
  private universalService: UniversalService;
  private timeout: number;
  private apiKey: string;
  private baseApiURL: string;

  constructor(config?: UniversalConfig) {
    this.apiKey = config?.apiKey || getEnv('SCRAPELESS_API_KEY');
    this.baseApiURL = getEnvWithDefault('SCRAPELESS_BASE_API_URL', 'https://api.scrapeless.com');
    this.timeout = config?.timeout || 30_000;
    this.universalService = new UniversalService(this.apiKey, this.baseApiURL, this.timeout);
  }

  async jsRender(data: UniversalScrapingRequest<UniversalJsRenderInput, UniversalProxy>) {
    return this.universalService.scrape(data);
  }

  async webUnlocker(data: UniversalScrapingRequest<UniversalWebUnlockerInput, UniversalProxy>) {
    return this.universalService.scrape(data);
  }

  /** @deprecated */
  async akamaiwebCookie(data: UniversalScrapingRequest<UniversalAkamaiWebCookieInput, UniversalProxy>) {
    return this.universalService.scrape(data);
  }

  /** @deprecated */
  async akamaiwebSensor(data: UniversalScrapingRequest<UniversalAkamaiWebSensorInput, UniversalProxy>) {
    return this.universalService.scrape(data);
  }
}
