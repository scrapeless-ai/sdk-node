/**
 * Pagination interface for list operations
 */
export interface IPagination<T> {
  /**
   * Total number of items
   */
  total: number;

  /**
   * Total number of pages
   */
  totalPage: number;

  /**
   * Current page number
   */
  page: number;

  /**
   * Number of items per page
   */
  pageSize: number;

  /**
   * Items in the current page
   */
  items: T[];
}

/**
 * Parameters for pagination
 */
export interface IPaginationParams {
  /**
   * Page number (1-based)
   */
  page: number;

  /**
   * Number of items per page
   */
  pageSize: number;

  /**
   * Sort in descending order if true
   */
  desc?: boolean;
}

/**
 * Common response format for storage operations
 */
export interface IStorageCommonResponse {
  /**
   * Whether the operation was successful
   */
  success: boolean;

  /**
   * Message describing the result
   */
  message?: string;
}

/**
 * Simplified response with only success status
 */
export type ICommonResponse = Pick<IStorageCommonResponse, 'success'>;

/**
 * Dataset Types
 */

/**
 * Parameters for listing datasets
 */
export interface IDatasetListParams extends IPaginationParams {
  /**
   * Optional actor ID to filter datasets
   */
  actorId?: string;

  /**
   * Optional run ID to filter datasets
   */
  runId?: string;
}

/**
 * Dataset creation parameters
 */
export interface IDatasetCreateParams {
  /**
   * Name of the dataset
   */
  name: string;

  /**
   * Actor ID associated with the dataset
   */
  actorId?: string;

  /**
   * Run ID associated with the dataset
   */
  runId?: string;
}

/**
 * Dataset information
 */
export interface IDataset {
  /**
   * Unique identifier of the dataset
   */
  id: string;

  /**
   * Name of the dataset
   */
  name: string;

  /**
   * Actor ID associated with the dataset
   */
  actorId?: string;

  /**
   * Run ID associated with the dataset
   */
  runId?: string;

  /**
   * Fields in the dataset
   */
  fields: string[] | null;

  /**
   * Creation timestamp
   */
  createdAt: Date;

  /**
   * Last update timestamp
   */
  updatedAt: Date;

  /**
   * Dataset statistics
   */
  stats: {
    /**
     * Total number of items
     */
    count: number;

    /**
     * Total size of the dataset in bytes
     */
    size: number;
  };
}

/**
 * Dataset storage service interface
 */
export interface IDatasetStorage {
  /**
   * List all available datasets
   * @param params Pagination and filtering parameters
   */
  listDatasets: (params: IDatasetListParams) => Promise<IPagination<IDataset>>;

  /**
   * Get dataset by id
   * @param datasetId Id of the dataset
   */
  getDataset: (datasetId: string) => Promise<IDataset>;

  /**
   * Create a new dataset
   * @param name Name of the dataset
   */
  createDataset: (name: string) => Promise<IDataset>;

  /**
   * Update an existing dataset
   * @param datasetId ID of the dataset to update
   * @param name New name for the dataset
   */
  updateDataset: (datasetId: string, name: string) => Promise<IDataset>;

  /**
   * Delete a dataset
   * @param datasetId ID of the dataset to delete
   */
  delDataset: (datasetId: string) => Promise<IStorageCommonResponse>;

  /**
   * Add items to a dataset
   * @param datasetId ID of the dataset to add items to
   * @param items Array of objects to add
   */
  addItems: <T extends object>(datasetId: string, items: Array<T>) => Promise<IStorageCommonResponse>;

  /**
   * Get items from a dataset
   * @param datasetId ID of the dataset to get items from
   * @param params Pagination parameters
   */
  getItems: <T>(datasetId: string, params: IPaginationParams) => Promise<IPagination<T>>;
}

/**
 * Key-Value Storage Types
 */

/**
 * KV namespace information
 */
export interface IKVNamespace {
  /**
   * Actor ID associated with the namespace
   */
  actorId: string;

  /**
   * Creation timestamp
   */
  createdAt: Date;

  /**
   * Unique identifier of the namespace
   */
  id: string;

  /**
   * Name of the namespace
   */
  name: string;

  /**
   * Run ID associated with the namespace
   */
  runId: string;

  /**
   * Last update timestamp
   */
  updatedAt: Date;

  /**
   * KV namespace statistics
   */
  stats: {
    /**
     * Total number of items
     */
    count: number;

    /**
     * Total size of the namespace in bytes
     */
    size: number;
  };
}

/**
 * KV namespace creation parameters
 */
export interface IKVNamespaceCreateParams {
  /**
   * Name of the namespace
   */
  name: string;

  /**
   * Actor ID associated with the namespace
   */
  actorId?: string;

  /**
   * Run ID associated with the namespace
   */
  runId?: string;
}

/**
 * Key-value item information
 */
export interface IKVItem {
  /**
   * Key of the item
   */
  key: string;

  /**
   * Size of the value in bytes
   */
  size: number;
}

/**
 * Key item information
 */
export interface IKVKey {
  /**
   * Namespace ID
   */
  namespaceId: string;

  /**
   *  Key name
   */
  key: string;

  /**
   * Value associated with the key
   */
  value: string;

  /**
   * Expiration time in seconds; 0 means never expires
   */
  expiration?: number;

  /**
   * Size of the value in bytes
   */
  size: number;

  /**
   * Exact expiration time as a Date object
   */
  expireAt: Date;
}

/**
 * KV data item
 */
export interface IKVValueData {
  /**
   * Key of the item
   */
  key: string;

  /**
   * Value as string
   */
  value: string;

  /**
   * Optional expiration time in seconds
   */
  expiration?: number;
}

/**
 * Key-Value storage service interface
 */
export interface IKVStorage {
  /**
   * List all available namespaces
   * @param params Pagination parameters
   */
  listNamespaces: (params: IPaginationParams) => Promise<IPagination<IKVNamespace>>;

  /**
   * Create a new namespace
   * @param name Name of the namespace
   */
  createNamespace: (name: string) => Promise<IKVNamespace>;

  /**
   * Get a namespace by ID
   * @param namespaceId ID of the namespace
   */
  getNamespace: (namespaceId: string) => Promise<IKVNamespace>;

  /**
   * Delete a namespace
   * @param namespaceId ID of the namespace to delete
   */
  delNamespace: (namespaceId: string) => Promise<ICommonResponse>;

  /**
   * Rename a namespace
   * @param namespaceId ID of the namespace to rename
   * @param name New name for the namespace
   */
  renameNamespace: (namespaceId: string, name: string) => Promise<ICommonResponse>;

  /**
   * List keys in a namespace
   * @param namespaceId ID of the namespace to list keys from
   * @param params Pagination parameters
   */
  listKeys: (namespaceId: string, params: Omit<IPaginationParams, 'desc'>) => Promise<IPagination<IKVItem>>;

  /**
   * Delete a value from a namespace
   * @param namespaceId ID of the namespace
   * @param key Key to delete
   */
  delValue: (namespaceId: string, key: string) => Promise<ICommonResponse>;

  /**
   * Bulk set multiple key-value pairs in a namespace
   * @param namespaceId ID of the namespace
   * @param data Array of key-value data
   */
  bulkSetValue: (namespaceId: string, data: IKVValueData[]) => Promise<IBulkSetValueResponse>;

  /**
   * Bulk delete multiple keys from a namespace
   * @param namespaceId ID of the namespace
   * @param keys Array of keys to delete
   */
  bulkDelValue: (namespaceId: string, keys: string[]) => Promise<ICommonResponse>;

  /**
   * Set a key-value pair in a namespace
   * @param namespaceId ID of the namespace
   * @param data Key-value data
   */
  setValue: (namespaceId: string, data: IKVValueData) => Promise<ICommonResponse>;

  /**
   * Get a value by key from a namespace
   * @param namespaceId ID of the namespace
   * @param key Key to retrieve
   */
  getValue: (namespaceId: string, key: string) => Promise<string>;
}

/**
 * Object Storage Types
 */

/**
 * Object bucket information
 */
export interface IObjectBucket {
  /**
   * Actor ID associated with the bucket
   */
  actorId: string;

  /**
   * Creation timestamp
   */
  createdAt: Date;

  /**
   * Description of the bucket
   */
  description: string;

  /**
   * Unique identifier of the bucket
   */
  id: string;

  /**
   * Name of the bucket
   */
  name: string;

  /**
   * Run ID associated with the bucket
   */
  runId: string;

  /**
   * Total size of the bucket in bytes
   */
  size: number;

  /**
   * Last update timestamp
   */
  updatedAt: Date;
}

/**
 * Parameters for listing object buckets
 */
export interface IObjectListParams extends IPaginationParams {
  /**
   * Actor ID to filter buckets
   */
  actor?: string;

  /**
   * Run ID to filter buckets
   */
  runId?: string;
}

/**
 * Parameters for listing objects in a bucket
 */
export interface IObjectPaginationParams extends Omit<IPaginationParams, 'desc'> {
  /**
   * Search term to filter objects
   */
  search?: string;
}

/**
 * Object bucket creation parameters
 */
export interface IObjectCreateParams {
  /**
   * Name of the bucket
   */
  name: string;

  /**
   * Optional description of the bucket
   */
  description?: string;
}

/**
 * Object item information
 */
export interface IObjectItem {
  /**
   * Actor ID associated with the object
   */
  actorId: string;

  /**
   * Bucket ID containing the object
   */
  bucketId: string;

  /**
   * Creation timestamp
   */
  createdAt: Date;

  /**
   * File type/MIME type
   */
  fileType: string;

  /**
   * Filename
   */
  filename: string;

  /**
   * Unique identifier of the object
   */
  id: string;

  /**
   * Path to the object
   */
  path: string;

  /**
   * Run ID associated with the object
   */
  runId: string;

  /**
   * Size of the object in bytes
   */
  size: number;

  /**
   * Last update timestamp
   */
  updatedAt: Date;
}

/**
 * Parameters for uploading an object
 */
export interface IObjectUploadParams {
  /**
   * Path to the file to upload
   */
  file: string;

  /**
   * Optional actor ID to associate with the object
   */
  actorId?: string;

  /**
   * Optional run ID to associate with the object
   */
  runId?: string;
}

/**
 * Response from object upload operation
 */
export interface IObjectUploadResponse extends ICommonResponse {
  /**
   * Size of the uploaded object in bytes
   */
  size: number;

  /**
   * Object ID of the uploaded file
   */
  object_id: string;
}

/**
 * Custom pagination response for object buckets
 */
export type IObjectBucketsPagination<T> = Omit<IPagination<T>, 'items'> & {
  /**
   * Buckets in the current page
   */
  buckets: T[];
};

/**
 * Custom pagination response for objects
 */
export type IObjectObjectsPagination<T> = Omit<IPagination<T>, 'items'> & {
  /**
   * Objects in the current page
   */
  objects: T[];
};

/**
 * Object storage service interface
 */
export interface IObjectStorage {
  /**
   * List all available buckets
   * @param params Pagination and filtering parameters
   */
  listBuckets: (params: IObjectListParams) => Promise<IObjectBucketsPagination<IObjectBucket>>;

  /**
   * Create a new bucket
   * @param data Bucket creation parameters
   */
  createBucket: (data: IObjectCreateParams) => Promise<IObjectBucket>;

  /**
   * Delete a bucket
   * @param bucketId ID of the bucket to delete
   */
  deleteBucket: (bucketId: string) => Promise<ICommonResponse>;

  /**
   * Get information about a bucket
   * @param bucketId ID of the bucket
   */
  getBucket: (bucketId: string) => Promise<IObjectBucket>;

  /**
   * List objects in a bucket
   * @param bucketId ID of the bucket
   * @param params Pagination and search parameters
   */
  list: (bucketId: string, params: IObjectPaginationParams) => Promise<IObjectObjectsPagination<IObjectItem>>;

  /**
   * Get an object by ID
   * @param bucketId ID of the bucket
   * @param objectId ID of the object to retrieve
   */
  get: (bucketId: string, objectId: string) => Promise<Blob>;

  /**
   * Upload an object to a bucket
   * @param bucketId ID of the bucket
   * @param data Upload parameters
   */
  put: (bucketId: string, data: IObjectUploadParams) => Promise<IObjectUploadResponse>;

  /**
   * Delete an object from a bucket
   * @param bucketId ID of the bucket
   * @param objectId ID of the object to delete
   */
  delete: (bucketId: string, objectId: string) => Promise<ICommonResponse>;
}

/**
 * Queue Storage Types
 */

/**
 * Queue information
 */
export interface IQueue {
  /**
   * Actor ID associated with the queue
   */
  actorId: string;

  /**
   * Creation timestamp
   */
  createdAt: Date;

  /**
   * Description of the queue
   */
  description: string;

  /**
   * Unique identifier of the queue
   */
  id: string;

  /**
   * Name of the queue
   */
  name: string;

  /**
   * Run ID associated with the queue
   */
  runId: string;

  /**
   * Queue statistics
   */
  stats: {
    /**
     * Number of failed messages
     */
    failed: number;

    /**
     * Number of pending messages
     */
    pending: number;

    /**
     * Number of running messages
     */
    running: number;

    /**
     * Number of successful messages
     */
    success: number;
  };

  /**
   * Team ID associated with the queue
   */
  teamId: string;

  /**
   * Last update timestamp
   */
  updatedAt: Date;
}

/**
 * Queue message information
 */
export interface IQueueMessage {
  /**
   * Message deadline timestamp
   */
  deadline: number;

  /**
   * Message description
   */
  desc: string;

  /**
   * Timestamp when the message failed
   */
  failedAt: number;

  /**
   * Unique identifier of the message
   */
  id: string;

  /**
   * Name of the message
   */
  name: string;

  /**
   * Message payload
   */
  payload: string;

  /**
   * Queue ID containing the message
   */
  queueId: string;

  /**
   * Number of retries
   */
  retried: number;

  /**
   * Maximum retry count
   */
  retry: number;

  /**
   * Timestamp when the message succeeded
   */
  successAt: Date;

  /**
   * Message timeout
   */
  timeout: number;
}

/**
 * Queue creation parameters
 */
export interface IQueueCreateParams {
  /**
   * Name of the queue
   */
  name: string;

  /**
   * Optional description of the queue
   */
  description?: string;

  runId: string;
  actorId: string;
}

/**
 * Queue update parameters
 */
export interface IQueueUpdateParams {
  /**
   * Name of the queue
   */
  name: string;

  /**
   * Optional description of the queue
   */
  description?: string;
}

/**
 * Parameters for pushing a message to the queue
 */
export interface IQueuePushParams {
  /**
   * Name of the message
   */
  name: string;

  /**
   * Message payload
   */
  payload: string;

  /**
   * Maximum retry count
   */
  retry: number;

  /**
   * Message timeout
   */
  timeout: number;

  /**
   * Message deadline
   */
  deadline: number;
}

/**
 * Response from pushing a message to the queue
 */
export interface IQueuePushResponse {
  /**
   * ID of the created message
   */
  msgId: string;
}

/**
 * Queue storage service interface
 */
export interface IQueueStorage {
  /**
   * List all available queues
   * @param params Pagination parameters
   */
  list: (params: IPaginationParams) => Promise<IPagination<IQueue>>;

  /**
   * Create a new queue
   * @param data Queue creation parameters
   */
  create: (data: IQueueCreateParams) => Promise<Pick<IQueue, 'id' | 'name'>>;

  /**
   * Get a queue by name
   * @param name Name of the queue
   * @param queueId optional, ID of the queue to update
   */
  get: (name: string, queueId?: string) => Promise<IQueue>;

  /**
   * Update a queue
   * @param queueId ID of the queue to update
   * @param data Queue update parameters
   */
  update: (queueId: string, data: IQueueUpdateParams) => Promise<null>;

  /**
   * Delete a queue
   * @param queueId ID of the queue to delete
   */
  delete: (queueId: string) => Promise<ICommonResponse>;

  /**
   * Push a message to a queue
   * @param queueId ID of the queue
   * @param params Message parameters
   */
  push: (queueId: string, params: IQueuePushParams) => Promise<IQueuePushResponse>;

  /**
   * Pull messages from a queue
   * @param queueId ID of the queue
   * @param limit The maximum number of records to be returned， max 100, min 1
   */
  pull: (queueId: string, limit?: number) => Promise<IQueueMessage[]>;

  /**
   * Acknowledge a message in a queue
   * @param queueId ID of the queue
   * @param msgId ID of the message to acknowledge
   */
  ack: (queueId: string, msgId: string) => Promise<ICommonResponse>;
}

/**
 * Storage service interface combining all storage services
 */
export interface IStorageService {
  /**
   * Dataset storage service
   */
  dataset: IDatasetStorage;

  /**
   * Key-Value storage service
   */
  kv: IKVStorage;

  /**
   * Object storage service
   */
  object: IObjectStorage;

  /**
   * Queue storage service
   */
  queue: IQueueStorage;
}

export interface IBulkSetValueResponse {
  successfulKeyCount: number;
  unsuccessfulKeys: string[];
}
