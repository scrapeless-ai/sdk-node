import fs from 'fs';
import path from 'path';
import { MemoryService } from '../../memory';
import { createDir } from '../../../utils/memory';
import { v4 as uuidv4 } from 'uuid';
import {
  ICommonResponse,
  IPagination,
  IPaginationParams,
  IQueue,
  IQueueCreateParams,
  IQueueMessage,
  IQueuePushParams,
  IQueuePushResponse,
  IQueueStorage,
  IQueueUpdateParams
} from '../../../types';

/**
 * Queue storage service implementation (local file system)
 */
export class LocalQueueStorage extends MemoryService implements IQueueStorage {
  private readonly queueDir = 'queues_stores';

  /**
   * Constructor: ensure queue directory exists
   */
  constructor() {
    super();
    createDir(this.queueDir);
  }

  /**
   * List all available queues with pagination and optional sorting
   * @param params Pagination parameters
   */
  async list(params: IPaginationParams): Promise<IPagination<IQueue>> {
    const dirPath = this.getStoragePath(this.queueDir);
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
    const allQueues: IQueue[] = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const metaPath = path.join(dirPath, entry.name, 'metadata.json');
      try {
        const file = await this.readFile(metaPath);
        const meta = JSON.parse(file);
        allQueues.push(meta);
      } catch {
        continue;
      }
    }
    if (!params.desc) {
      allQueues.sort((a, b) => {
        if (!a.createdAt && !b.createdAt) return 0;
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    }
    return this.paginateArray(allQueues, params.page, params.pageSize);
  }

  /**
   * Create a new queue
   * @param data Queue creation parameters
   */
  async create(data: IQueueCreateParams): Promise<Pick<IQueue, 'id' | 'name'>> {
    if (!data.name) throw new Error('Queue name must not be empty');
    const exist = await this.isNameExists(this.getStoragePath(this.queueDir), data.name);
    if (exist) throw new Error('The name of the queue already exists');
    const id = uuidv4();
    const dirPath = this.getStoragePath(path.join(this.queueDir, id));
    await this.mkdir(dirPath);
    const now = new Date();
    const meta = {
      id,
      name: data.name,
      description: data.description || '',
      createdAt: now,
      updatedAt: now,
      actorId: data.actorId || '',
      runId: data.runId || '',
      stats: {
        failed: 0,
        pending: 0,
        running: 0,
        success: 0
      }
    };
    const metaPath = path.join(dirPath, 'metadata.json');
    await this.writeJsonFile(metaPath, meta);
    return { id, name: data.name };
  }

  /**
   * Get a queue by name
   * @param name Name of the queue
   */
  async get(name: string): Promise<IQueue> {
    if (!name) throw new Error('Queue name must not be empty');
    const dirPath = this.getStoragePath(this.queueDir);
    let entries: fs.Dirent[];
    try {
      entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    } catch {
      throw new Error('Queue not found');
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const metaPath = path.join(dirPath, entry.name, 'metadata.json');
      try {
        const file = await this.readFile(metaPath);
        const meta = JSON.parse(file);
        if (meta.name === name) return meta;
      } catch {
        continue;
      }
    }
    throw new Error('Queue not found');
  }

  /**
   * Update a queue
   * @param queueId ID of the queue to update
   * @param data Queue update parameters
   */
  async update(queueId: string, data: IQueueUpdateParams): Promise<null> {
    if (!queueId) throw new Error('Queue id must not be empty');
    const dirPath = this.getStoragePath(path.join(this.queueDir, queueId));
    const metaPath = path.join(dirPath, 'metadata.json');
    let meta: IQueue;
    try {
      const file = await this.readFile(metaPath);
      meta = JSON.parse(file);
    } catch {
      throw new Error('Queue not found');
    }
    if (data.name) meta.name = data.name;
    if (data.description) meta.description = data.description;
    meta.updatedAt = new Date();
    await this.writeJsonFile(metaPath, meta);
    return null;
  }

  /**
   * Delete a queue
   * @param queueId ID of the queue to delete
   */
  async delete(queueId: string): Promise<ICommonResponse> {
    if (!queueId) throw new Error('Queue id must not be empty');
    const dirPath = this.getStoragePath(path.join(this.queueDir, queueId));
    try {
      await this.rm(dirPath, { recursive: true, force: true });
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  /**
   * Push a message to a queue
   * @param queueId ID of the queue
   * @param params Message parameters
   */
  async push(queueId: string, params: IQueuePushParams): Promise<IQueuePushResponse> {
    if (!queueId) throw new Error('Queue id must not be empty');
    const dirPath = this.getStoragePath(path.join(this.queueDir, queueId));
    const id = uuidv4();
    const now = new Date();
    const retry = params.retry < 3 ? 3 : params.retry;
    const timeout = params.timeout < 60 ? 60 : params.timeout;
    const deadline = params.deadline || Math.floor(Date.now() / 1000) + 300;
    if (deadline < Math.floor(Date.now() / 1000) + 300) {
      throw new Error('Deadline must be after now + 300s');
    }
    const msg = {
      id,
      queueId,
      name: params.name || '',
      payload: params.payload,
      deadline,
      retry,
      timeout,
      retried: 0,
      successAt: 0,
      failedAt: 0,
      updateTime: now,
      reenterTime: ''
    };
    const msgPath = path.join(dirPath, `${id}.json`);
    await this.writeJsonFile(msgPath, msg);
    return { msgId: id };
  }

  /**
   * Pull messages from a queue
   * @param queueId ID of the queue
   * @param limit Maximum number of messages to pull
   */
  async pull(queueId: string, limit: number = 1): Promise<IQueueMessage[]> {
    if (!queueId) throw new Error('Queue id must not be empty');
    const dirPath = this.getStoragePath(path.join(this.queueDir, queueId));
    let files: string[];
    try {
      files = await fs.promises.readdir(dirPath);
    } catch {
      return [];
    }
    files = files.filter(f => f.endsWith('.json') && f !== 'metadata.json');
    const now = new Date();
    const msgs: IQueueMessage[] = [];
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      let msg;
      try {
        const data = await this.readFile(filePath);
        msg = JSON.parse(data);
      } catch {
        continue;
      }
      // Filter out completed, failed, expired, or over-retried messages
      if (
        msg.successAt > 0 ||
        msg.failedAt > 0 ||
        msg.deadline < Math.floor(now.getTime() / 1000) ||
        (msg.reenterTime && new Date(msg.reenterTime) > now) ||
        msg.retried >= msg.retry
      ) {
        await this.rm(filePath);
        continue;
      }
      msg.reenterTime = new Date(now.getTime() + (msg.timeout || 0) * 1000);
      msg.retried = (msg.retried || 0) + 1;
      await this.writeJsonFile(filePath, msg);
      msgs.push(msg);
    }
    // Sort by updateTime if present
    if (msgs.length > 0 && 'updateTime' in msgs[0]) {
      msgs.sort((a, b) => new Date((a as any).updateTime).getTime() - new Date((b as any).updateTime).getTime());
    }
    return msgs.slice(0, limit);
  }

  /**
   * Acknowledge a message in a queue
   * @param queueId ID of the queue
   * @param msgId ID of the message to acknowledge
   */
  async ack(queueId: string, msgId: string): Promise<ICommonResponse> {
    if (!queueId) throw new Error('Queue id must not be empty');
    try {
      const filePath = this.getStoragePath(path.join(this.queueDir, queueId, `${msgId}.json`));
      const msg = JSON.parse(await this.readFile(filePath));
      if (msg.reenterTime && new Date(msg.reenterTime).getTime() > Date.now()) {
        await this.rm(filePath);
        return { success: true };
      }
      return { success: false };
    } catch {
      return { success: false };
    }
  }
}
