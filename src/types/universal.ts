/**
 * Universal Scraping API Request Parameters
 */
export interface UniversalScrapingRequest<T, R = any> {
  actor: string;
  input: T;
  proxy?: R;
}

export interface UniversalProxy {
  country: string;
}

export interface UniversalJsRenderInput {
  url: string;
  headless?: boolean;
  js_render?: boolean;
  js_instructions?: JsInstruction[];
  block?: {
    resources: string[];
  };
}

export interface JsInstruction {
  /**
   * Click element
   */
  click?: Array<number | string>;
  /**
   * Execute custom javascript code
   */
  evaluate?: string;
  /**
   * Fill form
   */
  fill?: string[];
  /**
   * [Keyboard
   * Operations](https://docs.scrapeless.com/en/web-unlocker/features/js-render/#keyboard-operations)
   */
  keyboard?: Array<number | string>;
  wait?: number;
  /**
   * Wait for element
   */
  wait_for?: Array<number | string>;
  [property: string]: any;
}

export interface UniversalWebUnlockerInput {
  url: string;
  type: string;
  redirect: boolean;
  method: string;
  request_id?: string;
  extractor?: string;
  header?: Record<string, string>;
}

export interface UniversalAkamaiWebCookieInput {
  type: string;
  url: string;
  userAgent: string;
}

export interface UniversalAkamaiWebSensorInput {
  abck: string;
  bmsz: string;
  url: string;
  userAgent: string;
}

export interface UniversalConfig {
  apiKey?: string;
  timeout?: number;
}
