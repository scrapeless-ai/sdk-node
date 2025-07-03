import fs from 'fs';
import path from 'path';
import { MemoryService } from '../../memory';
import { createDir } from '../../../utils/memory';
import {
  IDataset,
  IDatasetListParams,
  IDatasetStorage,
  IPagination,
  IPaginationParams,
  IStorageCommonResponse
} from '../../../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Dataset storage service implementation (local file system)
 */
export class LocalDatasetStorage extends MemoryService implements IDatasetStorage {
  private readonly datasetDir = 'datasets';

  /**
   * Constructor: ensure dataset directory exists
   */
  constructor() {
    super();
    createDir(this.datasetDir);
  }

  /**
   * List all datasets with pagination and optional sorting
   * @param params Pagination and sorting parameters
   */
  async listDatasets(params: IDatasetListParams): Promise<IPagination<IDataset>> {
    const dirPath = this.getStoragePath(this.datasetDir);
    let entries: fs.Dirent[];
    try {
      entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    } catch {
      return {
        items: [],
        total: 0,
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        totalPage: 0
      };
    }
    const allDatasets: IDataset[] = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const name = entry.name;
      const metaPath = path.join(dirPath, name, 'metadata.json');
      try {
        const file = await this.readFile(metaPath);
        const meta = JSON.parse(file);
        allDatasets.push(meta);
      } catch {
        continue;
      }
    }
    if (!params.desc) {
      allDatasets.sort((a, b) => {
        if (!a.createdAt && !b.createdAt) return 0;
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    }
    return this.paginateArray(allDatasets, params.page, params.pageSize);
  }

  /**
   * Get dataset metadata by datasetId
   * @param datasetId Dataset unique identifier
   */
  async getDataset(datasetId: string): Promise<IDataset> {
    if (!datasetId) {
      throw new Error('datasetId must not be empty');
    }
    const dirPath = this.getStoragePath(path.join(this.datasetDir, datasetId));
    const metaPath = path.join(dirPath, 'metadata.json');
    try {
      const file = await this.readFile(metaPath);
      return JSON.parse(file);
    } catch {
      throw new Error('Dataset not found');
    }
  }

  /**
   * Create a new dataset with a unique name
   * @param name Dataset name
   */
  async createDataset(name: string): Promise<IDataset> {
    if (!name) {
      throw new Error('name must not be empty');
    }
    const exist = await this.isNameExists(this.getStoragePath(this.datasetDir), name);
    if (exist) {
      throw new Error('The name of the dataset already exists');
    }
    const id = uuidv4();
    const dirPath = this.getStoragePath(path.join(this.datasetDir, id));
    await this.mkdir(dirPath);
    const now = new Date();
    const meta: IDataset = {
      id,
      name,
      createdAt: now,
      updatedAt: now,
      fields: [],
      stats: { count: 0, size: 0 }
    };
    const metaPath = path.join(dirPath, 'metadata.json');
    await this.writeJsonFile(metaPath, meta);
    return meta;
  }

  /**
   * Update dataset name by datasetId
   * @param datasetId Dataset unique identifier
   * @param name New dataset name
   */
  async updateDataset(datasetId: string, name: string): Promise<IDataset> {
    if (!datasetId) {
      throw new Error('datasetId must not be empty');
    }
    if (!name) {
      throw new Error('name must not be empty');
    }
    const dirPath = this.getStoragePath(path.join(this.datasetDir, datasetId));
    const metaPath = path.join(dirPath, 'metadata.json');
    let meta: IDataset;
    try {
      const file = await this.readFile(metaPath);
      meta = JSON.parse(file);
    } catch {
      throw new Error('Dataset not found');
    }
    meta.name = name;
    meta.updatedAt = new Date();
    await this.writeJsonFile(metaPath, meta);
    return meta;
  }

  /**
   * Delete a dataset by datasetId
   * @param datasetId Dataset unique identifier
   */
  async delDataset(datasetId: string): Promise<IStorageCommonResponse> {
    if (!datasetId) {
      throw new Error('datasetId must not be empty');
    }
    const dirPath = this.getStoragePath(path.join(this.datasetDir, datasetId));
    try {
      await this.rm(dirPath, { recursive: true, force: true });
      return { success: true, message: 'dataset deleted successfully' };
    } catch (e) {
      return { success: false, message: String(e) };
    }
  }

  /**
   * Add items to a dataset, auto-increment file names, update fields (deduplicated)
   * @param datasetId Dataset unique identifier
   * @param items Array of items to add
   */
  async addItems<T extends object>(datasetId: string, items: Array<T>): Promise<IStorageCommonResponse> {
    if (!datasetId) {
      throw new Error('datasetId must not be empty');
    }
    const dirPath = this.getStoragePath(path.join(this.datasetDir, datasetId));
    const metaPath = path.join(dirPath, 'metadata.json');
    let meta: any;
    try {
      const file = await this.readFile(metaPath);
      meta = JSON.parse(file);
    } catch {
      return { success: false, message: 'Dataset not found' };
    }
    // Get current max index
    const files = await fs.promises.readdir(dirPath);
    let maxIndex = 0;
    files.forEach(f => {
      if (/^\d{8}\.json$/.test(f)) {
        const idx = parseInt(f.slice(0, 8), 10);
        if (idx > maxIndex) maxIndex = idx;
      }
    });
    const fieldsSet = new Set<string>(meta.fields || []);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      Object.keys(item).forEach(key => fieldsSet.add(key));
      const index = maxIndex + i + 1;
      const fileName = `${index.toString().padStart(8, '0')}.json`;
      const filePath = path.join(dirPath, fileName);
      await this.writeJsonFile(filePath, item);
    }
    meta.fields = Array.from(fieldsSet);
    // Update metadata
    meta.updatedAt = new Date();
    meta.stats = meta.stats || { count: 0, size: 0 };
    meta.stats.count += items.length;
    await this.writeJsonFile(metaPath, meta);
    return { success: true, message: 'Items added' };
  }

  /**
   * Get items from a dataset with pagination
   * @param datasetId Dataset unique identifier
   * @param params Pagination parameters
   */
  async getItems<T>(datasetId: string, params: IPaginationParams): Promise<IPagination<T>> {
    if (!datasetId) {
      throw new Error('datasetId must not be empty');
    }
    const dirPath = this.getStoragePath(path.join(this.datasetDir, datasetId));
    let files: string[];
    try {
      files = await fs.promises.readdir(dirPath);
    } catch {
      return {
        items: [],
        total: 0,
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        totalPage: 0
      };
    }
    files = files.filter(f => /^\d{8}\.json$/.test(f));
    files.sort();
    const items: T[] = [];
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const data = await this.readFile(filePath);
      items.push(JSON.parse(data));
    }
    return this.paginateArray(items, params.page, params.pageSize);
  }
}
