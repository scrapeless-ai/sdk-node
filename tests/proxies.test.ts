import { describe, it, expect, beforeEach } from 'vitest';
import { ScrapelessClient } from '../src';

// Test suite for ProxiesService
// Covers: proxy, createProxy, generateSessionId

describe('ProxiesService', () => {
  let client: ScrapelessClient;

  beforeEach(() => {
    client = new ScrapelessClient({ apiKey: 'test' });
  });

  it('should generate proxy url using proxy()', () => {
    const url = client.proxies.proxy({
      country: 'US',
      sessionDuration: 10,
      sessionId: 'sid',
      gateway: 'gw.example.com'
    });
    // Log the generated proxy URL
    console.log('Generated proxy URL:', url);
    expect(url).toContain('US');
    expect(url).toContain('gw.example.com');
    expect(url).toContain('sid');
  });

  it('should generate proxy url using createProxy()', () => {
    const url = client.proxies.createProxy({
      country: 'JP',
      sessionDuration: 5,
      sessionId: 'session-xyz',
      gateway: 'proxy.jp.example.com'
    });
    // Log the generated proxy URL
    console.log('Generated proxy URL (createProxy):', url);
    expect(url).toContain('JP');
    expect(url).toContain('proxy.jp.example.com');
    expect(url).toContain('session-xyz');
  });

  it('should generate a random session id', () => {
    const sid = client.proxies.generateSessionId();
    // Log the generated session id
    console.log('Generated session id:', sid);
    expect(typeof sid).toBe('string');
    expect(sid.length).toBeGreaterThan(0);
  });
});
