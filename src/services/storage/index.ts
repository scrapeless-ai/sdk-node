/**
 * Storage services for Scrapeless Actor SDK
 * This module provides access to Dataset, Key-Value Store, Object Storage, and Queue Storage.
 */
import { BaseService } from '../base';
import { IStorageService } from '../../types';
import { DatasetStorage } from './dataset';
import { KVStorage } from './kv';
import { ObjectStorage } from './object';
import { QueueStorage } from './queue';
import { VectorStorage } from './vector';

/**
 * StorageService provides access to all Actor storage services
 */
export class StorageService extends BaseService implements IStorageService {
  /**
   * Dataset storage service for structured data
   */
  public readonly dataset: DatasetStorage;

  /**
   * Key-Value storage service for files and data records
   */
  public readonly kv: KVStorage;

  /**
   * Object storage service for files and binary data
   */
  public readonly object: ObjectStorage;

  /**
   * Queue storage service for task queues
   */
  public readonly queue: QueueStorage;

  /**
   * Vector storage service for vector stores
   */
  public readonly vector: VectorStorage;

  /**
   * Create a new StorageService instance
   * @param apiKey API key for authentication
   * @param baseUrl Base URL for the API
   * @param timeout Request timeout in milliseconds
   */
  constructor(apiKey: string, baseUrl: string, timeout: number) {
    super(apiKey, baseUrl, timeout);

    this.dataset = new DatasetStorage(apiKey, baseUrl, timeout);
    this.kv = new KVStorage(apiKey, baseUrl, timeout);
    this.object = new ObjectStorage(apiKey, baseUrl, timeout);
    this.queue = new QueueStorage(apiKey, baseUrl, timeout);
    this.vector = new VectorStorage(apiKey, baseUrl, timeout);
  }
}
