import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScrapelessClient } from '../src/client';

const mockFetch = vi.fn();

describe('UniversalService', () => {
  let client: ScrapelessClient;

  beforeEach(() => {
    client = new ScrapelessClient({ apiKey: 'test' });
    mockFetch.mockReset();
  });

  it('should scrape any website', async () => {
    const result = await client.universal.scrape({
      actor: 'unlocker.webunlocker',
      input: {
        url: 'https://www.nike.com/ca/launch?s=upcoming',
        type: '',
        redirect: false,
        method: 'GET',
        header: {
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
        }
      }
    });
    console.log('Universal scrape result:', result);
    expect(result).not.toBeNull();
  });
});
