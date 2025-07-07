import fs from 'fs';
import path from 'path';
import { MemoryService } from '../../memory';
import { createDir } from '../../../utils/memory';
import { v4 as uuidv4 } from 'uuid';
import {
  ICommonResponse,
  IKVItem,
  IKVKey,
  IKVNamespace,
  IKVStorage,
  IKVValueData,
  IPagination,
  IPaginationParams,
  IBulkSetValueResponse
} from '../../../types';

/**
 * Key-Value storage service implementation (local file system)
 */
export class LocalKVStorage extends MemoryService implements IKVStorage {
  private readonly kvDir = 'kv_stores';

  /**
   * Constructor: ensure kv directory exists
   */
  constructor() {
    super();
    createDir(this.kvDir);
  }

  /**
   * List all available namespaces
   * @param params Pagination parameters
   */
  async listNamespaces(params: IPaginationParams): Promise<IPagination<IKVNamespace>> {
    const dirPath = this.getStoragePath(this.kvDir);
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
    const allNamespaces: IKVNamespace[] = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const nsPath = path.join(dirPath, entry.name);
      const metaPath = path.join(nsPath, 'metadata.json');
      try {
        const file = await this.readFile(metaPath);
        const meta = JSON.parse(file);
        allNamespaces.push({
          id: meta.id,
          name: meta.name,
          createdAt: meta.createdAt,
          updatedAt: meta.updatedAt,
          actorId: meta.actorId || '',
          runId: meta.runId || '',
          stats: { count: 0, size: 0 }
        });
      } catch {
        continue;
      }
    }
    if (!params.desc) {
      allNamespaces.sort((a, b) => {
        if (!a.createdAt && !b.createdAt) return 0;
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    }
    const paged = this.paginateArray(allNamespaces, params.page, params.pageSize);

    for (const ns of paged.items) {
      const nsPath = path.join(dirPath, ns.id);
      try {
        const files = await fs.promises.readdir(nsPath);
        let count = 0;
        let size = 0;
        for (const f of files) {
          if (f === 'metadata.json' || !f.endsWith('.json')) continue;
          count++;
          const keyInfo = await this.readFile(path.join(nsPath, f));
          size += JSON.parse(keyInfo).size;
        }
        ns.stats = { count, size };
      } catch {}
    }
    return paged;
  }

  /**
   * Create a new namespace
   * @param name Name of the namespace
   */
  async createNamespace(name: string): Promise<IKVNamespace> {
    if (!name) {
      throw new Error('Namespace name must not be empty');
    }
    const exist = await this.isNameExists(this.getStoragePath(this.kvDir), name);
    if (exist) {
      throw new Error('The name of the namespace already exists');
    }
    const id = uuidv4();
    const dirPath = this.getStoragePath(path.join(this.kvDir, id));
    await this.mkdir(dirPath);
    const now = new Date();
    const meta = {
      id,
      name,
      createdAt: now,
      updatedAt: now,
      actorId: '',
      runId: ''
    };
    const metaPath = path.join(dirPath, 'metadata.json');
    try {
      await this.writeJsonFile(metaPath, meta);
      return {
        ...meta,
        stats: { size: 0, count: 0 }
      };
    } catch {
      throw new Error('Create namespace failed');
    }
  }

  /**
   * Get a namespace by ID
   * @param namespaceId ID of the namespace
   */
  async getNamespace(namespaceId: string): Promise<IKVNamespace> {
    if (!namespaceId) {
      throw new Error('namespaceId must not be empty');
    }
    const dirPath = this.getStoragePath(path.join(this.kvDir, namespaceId));
    const metaPath = path.join(dirPath, 'metadata.json');
    try {
      const file = await this.readFile(metaPath);
      const meta = JSON.parse(file);

      const files = await fs.promises.readdir(dirPath);
      let count = 0;
      let size = 0;
      for (const f of files) {
        if (f === 'metadata.json' || !f.endsWith('.json')) continue;
        count++;
        const keyInfo = await this.readFile(path.join(dirPath, f));
        size += JSON.parse(keyInfo).size;
      }
      return {
        id: meta.id,
        name: meta.name,
        createdAt: meta.createdAt,
        updatedAt: meta.updatedAt,
        actorId: meta.actorId || '',
        runId: meta.runId || '',
        stats: { count, size }
      };
    } catch {
      throw new Error('Namespace not found');
    }
  }

  /**
   * Delete a namespace
   * @param namespaceId ID of the namespace to delete
   */
  async delNamespace(namespaceId: string): Promise<ICommonResponse> {
    if (!namespaceId) {
      return { success: false };
    }
    const dirPath = this.getStoragePath(path.join(this.kvDir, namespaceId));
    try {
      await this.rm(dirPath, { recursive: true, force: true });
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  /**
   * Rename a namespace
   * @param namespaceId ID of the namespace to rename
   * @param name New name for the namespace
   */
  async renameNamespace(namespaceId: string, name: string): Promise<ICommonResponse> {
    if (!namespaceId || !name) {
      return { success: false };
    }
    const dirPath = this.getStoragePath(path.join(this.kvDir, namespaceId));
    const metaPath = path.join(dirPath, 'metadata.json');
    let meta: IKVNamespace;
    try {
      const file = await this.readFile(metaPath);
      meta = JSON.parse(file);
      meta.name = name;
      meta.updatedAt = new Date();
      await this.writeJsonFile(metaPath, meta);
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  /**
   * List keys in a namespace
   * @param namespaceId ID of the namespace to list keys from
   * @param params Pagination parameters
   */
  async listKeys(namespaceId: string, params: Omit<IPaginationParams, 'desc'>): Promise<IPagination<IKVItem>> {
    if (!namespaceId) {
      throw new Error('namespaceId must not be empty');
    }
    const dirPath = this.getStoragePath(path.join(this.kvDir, namespaceId));
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
    files = files.filter(f => f.endsWith('.json') && f !== 'metadata.json');
    files.sort();
    const items: IKVItem[] = [];
    for (const file of files) {
      try {
        const filePath = path.join(dirPath, file);
        const data = await this.readFile(filePath);
        const kv = JSON.parse(data) as IKVKey;
        if (kv.expireAt && new Date(kv.expireAt) < new Date()) continue;
        items.push({ key: kv.key, size: kv.size });
      } catch {
        continue;
      }
    }
    return this.paginateArray(items, params.page, params.pageSize);
  }

  /**
   * Delete a value from a namespace
   * @param namespaceId ID of the namespace
   * @param key Key to delete
   */
  async delValue(namespaceId: string, key: string): Promise<ICommonResponse> {
    if (!namespaceId) {
      throw new Error('namespaceId must not be empty');
    }
    const file = `${key}.json`;
    if (file === 'metadata.json') {
      return { success: false };
    }
    const filePath = this.getStoragePath(path.join(this.kvDir, namespaceId, file));
    try {
      await this.rm(filePath);
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  /**
   * Bulk set multiple key-value pairs in a namespace
   * @param namespaceId ID of the namespace
   * @param data Array of key-value data
   */
  async bulkSetValue(namespaceId: string, data: IKVValueData[]): Promise<IBulkSetValueResponse> {
    if (!namespaceId) {
      throw new Error('namespaceId must not be empty');
    }
    if (!Array.isArray(data) || data.length === 0) {
      return { successfulKeyCount: 0, unsuccessfulKeys: [] };
    }
    let successfulKeyCount = 0;
    const unsuccessfulKeys = [];
    for (const item of data) {
      try {
        const res = await this.setValue(namespaceId, item);
        if (res.success) {
          successfulKeyCount++;
        } else {
          unsuccessfulKeys.push(item.key);
        }
      } catch {
        continue;
      }
    }
    return { successfulKeyCount, unsuccessfulKeys };
  }

  /**
   * Bulk delete multiple keys from a namespace
   * @param namespaceId ID of the namespace
   * @param keys Array of keys to delete
   */
  async bulkDelValue(namespaceId: string, keys: string[]): Promise<ICommonResponse> {
    if (!namespaceId) {
      throw new Error('namespaceId must not be empty');
    }
    if (!Array.isArray(keys) || keys.length === 0) {
      return { success: false };
    }
    for (const key of keys) {
      try {
        await this.delValue(namespaceId, key);
      } catch {
        continue;
      }
    }
    return { success: true };
  }

  /**
   * Set a key-value pair in a namespace
   * @param namespaceId ID of the namespace
   * @param data Key-value data
   */
  async setValue(namespaceId: string, data: IKVValueData): Promise<ICommonResponse> {
    if (!namespaceId) {
      throw new Error('namespaceId must not be empty');
    }
    if (!data.key || !data.value) {
      return { success: false };
    }
    if (data.key === 'metadata') {
      return { success: false };
    }
    if (data.key === 'INPUT' && namespaceId === 'default') {
      return { success: false };
    }
    const filePath = this.getStoragePath(path.join(this.kvDir, namespaceId, `${data.key}.json`));
    const now = new Date();

    const expiration = data.expiration ?? 0;
    const expireAt = new Date(now.getTime() + expiration * 1000);
    const kv: IKVKey = {
      namespaceId,
      key: data.key,
      value: data.value,
      expiration,
      expireAt,
      size: Buffer.byteLength(data.value)
    };
    try {
      await this.writeJsonFile(filePath, kv);
      return { success: true };
    } catch {
      throw new Error('Set kv failed');
    }
  }

  /**
   * Get a value by key from a namespace
   * @param namespaceId ID of the namespace
   * @param key Key to retrieve
   */
  async getValue(namespaceId: string, key: string): Promise<string> {
    if (!key) {
      throw new Error('key must not be empty');
    }
    const filePath = this.getStoragePath(path.join(this.kvDir, namespaceId, `${key}.json`));
    try {
      const data = await this.readFile(filePath);
      if (namespaceId === 'default' && key === 'INPUT') {
        return data;
      }
      const kv = JSON.parse(data);
      if (kv.expireAt && new Date(kv.expireAt) < new Date()) {
        return '';
      }
      return kv.value;
    } catch {
      return '';
    }
  }
}
