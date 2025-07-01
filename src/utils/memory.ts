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

export async function createDataset(dir: keyof typeof metadataStore) {
  const datasetPath = path.resolve(`storage/${dir}`);
  if (!fs.existsSync(datasetPath)) {
    await fs.promises.mkdir(datasetPath);
    await fs.promises.mkdir(path.join(datasetPath, 'default'));
    const metadata = metadataStore[dir];

    await fs.promises.writeFile(
      path.join(datasetPath, 'default', 'metadata.json'),
      JSON.stringify({
        ...metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    );
  }
}
