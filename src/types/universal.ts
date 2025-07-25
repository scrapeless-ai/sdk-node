import { KeyInput } from 'puppeteer-core';

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
  jsRender: CreateJsRenderOptions;
}

export interface CreateJsRenderOptions {
  /** enable JS rendering */
  enabled: boolean;
  /** whether processing in headless mode */
  headless: boolean;
  /**
   * when to consider waiting succeeds. given an array of event strings, waiting is considered to be successful after all events have been fired.
   *
   * Allowed values: `load`,`domcontentloaded`,`networkidle2`,`networkidle0`
   */
  waitUntil?: string;
  /** resources or urls to block */
  block?: {
    resources?: string[];
    urls?: string[];
  };
  /** [JavaScript Instructions Reference](https://docs.scrapeless.com/en/universal-scraping-api/features/js-render/#javascript-instructions-reference) */
  instructions?: JsInstruction[];
  /** response config */
  response: UniversalResponseParams;
}

type WaitAction = {
  /** Wait for a number of ms */
  wait: number;
};

type WaitForAction = {
  /** Wait for a selector to be visible [selector, delay] */
  waitFor: [string, number];
};

type ClickAction = {
  /** Click on a selector [selector, delay] */
  click: [string, number];
};

type FillAction = {
  /** Fill a selector with a value [selector, value] */
  fill: [string, any];
};

type CheckAction = {
  /** Check a checkbox [selector] */
  check: string;
};

type UncheckAction = {
  /** Uncheck a checkbox [selector] */
  uncheck: string;
};

type EvaluateAction = {
  /** Evaluate a script [js script] */
  evaluate: string;
};

type KeyboardType = 'up' | 'press' | 'type' | 'down';

type KeyboardAction = {
  /** Keyboard input [KeyInput, KeyboardType, delay(ms)] */
  keyboard: [KeyInput, KeyboardType, number];
};

export type JsInstruction =
  | WaitAction
  | WaitForAction
  | ClickAction
  | FillAction
  | CheckAction
  | UncheckAction
  | EvaluateAction
  | KeyboardAction;

export type UniversalContentOutputType =
  | 'phone_numbers'
  | 'headings'
  | 'images'
  | 'audios'
  | 'videos'
  | 'links'
  | 'menus'
  | 'hashtags'
  | 'emails'
  | 'metadata'
  | 'tables'
  | 'favicon';

interface HtmlResponseOptions {
  selector?: string;
}

interface PlaintextResponseOptions {
  selector?: string;
}

interface MarkdownResponseOptions {
  selector?: string;
}

interface ImageResponseOptions {
  selector?: string;
  fullPage?: boolean;
}

interface NetworkResponseOptions {
  urls?: string[];
  status?: number[];
  methods?: string[];
}

interface ContentResponseOptions {
  selector?: string;
  outputs?: UniversalContentOutputType[];
}

export type UniversalResponseParams =
  | { type: 'html'; options?: HtmlResponseOptions }
  | { type: 'plaintext'; options?: PlaintextResponseOptions }
  | { type: 'markdown'; options?: MarkdownResponseOptions }
  | { type: 'png'; options?: ImageResponseOptions }
  | { type: 'jpeg'; options?: ImageResponseOptions }
  | { type: 'network'; options?: NetworkResponseOptions }
  | { type: 'content'; options?: ContentResponseOptions };

export interface UniversalWebUnlockerInput {
  url: string;
  method: string;
  redirect?: boolean;
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
