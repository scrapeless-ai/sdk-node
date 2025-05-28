import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScrapelessClient } from '../src';

const mockFetch = vi.fn();

describe('DeepSerpService', () => {
  let client: ScrapelessClient;

  beforeEach(() => {
    client = new ScrapelessClient({ apiKey: process.env.API_KEY });
    mockFetch.mockReset();
    vi.doMock('node-fetch', () => {
      return {
        default: (...args: any[]) => {
          return mockFetch(...args);
        }
      };
    });
  });

  it('should create task', async () => {
    const result = await client.deepserp.createTask({
      actor: 'scraper.google.search',
      input: { q: 'nike site:www.nike.com' }
    });
    console.log('Search result:', result);
    if (result.status === 201) {
      expect(result.data.taskId).not.toBeNull();
    } else {
      expect(result.data).not.toBeNull();
    }
  });

  it('should get task result', async () => {
    const result = await client.deepserp.getTaskResult('taskId');
    console.log('Products result:', result);
    expect(result.data).not.toBeNull();
  });

  it('should get scrape results', async () => {
    const result = await client.deepserp.scrape({
      actor: 'scraper.google.search',
      input: { q: 'nike site:www.nike.com' }
    });
    console.log('Local result:', result);
    expect(result).not.toBeNull();
  });
});
