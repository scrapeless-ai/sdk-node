import { BaseService } from './base';
import { IRunActorData, IPaginationParams } from '../types';

/**
 * Actor service class for interacting with the Scrapeless Actor API
 */
export class ActorService extends BaseService {
  private readonly basePath = '/api/v1/actors';

  constructor(apiKey: string, baseUrl: string, timeout: number) {
    super(apiKey, baseUrl, timeout);
  }

  /**
   * Run an Actor
   * @param actorId Actor ID
   * @param data Run request data
   */
  async run<T>(actorId: string, data: IRunActorData<T>) {
    return this.request(`${this.basePath}/${actorId}/runs`, 'POST', data);
  }

  /**
   * Get Actor run info
   * @param runId Run ID
   */
  async getRunInfo(runId: string) {
    return this.request(`${this.basePath}/runs/${runId}`);
  }

  /**
   * Abort a running Actor
   * @param actorId Actor ID
   * @param runId Run ID
   */
  async abortRun(actorId: string, runId: string) {
    return this.request(`${this.basePath}/${actorId}/runs/${runId}`, 'DELETE');
  }

  /**
   * Trigger a build for an Actor
   * @param actorId Actor ID
   */
  async build(actorId: string) {
    return this.request(`${this.basePath}/${actorId}/builds`, 'POST');
  }

  /**
   * Get Actor build status
   * @param actorId Actor ID
   * @param buildId Build ID
   */
  async getBuildStatus(actorId: string, buildId: string) {
    return this.request(`${this.basePath}/${actorId}/builds/${buildId}`);
  }

  /**
   * Abort an Actor build
   * @param actorId Actor ID
   * @param buildId Build ID
   */
  async abortBuild(actorId: string, buildId: string) {
    return this.request(`${this.basePath}/${actorId}/builds/${buildId}`, 'DELETE');
  }

  /**
   * Get a list of all Actor runs
   * @param params Pagination parameters
   */
  async getRunList(params: IPaginationParams) {
    const queryParams = new URLSearchParams();
    queryParams.append('page', params.page.toString());
    queryParams.append('pageSize', params.pageSize.toString());

    if (params.desc !== undefined) {
      queryParams.append('desc', params.desc ? '1' : '0');
    }
    return this.request(`${this.basePath}/runs?${queryParams.toString()}`);
  }
}
