import { BaseService } from '../base';
import {
  IPagination,
  IVectorListParams,
  IVectorStorage,
  ICollection,
  ICreateCollectionParams,
  ICreateDocParams,
  IDocOpResponse,
  IUpdateDocParams,
  IQueryVectorParams,
  IDoc
} from '../../types';

/**
 * Vector storage service implementation
 */
export class VectorStorage extends BaseService implements IVectorStorage {
  private readonly basePath = '/api/v1/vector';

  /**
   * List all available vector collections.
   * @param params Pagination and filter parameters.
   * @returns A promise resolving to a paginated list of collections.
   */
  async listCollections(params: IVectorListParams): Promise<IPagination<ICollection>> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', params.page.toString());
    queryParams.append('pageSize', params.pageSize.toString());
    if (params.desc !== undefined) {
      queryParams.append('desc', params.desc ? '1' : '0');
    }
    return this.request<IPagination<ICollection>>(`${this.basePath}?${queryParams.toString()}`);
  }

  /**
   * Create a new vector collection.
   * @param data Collection creation parameters.
   * @returns A promise resolving to the created collection.
   */
  async createCollection(data: ICreateCollectionParams): Promise<ICollection> {
    return this.request<ICollection>(`${this.basePath}`, 'POST', data);
  }

  /**
   * Update an existing collection's name and description.
   * @param id Collection ID.
   * @param name New name for the collection.
   * @param description Optional new description for the collection.
   * @returns A promise resolving to null on success.
   */
  async updateCollection(id: string, name: string, description?: string): Promise<null> {
    return this.request<null>(`${this.basePath}/${id}`, 'PUT', { name, description });
  }

  /**
   * Delete a collection by its ID.
   * @param id Collection ID.
   * @returns A promise resolving to null on success.
   */
  async delCollection(id: string): Promise<null> {
    return this.request<null>(`${this.basePath}/${id}`, 'DELETE');
  }

  /**
   * Get a collection by its ID.
   * @param id Collection ID.
   * @returns A promise resolving to the collection.
   */
  async getCollection(id: string): Promise<ICollection> {
    return this.request<ICollection>(`${this.basePath}/${id}`);
  }

  /**
   * Create multiple documents in a collection.
   * @param collectionId Collection ID.
   * @param docs Array of document creation parameters.
   * @returns A promise resolving to the document operation response.
   */
  async createDocs(collectionId: string, docs: Array<ICreateDocParams>): Promise<IDocOpResponse> {
    return this.request<IDocOpResponse>(`${this.basePath}/${collectionId}/docs`, 'POST', { docs });
  }

  /**
   * Update multiple documents in a collection.
   * @param collectionId Collection ID.
   * @param docs Array of document update parameters.
   * @returns A promise resolving to the document operation response.
   */
  async updateDocs(collectionId: string, docs: Array<IUpdateDocParams>): Promise<IDocOpResponse> {
    return this.request<IDocOpResponse>(`${this.basePath}/${collectionId}/docs`, 'PUT', { docs });
  }

  /**
   * Upsert (create or update) multiple documents in a collection.
   * @param collectionId Collection ID.
   * @param docs Array of document update parameters.
   * @returns A promise resolving to the document operation response.
   */
  async upsertDocs(collectionId: string, docs: Array<IUpdateDocParams>): Promise<IDocOpResponse> {
    return this.request<IDocOpResponse>(`${this.basePath}/${collectionId}/docs/upsert`, 'POST', { docs });
  }

  /**
   * Delete multiple documents from a collection.
   * @param collectionId Collection ID.
   * @param ids Array of document IDs to delete.
   * @returns A promise resolving to the document operation response.
   */
  async delDocs(collectionId: string, ids: string[]): Promise<IDocOpResponse> {
    return this.request<IDocOpResponse>(`${this.basePath}/${collectionId}/docs`, 'DELETE', { ids });
  }

  /**
   * Query documents in a collection using vector search.
   * @param collectionId Collection ID.
   * @param params Query parameters.
   * @returns A promise resolving to an array of documents.
   */
  async queryDocs(collectionId: string, params: IQueryVectorParams): Promise<Array<IDoc>> {
    return this.request<Array<IDoc>>(`${this.basePath}/${collectionId}/docs/query`, 'POST', params);
  }

  /**
   * Query documents in a collection by their IDs.
   * @param collectionId Collection ID.
   * @param ids Array of document IDs.
   * @returns A promise resolving to a record of document IDs to documents.
   */
  async queryDocsByIds(collectionId: string, ids: string[]): Promise<Record<string, IDoc>> {
    const queryParams = new URLSearchParams();
    for (let i = 0; i < ids.length; i++) {
      queryParams.append('ids', ids[i]);
    }
    return this.request<Record<string, IDoc>>(`${this.basePath}/${collectionId}/docs?${queryParams.toString()}`);
  }
}
