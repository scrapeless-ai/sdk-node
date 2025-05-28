export interface ICreateBrowser {
  session_name?: string;
  session_ttl?: number;
  session_recording?: boolean;
  proxy_country?: string;
  proxy_url?: string;
  fingerprint?: object;
}

export interface ICreateBrowserResponse {
  browserWSEndpoint: string;
}
