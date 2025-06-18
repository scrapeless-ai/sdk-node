/**
 * Dataset storage service for Actor
 * Provides a way to store structured data and retrieve it
 */
import { BaseService } from '../base';
import {
  IDataset,
  IDatasetListParams,
  IDatasetStorage,
  IPagination,
  IPaginationParams,
  IStorageCommonResponse
} from '../../types';

/**
 * Dataset storage service implementation
 */
export class DatasetStorage extends BaseService implements IDatasetStorage {
  private readonly basePath = '/api/v1/dataset';

  /**
   * List all available datasets
   * @param params Pagination and filtering parameters
   * @returns List of datasets
   */
  async listDatasets(params: IDatasetListParams): Promise<IPagination<IDataset>> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', params.page.toString());
    queryParams.append('pageSize', params.pageSize.toString());

    if (params.desc !== undefined) {
      queryParams.append('desc', params.desc ? '1' : '0');
    }

    if (params.actorId) {
      queryParams.append('actorId', params.actorId);
    }

    if (params.runId) {
      queryParams.append('runId', params.runId);
    }

    return this.request<IPagination<IDataset>>(`${this.basePath}?${queryParams.toString()}`);
  }

  /**
   * Create a new dataset
   * @param name Name of the dataset
   * @returns The created dataset info
   */
  async createDataset(name: string): Promise<IDataset> {
    return this.request<IDataset>(`${this.basePath}`, 'POST', {
      name
    });
  }

  /**
   * Update an existing dataset
   * @param datasetId ID of the dataset to update
   * @param name New name for the dataset
   * @returns The updated dataset info
   */
  async updateDataset(datasetId: string, name: string): Promise<IDataset> {
    return this.request<IDataset>(`${this.basePath}/${datasetId}`, 'PUT', {
      name
    });
  }

  /**
   * Delete a dataset
   * @param datasetId ID of the dataset to delete
   * @returns Operation result
   */
  async delDataset(datasetId: string): Promise<IStorageCommonResponse> {
    return this.request<IStorageCommonResponse>(`${this.basePath}/${datasetId}`, 'DELETE');
  }

  /**
   * Add items to a dataset
   * @param datasetId ID of the dataset to add items to
   * @param items Array of objects to add
   * @returns Operation result
   */
  async addItems<T extends object>(datasetId: string, items: Array<T>): Promise<IStorageCommonResponse> {
    return this.request<IStorageCommonResponse>(`${this.basePath}/${datasetId}/items`, 'POST', {
      items
    });
  }

  /**
   * Get items from a dataset
   * @param datasetId ID of the dataset to get items from
   * @param params Pagination parameters
   * @returns Paginated list of items
   */
  async getItems<T>(datasetId: string, params: IPaginationParams): Promise<IPagination<T>> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', params.page.toString());
    queryParams.append('pageSize', params.pageSize.toString());

    if (params.desc !== undefined) {
      queryParams.append('desc', params.desc ? '1' : '0');
    }

    return this.request<IPagination<T>>(`${this.basePath}/${datasetId}/items?${queryParams.toString()}`);
  }

  /**
   * Get dataset
   * @param datasetId ID of the dataset
   * @returns Dataset info
   */
  async getDataset(datasetId: string): Promise<IDataset> {
    return this.request<IDataset>(`${this.basePath}/${datasetId}`);
  }
}
