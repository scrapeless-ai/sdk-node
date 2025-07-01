import fs from 'node:fs';
import path from 'node:path';

const metadataStore = {
  datasets: {
    id: 'default',
    name: 'default',
    actorId: 'default',
    runId: 'default',
    stats: {}
  },
  kv_stores: {
    id: 'default',
    name: 'default',
    actorId: 'default',
    runId: 'default'
  },
  objects_stores: {
    id: 'default',
    name: 'default',
    description: 'default',
    actorId: 'default',
    runId: 'default',
    size: 0
  },
  queues_stores: {
    id: 'default',
    name: 'default',
    teamId: 'default',
    actorId: 'default',
    runId: 'default',
    description: 'default',
    stats: {}
  }
};

export async function createRoot() {
  const rootDir = 'storage';
  const rootPath = path.resolve(rootDir);
  if (!fs.existsSync(rootPath)) {
    await fs.promises.mkdir(rootPath);
  }
}

export async function createDir(dir: keyof typeof metadataStore) {
  const storagePath = path.resolve(`storage/${dir}`);
  if (!fs.existsSync(storagePath)) {
    await fs.promises.mkdir(storagePath, { recursive: true });
    await fs.promises.mkdir(path.join(storagePath, 'default'));
    const metadata = metadataStore[dir];

    await fs.promises.writeFile(
      path.join(storagePath, 'default', 'metadata.json'),
      JSON.stringify({
        ...metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    );
    if (dir === 'kv_stores') await fs.promises.writeFile(path.join(storagePath, 'default', 'INPUT.json'), '');
  }
}
