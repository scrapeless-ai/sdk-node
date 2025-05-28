import { BaseService } from './base';

/**
 * Runner service class for Actor executors
 */
export class RunnerService extends BaseService {
  /**
   * Associated Actor ID
   */
  private actorId: string | null = null;

  constructor(apiKey: string, baseUrl: string, timeout: number) {
    super(apiKey, baseUrl, timeout);
  }

  /**
   * Set the Actor ID for this service
   * @param actorId Actor ID
   */
  setActorId(actorId: string): void {
    this.actorId = actorId;
  }

  /**
   * Abort a running Runner
   * @param runnerId Runner ID
   * @param runId Run ID
   */
  async abortRun(runnerId: string, runId: string) {
    if (!this.actorId) {
      throw new Error('Actor ID not set, cannot abort Runner');
    }

    return this.request(`/actors/${this.actorId}/runners/${runnerId}/runs/${runId}`, 'DELETE');
  }
}
