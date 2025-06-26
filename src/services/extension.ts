import fs from 'node:fs';
import FormData from 'form-data';
import { BaseService } from './base';

import { BrowserExtension, UploadExtensionResponse, ExtensionDetail, ExtensionListItem } from '../types';

export class ExtensionService extends BaseService implements BrowserExtension {
  constructor(apiKey: string, baseUrl: string, timeout: number) {
    super(apiKey, baseUrl, timeout);
  }

  /**
   * Validates the file path and extracts the file name.
   * @param filePath The path to the file.
   * @returns The extracted file name.
   * @throws Error if the file suffix is not valid.
   */
  private getFileName(filePath: string): string {
    const validSuffixes = ['.zip'];
    const fileSuffix = filePath.slice(filePath.lastIndexOf('.')).toLowerCase();
    if (!validSuffixes.includes(fileSuffix)) {
      throw new Error(`Invalid file suffix: ${fileSuffix}. Supported suffixes: ${validSuffixes.join(', ')}`);
    }

    return filePath.slice(filePath.lastIndexOf('/') + 1);
  }

  async upload(filePath: string, name: string): Promise<UploadExtensionResponse> {
    const fileName = this.getFileName(filePath);
    const fileStream = fs.createReadStream(filePath);

    const formData = new FormData();
    formData.append('file', fileStream, fileName);
    formData.append('name', name);

    const res = await this.request<UploadExtensionResponse, true>(
      '/browser/extensions/upload',
      'POST',
      formData,
      formData.getHeaders(),
      true
    );

    return res.data;
  }

  async update(extensionId: string, filePath: string, name?: string): Promise<{ success: boolean }> {
    const fileName = this.getFileName(filePath);
    const fileStream = fs.createReadStream(filePath);

    const formData = new FormData();
    formData.append('file', fileStream, fileName);
    if (name) {
      formData.append('name', name);
    }

    const res = await this.request<{ success: boolean }, true>(
      `/browser/extensions/${extensionId}`,
      'PUT',
      formData,
      formData.getHeaders(),
      true
    );

    return res.data;
  }

  async get(extensionId: string): Promise<ExtensionDetail> {
    const res = await this.request<ExtensionDetail, true>(
      `/browser/extensions/${extensionId}`,
      'GET',
      undefined,
      {},
      true
    );

    return res.data;
  }

  async list(): Promise<ExtensionListItem[]> {
    const res = await this.request<ExtensionListItem[], true>('/browser/extensions/list', 'GET', undefined, {}, true);
    return res.data;
  }

  async delete(extensionId: string): Promise<{ success: boolean }> {
    const res = await this.request<{ success: boolean }, true>(
      `/browser/extensions/${extensionId}`,
      'DELETE',
      undefined,
      {},
      true
    );

    return res.data;
  }
}
