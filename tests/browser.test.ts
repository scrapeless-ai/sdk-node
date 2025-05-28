import { describe, it, expect, beforeEach } from 'vitest';
import { ScrapelessClient } from '../src';

describe('BrowserService', () => {
  let client: ScrapelessClient;

  beforeEach(() => {
    client = new ScrapelessClient({
      apiKey: 'test'
    });
  });

  it('should create a browser session (sync)', () => {
    const result = client.browser.create({ session_name: 'test-session' });
    console.log('Created browser session:', result);
    expect(result.browserWSEndpoint).toContain('wss://');
  });

  it('should create a browser session (async)', async () => {
    const result = await client.browser.createAsync({
      session_name: 'test-session',
      proxy_url: 'http://proxy.example.com:8080'
    });
    console.log('Created browser session (async):', result);
    expect(result.browserWSEndpoint).toContain('wss://');
  });
});
