/**
 * Storage services for Scrapeless Actor SDK
 * This module provides access to Dataset, Key-Value Store, Object Storage, and Queue Storage.
 */
import { IStorageService } from '../../../types';
import { LocalDatasetStorage } from './dataset';
import { LocalKVStorage } from './kv';
import { LocalQueueStorage } from './queue';
import { LocalObjectStorage } from './object';

/**
 * StorageService provides access to all Actor storage services
 */
export class LocalStorageService implements IStorageService {
  /**
   * Dataset storage service for structured data
   */
  public readonly dataset: LocalDatasetStorage;

  /**
   * KV storage service for structured data
   */
  public readonly kv: LocalKVStorage;

  /**
   * Queue storage service for structured data
   */
  public readonly queue: LocalQueueStorage;

  /**
   * Object storage service for structured data
   */
  public readonly object: LocalObjectStorage;

  constructor() {
    this.dataset = new LocalDatasetStorage();
    this.kv = new LocalKVStorage();
    this.queue = new LocalQueueStorage();
    this.object = new LocalObjectStorage();
  }
}
