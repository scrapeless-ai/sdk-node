/**
 * Queue storage service for Actor
 * Provides a way to store and process tasks in a queue
 */
import { BaseService } from '../../base';
import {
  ICommonResponse,
  IPagination,
  IPaginationParams,
  IQueue,
  IQueueCreateParams,
  IQueueMessage,
  IQueuePushParams,
  IQueuePushResponse,
  IQueueStorage,
  IQueueUpdateParams
} from '../../../types';

/**
 * Queue storage service implementation
 */
export class QueueStorage extends BaseService implements IQueueStorage {
  private readonly basePath = '/api/v1/queue';

  /**
   * List all available queues
   * @param params Pagination parameters
   * @returns List of queues
   */
  async list(params: IPaginationParams): Promise<IPagination<IQueue>> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', params.page.toString());
    queryParams.append('pageSize', params.pageSize.toString());

    if (params.desc !== undefined) {
      queryParams.append('desc', params.desc ? '1' : '0');
    }

    return this.request<IPagination<IQueue>>(`${this.basePath}/queues?${queryParams.toString()}`);
  }

  /**
   * Create a new queue
   * @param data Queue creation parameters
   * @returns The created queue info
   */
  async create(data: IQueueCreateParams): Promise<Pick<IQueue, 'id' | 'name'>> {
    return this.request<Pick<IQueue, 'id' | 'name'>>(`${this.basePath}`, 'POST', data);
  }

  /**
   * Get a queue by name
   * @param name Name of the queue
   * @returns Queue information
   */
  async get(name: string, queueId?: string): Promise<IQueue> {
    const queryParams = new URLSearchParams();
    queryParams.append('name', name);
    queryParams.append('id', queueId || '');

    return this.request<IQueue>(`${this.basePath}?${queryParams.toString()}`);
  }

  /**
   * Update a queue
   * @param queueId ID of the queue to update
   * @param data Queue update parameters
   */
  async update(queueId: string, data: IQueueUpdateParams): Promise<null> {
    return await this.request(`${this.basePath}/${queueId}`, 'PUT', data);
  }

  /**
   * Delete a queue
   * @param queueId ID of the queue to delete
   * @returns Operation result
   */
  async delete(queueId: string): Promise<ICommonResponse> {
    return this.request<ICommonResponse>(`${this.basePath}/${queueId}`, 'DELETE');
  }

  /**
   * Push a message to a queue
   * @param queueId ID of the queue
   * @param params Message parameters
   * @returns Push response with message ID
   */
  async push(queueId: string, params: IQueuePushParams): Promise<IQueuePushResponse> {
    return this.request<IQueuePushResponse>(`${this.basePath}/${queueId}/push`, 'POST', params);
  }

  /**
   * Pull messages from a queue
   * @param queueId ID of the queue
   * @param limit The maximum number of records to be returned， max 100, min 1
   * @returns Array of queue messages
   */
  async pull(queueId: string, limit?: number): Promise<IQueueMessage[]> {
    if (limit) {
      const queryParams = new URLSearchParams();
      queryParams.append('limit', limit.toString());
      return this.request<IQueueMessage[]>(`${this.basePath}/${queueId}/pull?${queryParams.toString()}`);
    }
    return this.request<IQueueMessage[]>(`${this.basePath}/${queueId}/pull`);
  }

  /**
   * Acknowledge a message in a queue
   * @param queueId ID of the queue
   * @param msgId ID of the message to acknowledge
   * @returns Operation result
   */
  async ack(queueId: string, msgId: string): Promise<ICommonResponse> {
    return this.request<ICommonResponse>(`${this.basePath}/${queueId}/ack/${msgId}`, 'POST');
  }
}
