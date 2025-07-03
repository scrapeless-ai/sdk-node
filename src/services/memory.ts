import fs from 'fs';
import path from 'path';

export abstract class MemoryService {
  private readonly storagePath: string = 'storage';

  private readonly basePath: string = path.resolve(this.storagePath);

  protected getStoragePath(subPath: string): string {
    return path.join(this.basePath, subPath);
  }

  protected paginateArray<T>(items: T[], page: number = 1, pageSize: number = 10) {
    const total = items.length;
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, total);
    const pagedItems = items.slice(start, end);
    return {
      items: pagedItems,
      total,
      page,
      pageSize,
      totalPage: Math.ceil(total / pageSize)
    };
  }

  protected async mkdir(dirPath: string): Promise<void> {
    await fs.promises.mkdir(dirPath, { recursive: true });
  }

  protected async writeJsonFile(filePath: string, data: any): Promise<void> {
    await fs.promises.writeFile(filePath, JSON.stringify(data), 'utf-8');
  }

  protected async readFile(metaPath: string): Promise<string> {
    return fs.promises.readFile(metaPath, 'utf-8');
  }

  protected async rm(path: string, options?: fs.RmOptions): Promise<void> {
    return fs.promises.rm(path, options);
  }

  protected async rmDir(path: string, options?: fs.RmDirOptions): Promise<void> {
    return fs.promises.rmdir(path, options);
  }

  protected async isNameExists(dirPath: string, name: string): Promise<boolean> {
    const skipDirs = new Set(['queues_stores', 'datasets', 'kv_stores', 'objects_stores', 'metadata.json']);
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (skipDirs.has(entry.name)) continue;
      const metaDataPath = path.join(dirPath, entry.name, 'metadata.json');
      try {
        const file = await fs.promises.readFile(metaDataPath, 'utf-8');
        const metaData = JSON.parse(file);
        if (metaData.name === name) {
          return true;
        }
      } catch {
        continue;
      }
    }
    return false;
  }
}
