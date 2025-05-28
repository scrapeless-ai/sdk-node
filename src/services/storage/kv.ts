/**
 * Key-Value storage service for Actor
 * Provides a way to store and retrieve named values
 */
import { BaseService } from '../base';
import {
  ICommonResponse,
  IKVItem,
  IKVNamespace,
  IKVStorage,
  IKVValueData,
  IPagination,
  IPaginationParams,
  IBulkSetValueResponse
} from '../../types';

/**
 * Key-Value storage service implementation
 */
export class KVStorage extends BaseService implements IKVStorage {
  private readonly basePath = '/api/v1/kv';

  /**
   * List all available namespaces
   * @param params Pagination parameters
   * @returns List of namespaces
   */
  async listNamespaces(params: IPaginationParams): Promise<IPagination<IKVNamespace>> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', params.page.toString());
    queryParams.append('pageSize', params.pageSize.toString());

    if (params.desc !== undefined) {
      queryParams.append('desc', params.desc ? '1' : '0');
    }

    return this.request<IPagination<IKVNamespace>>(`${this.basePath}/namespaces?${queryParams.toString()}`);
  }

  /**
   * Create a new namespace
   * @param name Name of the namespace
   * @returns The created namespace
   */
  async createNamespace(name: string): Promise<IKVNamespace> {
    return this.request<IKVNamespace>(`${this.basePath}/namespaces`, 'POST', {
      name
    });
  }

  /**
   * Get a namespace by ID
   * @param namespaceId ID of the namespace
   * @returns Namespace information
   */
  async getNamespace(namespaceId: string): Promise<IKVNamespace> {
    return this.request<IKVNamespace>(`${this.basePath}/${namespaceId}`);
  }

  /**
   * Delete a namespace
   * @param namespaceId ID of the namespace to delete
   * @returns Operation result
   */
  async delNamespace(namespaceId: string): Promise<ICommonResponse> {
    return this.request<ICommonResponse>(`${this.basePath}/${namespaceId}`, 'DELETE');
  }

  /**
   * Rename a namespace
   * @param namespaceId ID of the namespace to rename
   * @param name New name for the namespace
   * @returns Updated namespace
   */
  async renameNamespace(namespaceId: string, name: string): Promise<ICommonResponse> {
    return this.request<ICommonResponse>(`${this.basePath}/${namespaceId}/rename`, 'PUT', { name });
  }

  /**
   * List keys in a namespace
   * @param namespaceId ID of the namespace to list keys from
   * @param params Pagination parameters
   * @returns List of keys
   */
  async listKeys(namespaceId: string, params: Omit<IPaginationParams, 'desc'>): Promise<IPagination<IKVItem>> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', params.page.toString());
    queryParams.append('pageSize', params.pageSize.toString());

    return this.request<IPagination<IKVItem>>(`${this.basePath}/${namespaceId}/keys?${queryParams.toString()}`);
  }

  /**
   * Delete a value from a namespace
   * @param namespaceId ID of the namespace
   * @param key Key to delete
   * @returns Operation result
   */
  async delValue(namespaceId: string, key: string): Promise<ICommonResponse> {
    return this.request<ICommonResponse>(`${this.basePath}/${namespaceId}/${key}`, 'DELETE');
  }

  /**
   * Bulk set multiple key-value pairs in a namespace
   * @param namespaceId ID of the namespace
   * @param data Array of key-value data
   * @returns Operation result
   */
  async bulkSetValue(namespaceId: string, data: IKVValueData[]): Promise<IBulkSetValueResponse> {
    return this.request<IBulkSetValueResponse>(`${this.basePath}/${namespaceId}/bulk`, 'POST', { Items: data });
  }

  /**
   * Bulk delete multiple keys from a namespace
   * @param namespaceId ID of the namespace
   * @param keys Array of keys to delete
   * @returns Operation result
   */
  async bulkDelValue(namespaceId: string, keys: string[]): Promise<ICommonResponse> {
    return this.request<ICommonResponse>(`${this.basePath}/${namespaceId}/bulk`, 'POST', { keys });
  }

  /**
   * Set a key-value pair in a namespace
   * @param namespaceId ID of the namespace
   * @param data Key-value data
   * @returns Operation result
   */
  async setValue(namespaceId: string, data: IKVValueData): Promise<ICommonResponse> {
    return this.request<ICommonResponse>(`${this.basePath}/${namespaceId}/key`, 'PUT', {
      key: data.key,
      value: data.value,
      expiration: data.expiration
    });
  }

  /**
   * Get a value by key from a namespace
   * @param namespaceId ID of the namespace
   * @param key Key to retrieve
   * @returns The value as a string
   */
  async getValue(namespaceId: string, key: string): Promise<string> {
    return this.request<string>(`${this.basePath}/${namespaceId}/${key}`);
  }
}
