import { StorageService, CaptchaService, BrowserService, ProxiesService, RunnerService } from '../services';
import {
  IPaginationParams,
  IKVValueData,
  IQueuePushParams,
  IObjectUploadParams,
  IDatasetListParams,
  IObjectListParams,
  IObjectCreateParams,
  IQueueCreateParams,
  IQueueUpdateParams
} from '../types';
import { getEnv, getEnvWithDefault } from '../env';

/**
 * High-level Actor class that integrates various Scrapeless services
 */
export class Actor {
  /**
   * Storage service for datasets, key-value stores, objects, and queues
   */
  storage: StorageService;

  /**
   * Captcha service for solving captchas
   */
  captcha: CaptchaService;

  /**
   * Browser service for web automation
   */
  browser: BrowserService;

  /**
   * Proxies service for proxy management
   */
  proxy: ProxiesService;

  /**
   * Runner service for actor execution
   */
  runner: RunnerService;

  datasetId: string;
  namespaceId: string;
  bucketId: string;
  queueId: string;

  constructor() {
    // Get API key from environment
    const timeout = 30_000;
    const apiKey = getEnv('SCRAPELESS_API_KEY');
    const baseApiURL = getEnvWithDefault('SCRAPELESS_BASE_API_URL', 'https://api.scrapeless.com');
    const actorURL = getEnvWithDefault('SCRAPELESS_ACTOR_API_URL', 'https://actor.scrapeless.com');
    const storageURL = getEnvWithDefault('SCRAPELESS_STORAGE_API_URL', 'https://storage.scrapeless.com');
    const browserURL = getEnvWithDefault('SCRAPELESS_BROWSER_API_URL', 'https://browser.scrapeless.com');

    this.datasetId = getEnv('SCRAPELESS_DATASET_ID');
    this.namespaceId = getEnv('SCRAPELESS_KV_NAMESPACE_ID');
    this.bucketId = getEnv('SCRAPELESS_BUCKET_ID');
    this.queueId = getEnv('SCRAPELESS_QUEUE_ID');

    // Initialize all services
    this.runner = new RunnerService(apiKey, actorURL, timeout);
    this.storage = new StorageService(apiKey, storageURL, timeout);
    this.browser = new BrowserService(apiKey, browserURL, timeout);
    this.captcha = new CaptchaService(apiKey, baseApiURL, timeout);
    this.proxy = new ProxiesService(apiKey, baseApiURL, timeout);
  }

  /**
   * Get actor input data from environment variable
   * @returns Actor input data parsed from environment variable
   */
  input<T = any>(): T {
    const inputStr = getEnv('SCRAPELESS_INPUT');
    try {
      return JSON.parse(inputStr) as T;
    } catch (e) {
      return inputStr as unknown as T;
    }
  }

  /**
   * Dataset convenience methods with environment variables
   */

  /**
   * List all available datasets
   * @param params Pagination and filtering parameters
   * @returns List of datasets
   */
  async listDatasets(params: IDatasetListParams) {
    return await this.storage.dataset.listDatasets(params);
  }

  /**
   * Add items to the default dataset (from environment variable)
   * @param items Array of objects to add
   * @returns Operation result
   */
  async addItems<T extends object>(items: Array<T>) {
    return await this.storage.dataset.addItems(this.datasetId, items);
  }

  /**
   * Get items from the default dataset (from environment variable)
   * @param params Pagination parameters
   * @returns Paginated list of items
   */
  async getItems<T>(params: IPaginationParams) {
    return await this.storage.dataset.getItems<T>(this.datasetId, params);
  }

  /**
   * Update an existing dataset
   * @param name New name for the dataset
   * @returns The updated dataset info
   */
  async updateDateset(name: string) {
    return await this.storage.dataset.updateDataset(this.datasetId, name);
  }

  /**
   * Delete a dataset
   * @returns Operation result
   */
  async deleteDataset() {
    return await this.storage.dataset.delDataset(this.datasetId);
  }

  /**
   * KV store convenience methods with environment variables
   */

  /**
   * List all available namespaces
   * @param params Pagination parameters
   * @returns List of namespaces
   */
  async listNamespaces(params: IPaginationParams) {
    return await this.storage.kv.listNamespaces(params);
  }

  /**
   * Create a new namespace
   * @param name Name of the namespace
   * @returns The created namespace
   */
  async createNamespace(name: string) {
    return await this.storage.kv.createNamespace(name);
  }

  /**
   * Get a namespace by ID
   * @returns Namespace information
   */
  async getNamespace() {
    return await this.storage.kv.getNamespace(this.namespaceId);
  }

  /**
   * Delete a namespace
   * @returns Operation result
   */
  async deleteNamespace() {
    return await this.storage.kv.delNamespace(this.namespaceId);
  }

  /**
   * Rename a namespace
   * @param name New name for the namespace
   * @returns Updated namespace
   */
  async renameNamespace(name: string) {
    return await this.storage.kv.renameNamespace(this.namespaceId, name);
  }

  /**
   * List keys in a namespace
   * @param params Pagination parameters
   * @returns List of keys
   */
  async listKeys(params: Omit<IPaginationParams, 'desc'>) {
    return await this.storage.kv.listKeys(this.namespaceId, params);
  }

  /**
   * Delete a value from a namespace
   * @param key Key to delete
   * @returns Operation result
   */
  async deleteValue(key: string) {
    return await this.storage.kv.delValue(this.namespaceId, key);
  }

  /**
   * Bulk set multiple key-value pairs in a namespace
   * @param data Array of key-value data
   * @returns Operation result
   */
  async bulkSetValue(data: IKVValueData[]) {
    return await this.storage.kv.bulkSetValue(this.namespaceId, data);
  }

  /**
   * Bulk delete multiple keys from a namespace
   * @param keys Array of keys to delete
   * @returns Operation result
   */
  async bulkDelValue(keys: string[]) {
    return await this.storage.kv.bulkDelValue(this.namespaceId, keys);
  }

  /**
   * Set a key-value pair in the default namespace (from environment variable)
   * @param data Key-value data
   * @returns Operation result
   */
  async setValue(data: IKVValueData) {
    return await this.storage.kv.setValue(this.namespaceId, data);
  }

  /**
   * Get a value by key from the default namespace (from environment variable)
   * @param key Key to get value for
   * @returns The value
   */
  async getValue(key: string) {
    return await this.storage.kv.getValue(this.namespaceId, key);
  }

  /**
   * Object storage convenience methods with environment variables
   */

  /**
   * List all available buckets
   * @param params Pagination and filtering parameters
   * @returns List of buckets
   */
  async listBuckets(params: IObjectListParams) {
    return await this.storage.object.listBuckets(params);
  }

  /**
   * Create a new bucket
   * @param data Bucket creation parameters
   * @returns The created bucket
   */
  async createBucket(data: IObjectCreateParams) {
    return await this.storage.object.createBucket(data);
  }

  /**
   * Delete a bucket
   * @returns Operation result
   */
  async deleteBucket() {
    return await this.storage.object.deleteBucket(this.bucketId);
  }

  /**
   * Get information about a bucket
   * @returns Bucket information
   */
  async getBucket() {
    return await this.storage.object.getBucket(this.bucketId);
  }

  /**
   * List objects in a bucket
   * @param params Pagination and search parameters
   * @returns List of objects
   */
  async list(params: IObjectListParams) {
    return await this.storage.object.list(this.bucketId, params);
  }

  /**
   * Get an object from the default bucket (from environment variable)
   * @param objectId ID of the object to get
   * @returns The object data
   */
  async getObject(objectId: string) {
    return await this.storage.object.get(this.bucketId, objectId);
  }

  /**
   * Upload an object to the default bucket (from environment variable)
   * @param data Upload parameters
   * @returns Upload result
   */
  async putObject(data: IObjectUploadParams) {
    return await this.storage.object.put(this.bucketId, data);
  }

  /**
   * Delete an object from a bucket
   * @param objectId ID of the object to delete
   * @returns Operation result
   */
  async deleteObject(objectId: string) {
    return await this.storage.object.delete(this.bucketId, objectId);
  }

  /**
   * Queue convenience methods with environment variables
   */

  /**
   * List all available queues
   * @param params Pagination parameters
   * @returns List of queues
   */
  async listQueues(params: IPaginationParams) {
    return await this.storage.queue.list(params);
  }

  /**
   * Create a new queue
   * @param data Queue creation parameters
   * @returns The created queue info
   */
  async createQueue(data: IQueueCreateParams) {
    return await this.storage.queue.create(data);
  }

  /**
   * Get a queue by name
   * @param name Name of the queue
   * @returns Queue information
   */
  async getQueue(name: string) {
    return await this.storage.queue.get(name, this.queueId);
  }

  /**
   * Update a queue
   * @param data Queue update parameters
   */
  async updateQueue(data: IQueueUpdateParams) {
    return await this.storage.queue.update(this.queueId, data);
  }

  /**
   * Delete a queue
   * @returns Operation result
   */
  async deleteQueue() {
    return await this.storage.queue.delete(this.queueId);
  }

  /**
   * Push a message to the default queue (from environment variable)
   * @param data Message data
   * @returns Push result
   */
  async pushMessage(data: IQueuePushParams) {
    return await this.storage.queue.push(this.queueId, data);
  }

  /**
   * Pull a message from the default queue (from environment variable)
   * @returns The pulled message
   */
  async pullMessage(limit?: number) {
    return await this.storage.queue.pull(this.queueId, limit);
  }

  /**
   * Acknowledge a message in the default queue (from environment variable)
   * @param msgId ID of the message to acknowledge
   * @returns Operation result
   */
  async ackMessage(msgId: string) {
    return await this.storage.queue.ack(this.queueId, msgId);
  }
}
