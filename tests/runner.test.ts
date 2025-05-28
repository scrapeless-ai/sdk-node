import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RunnerService } from '../src/services/runner';

const mockFetch = vi.fn();

describe('RunnerService', () => {
  let runnerService: RunnerService;

  beforeEach(() => {
    runnerService = new RunnerService('test', 'https://api.scrapeless.com', 30000);
    mockFetch.mockReset();
  });

  it('should abort a running runner', async () => {
    // Set actorId first
    runnerService.setActorId('actor1');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
    const result = (await runnerService.abortRun('runner1', 'run1')) as { success: boolean };
    console.log('Abort runner result:', result);
    expect(result.success).toBe(true);
  });
});
