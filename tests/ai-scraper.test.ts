import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import nodeFetch from 'node-fetch';
import { ScrapelessClient, ScrapelessError } from '../src/client';

vi.mock('node-fetch', () => ({ default: vi.fn() }));

const mockFetch = vi.mocked(nodeFetch);

function respond(data: unknown, status = 200) {
  mockFetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    json: async () => data
  } as any);
}

describe('AI Scraper', () => {
  let client: ScrapelessClient;

  afterEach(() => vi.unstubAllEnvs());

  beforeEach(() => {
    vi.stubEnv('SCRAPELESS_IS_ONLINE', 'true');
    mockFetch.mockReset();
    client = new ScrapelessClient({ apiKey: 'test-key', baseApiUrl: 'https://api.example.com', timeout: 1234 });
  });

  it.each([undefined, { url: 'https://callback.example.com', extra: true }])(
    'forwards create parameters and the complete response with webhook %j',
    async webhook => {
      const request = {
        actor: 'scraper.future-model',
        input: { prompt: 'test', nested: { models: ['a', 'b'] } },
        ...(webhook ? { webhook } : {}),
        custom: 42
      };
      const response = { task_id: 'task-1', status: 'running', data: { retained: true }, extra: 42 };
      respond(response, 201);
      expect(await client.aiScraper.createTask(request)).toEqual(response);
      expect(mockFetch).toHaveBeenCalledExactlyOnceWith('https://api.example.com/api/v2/scraper/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': 'test-key', 'x-api-token': 'test-key' },
        timeout: 1234,
        body: JSON.stringify(request)
      });
    }
  );

  it.each([
    { status: 'running' },
    { status: 'success', task_result: { markdown: 'answer', citations: [{ url: 'https://example.com' }] } },
    { status: 'failed', message: 'Model unavailable' }
  ])('returns task status unchanged: $status', async response => {
    respond(response);
    expect(await client.aiScraper.getTaskResult('task /?#')).toEqual(response);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/api/v2/scraper/result/task%20%2F%3F%23',
      expect.objectContaining({ method: 'GET', headers: expect.objectContaining({ 'x-api-token': 'test-key' }) })
    );
    expect(mockFetch.mock.calls[0][1]).not.toHaveProperty('body');
  });

  it('preserves HTTP errors', async () => {
    respond({ message: 'Invalid token' }, 401);
    await expect(client.aiScraper.getTaskResult('task-1')).rejects.toBeInstanceOf(ScrapelessError);
  });

  it('keeps the v1 scraping contract and legacy services available', async () => {
    respond({ taskId: 'old-task' }, 201);
    expect(await client.scraping.createTask({ actor: 'scraper.google.search', input: { q: 'test' } })).toEqual({
      data: { taskId: 'old-task' },
      status: 201
    });
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/api/v1/scraper/request',
      expect.objectContaining({
        body: JSON.stringify({ actor: 'scraper.google.search', input: { q: 'test' }, async: true })
      })
    );
    expect(client.actor.run).toBeTypeOf('function');
    expect(client.storage).toBeDefined();
  });
});
