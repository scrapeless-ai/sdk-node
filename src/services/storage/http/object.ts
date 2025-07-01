/**
 * Object storage service for Actor
 * Provides a way to store and retrieve files and binary data
 */
import { BaseService } from '../../base';
import {
  ICommonResponse,
  IObjectBucket,
  IObjectBucketsPagination,
  IObjectCreateParams,
  IObjectItem,
  IObjectListParams,
  IObjectObjectsPagination,
  IObjectPaginationParams,
  IObjectStorage,
  IObjectUploadParams,
  IObjectUploadResponse
} from '../../../types';

/**
 * Object storage service implementation
 */
export class ObjectStorage extends BaseService implements IObjectStorage {
  private readonly basePath = '/api/v1/object';

  /**
   * List all available buckets
   * @param params Pagination and filtering parameters
   * @returns List of buckets
   */
  async listBuckets(params: IObjectListParams): Promise<IObjectBucketsPagination<IObjectBucket>> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', params.page.toString());
    queryParams.append('pageSize', params.pageSize.toString());

    if (params.desc !== undefined) {
      queryParams.append('desc', params.desc ? '1' : '0');
    }

    if (params.actor) {
      queryParams.append('actor', params.actor);
    }

    if (params.runId) {
      queryParams.append('runId', params.runId);
    }

    return this.request<IObjectBucketsPagination<IObjectBucket>>(`${this.basePath}/buckets?${queryParams.toString()}`);
  }

  /**
   * Create a new bucket
   * @param data Bucket creation parameters
   * @returns The created bucket
   */
  async createBucket(data: IObjectCreateParams): Promise<IObjectBucket> {
    return this.request<IObjectBucket>(`${this.basePath}/buckets`, 'POST', data);
  }

  /**
   * Delete a bucket
   * @param bucketId ID of the bucket to delete
   * @returns Operation result
   */
  async deleteBucket(bucketId: string): Promise<ICommonResponse> {
    return this.request<ICommonResponse>(`${this.basePath}/buckets/${bucketId}`, 'DELETE');
  }

  /**
   * Get information about a bucket
   * @param bucketId ID of the bucket
   * @returns Bucket information
   */
  async getBucket(bucketId: string): Promise<IObjectBucket> {
    return this.request<IObjectBucket>(`${this.basePath}/buckets/${bucketId}`);
  }

  /**
   * List objects in a bucket
   * @param bucketId ID of the bucket
   * @param params Pagination and search parameters
   * @returns List of objects
   */
  async list(bucketId: string, params: IObjectPaginationParams): Promise<IObjectObjectsPagination<IObjectItem>> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', params.page.toString());
    queryParams.append('pageSize', params.pageSize.toString());

    if (params.search !== undefined) {
      queryParams.append('search', params.search);
    }

    return this.request<IObjectObjectsPagination<IObjectItem>>(
      `${this.basePath}/buckets/${bucketId}/objects?${queryParams.toString()}`
    );
  }

  /**
   * Get an object by ID
   * @param bucketId ID of the bucket
   * @param objectId ID of the object to retrieve
   * @returns The object data as a Blob
   */
  async get(bucketId: string, objectId: string): Promise<Blob> {
    return this.request<Blob>(`${this.basePath}/buckets/${bucketId}/${objectId}`);
  }

  /**
   * Upload an object to a bucket
   * @param bucketId ID of the bucket
   * @param data Upload parameters
   * @returns Upload response
   */
  async put(bucketId: string, data: IObjectUploadParams): Promise<IObjectUploadResponse> {
    // Use FormData to handle file upload
    const formData = new FormData();
    formData.append('file', data.file);

    if (data.actorId) {
      formData.append('actorId', data.actorId);
    }

    if (data.runId) {
      formData.append('runId', data.runId);
    }

    return this.request<IObjectUploadResponse>(
      `${this.basePath}/buckets/${bucketId}/object`,
      'POST',
      formData,
      // Remove Content-Type header to let the browser set it with the correct boundary
      { 'Content-Type': undefined as any }
    );
  }

  /**
   * Delete an object from a bucket
   * @param bucketId ID of the bucket
   * @param objectId ID of the object to delete
   * @returns Operation result
   */
  async delete(bucketId: string, objectId: string): Promise<ICommonResponse> {
    return this.request<ICommonResponse>(`${this.basePath}/buckets/${bucketId}/${objectId}`, 'DELETE');
  }
}
