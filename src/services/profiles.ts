import { BaseService } from './base';
import {
  ICreateProfileResponse,
  IProfileItem,
  IProfilePaginationParams,
  IDeleteProfileResponse,
  IProfilePaginationResponse
} from '../types';

export class ProfilesService extends BaseService {
  private readonly basePath = '/browser/profiles';
  constructor(apiKey: string, baseUrl: string, timeout: number) {
    super(apiKey, baseUrl, timeout);
  }

  async create(name: string): Promise<ICreateProfileResponse> {
    const response = await this.request<ICreateProfileResponse, true>(`${this.basePath}`, 'POST', { name }, {}, true);
    return response.data;
  }

  async delete(profileId: string): Promise<IDeleteProfileResponse> {
    const response = await this.request<IDeleteProfileResponse, true>(
      `${this.basePath}/${profileId}`,
      'DELETE',
      undefined,
      {},
      true
    );
    return response.data;
  }

  async get(profileId: string): Promise<IProfileItem> {
    const response = await this.request<IProfileItem, true>(
      `${this.basePath}/${profileId}`,
      'GET',
      undefined,
      {},
      true
    );
    return response.data;
  }

  async list(params: IProfilePaginationParams): Promise<IProfilePaginationResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', params.page.toString());
    queryParams.append('pageSize', params.pageSize.toString());

    if (params.name !== undefined) {
      queryParams.append('s', params.name);
    }
    const response = await this.request<IProfilePaginationResponse, true>(
      `${this.basePath}?${queryParams.toString()}`,
      'GET',
      undefined,
      {},
      true
    );
    return response.data;
  }
}
