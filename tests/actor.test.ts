import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScrapelessClient } from '../src';
import { Actor } from '../src';

const mockFetch = vi.fn();

describe('ActorService', () => {
  let client: ScrapelessClient;
  let actor: Actor;

  beforeEach(() => {
    client = new ScrapelessClient({ apiKey: process.env.SCRAPELESS_API_KEY });
    actor = new Actor();
    mockFetch.mockReset();
    vi.doMock('node-fetch', () => {
      return {
        default: (...args: any[]) => {
          return mockFetch(...args);
        }
      };
    });
  });

  it('should get input params', () => {
    const result = actor.input();
    console.log('Actor input params:', result);
    expect(result.q).not.toBeNull();
  });

  it('should run an actor', async () => {
    const result = (await client.actor.run(process.env.SCRAPELESS_ACTOR_ID as string, {
      input: {
        q: 'GOOGL:NASDAQ'
      },
      runOptions: {
        CPU: 2,
        memory: 2048
      }
    })) as { runId: string; status: string };
    console.log('Run actor result:', result);
    expect(result.runId).not.toBeNull();
  });

  it('should build an actor', async () => {
    const result = (await client.actor.build(process.env.SCRAPELESS_ACTOR_ID as string)) as {
      buildId: string;
      success: boolean;
    };
    console.log('Build actor result:', result);
    expect(result.success).toBe(true);
    expect(result.buildId).not.toBeNull();
  });

  it('should get build status', async () => {
    const result = (await client.actor.getBuildStatus('actor1', 'build1')) as {
      buildId: string;
      status: boolean;
    };
    console.log('Get build status result:', result);
    expect(result.buildId).not.toBeNull();
  });

  it('should get run list', async () => {
    const result = (await client.actor.getRunList({
      page: 1,
      pageSize: 10
    })) as {
      items: Array<any>;
    };
    console.log('Get run list result:', result);
    expect(result.items).not.toBeNull();
  });

  it('should abort a running actor', async () => {
    const result = (await client.actor.abortRun(
      process.env.SCRAPELESS_ACTOR_ID as string,
      process.env.SCRAPELESS_RUN_ID as string
    )) as {
      success: boolean;
    };
    console.log('Abort actor run result:', result);
    expect(result.success).not.toBeNull();
  });

  it('should add items to dataset', async () => {
    const mockItems = [{ key: 'value' }];
    const result = await actor.addItems(mockItems);
    console.log('Add items to dataset result:', result);
    expect(result.success).toBe(true);
  });

  it('should get items from dataset', async () => {
    const result = await actor.getItems<{ key: string }>({
      page: 1,
      pageSize: 10
    });
    console.log('Get items from dataset result:', result);
    expect(result.items).not.toBe([]);
  });

  it('should set value in KV storage', async () => {
    const mockData = { key: 'testKey', value: 'testValue' };
    const result = await actor.setValue(mockData);
    console.log('Set value in KV storage result:', result);
    expect(result.success).toBe(true);
  });

  it('should get value from KV storage', async () => {
    const mockKey = 'testKey';
    const mockValue = 'testValue';
    const result = await actor.getValue(mockKey);
    console.log('Get value from KV storage result:', result);
    expect(result).toBe(mockValue);
  });

  it('should push message to queue', async () => {
    const mockMessage = {
      name: '',
      retry: 3,
      timeout: 1000,
      deadline: 1000,
      payload: 'some'
    };
    const result = await actor.pushMessage(mockMessage);
    console.log('Push message to queue result:', result);
    expect(result.msgId).not.toBeNull();
  });

  it('should pull message from queue', async () => {
    const result = await actor.pullMessage(10);
    console.log('Pull message from queue result:', result);
    expect(result).not.toBeNull();
  });

  it('should list all available datasets', async () => {
    const result = await actor.listDatasets({ page: 1, pageSize: 10 });
    console.log('List all available datasets result:', result);
    expect(result.items).not.toBeNull();
  });

  it('should update a dataset', async () => {
    const newName = 'updated-dataset';
    const result = await actor.updateDataset(newName);
    console.log('Update a dataset result:', result);
    expect(result.name).toBe(newName);
  });

  it('should delete a dataset', async () => {
    const result = await actor.deleteDataset();
    console.log('Delete a dataset result:', result);
    expect(result.success).toBe(true);
  });

  it('should list all available namespaces', async () => {
    const result = await actor.listNamespaces({ page: 1, pageSize: 10 });
    console.log('List all available namespaces result:', result);
    expect(result.items).not.toBeNull();
  });

  it('should create a new namespace', async () => {
    const newNamespaceName = 'new-name';
    const result = await actor.createNamespace(newNamespaceName);
    console.log('Create a new namespace result:', result);
    expect(result.name).toBe(newNamespaceName);
  });

  it('should get a namespace by ID', async () => {
    const result = await actor.getNamespace();
    console.log('Get a namespace by ID result:', result);
    expect(result.id).toBe(process.env.SCRAPELESS_KV_NAMESPACE_ID);
  });

  it('should delete a namespace', async () => {
    const result = await actor.deleteNamespace();
    console.log('Delete a namespace result:', result);
    expect(result.success).toBe(true);
  });

  it('should rename a namespace', async () => {
    const newName = 'renamed-namespace';
    const result = await actor.renameNamespace(newName);
    console.log('Rename a namespace result:', result);
    expect(result.success).toBe(true);
  });

  it('should list keys in a namespace', async () => {
    const result = await actor.listKeys({ page: 1, pageSize: 10 });
    console.log('List keys in a namespace result:', result);
    expect(result.items).not.toBeNull();
  });

  it('should delete a value from a namespace', async () => {
    const keyToDelete = 'testKey';
    const result = await actor.deleteValue(keyToDelete);
    console.log('Delete a value from a namespace result:', result);
    expect(result.success).toBe(true);
  });

  it('should bulk set multiple key-value pairs in a namespace', async () => {
    const mockData = [
      { key: 'key1', value: 'value1' },
      { key: 'key2', value: 'value2' }
    ];
    const result = await actor.bulkSetValue(mockData);
    console.log('Bulk set multiple key-value pairs in a namespace result:', result);
    expect(result.successfulKeyCount).not.toBeNull();
  });

  it('should bulk delete multiple keys from a namespace', async () => {
    const keysToDelete = ['key1', 'key2'];
    const result = await actor.bulkDelValue(keysToDelete);
    console.log('Bulk delete multiple keys from a namespace result:', result);
    expect(result.success).toBe(true);
  });

  it('should list all available queues', async () => {
    const result = await actor.listQueues({ page: 1, pageSize: 10 });
    console.log('List all available queues result:', result);
    expect(result.items).not.toBeNull();
  });

  it('should create a new queue', async () => {
    const mockData = {
      name: 'new-queue',
      actorId: process.env.SCRAPELESS_ACTOR_ID as string,
      runId: process.env.SCRAPELESS_RUN_ID as string
    };
    const result = await actor.createQueue(mockData);
    console.log('Create a new queue result:', result);
    expect(result.name).toBe(mockData.name);
  });

  it('should get a queue by name', async () => {
    const queueName = 'test-update-q';
    const result = await actor.getQueue(queueName);
    console.log('Get a queue by name result:', result);
    expect(result.name).toBe(queueName);
  });

  it('should update a queue', async () => {
    const mockData = { name: 'updated-queue' };
    const result = await actor.updateQueue(mockData);
    console.log('Update a queue result:', result);
    expect(result).not.toBe(null);
  });

  it('should delete a queue', async () => {
    const result = await actor.deleteQueue();
    console.log('Delete a queue result:', result);
    expect(result).toStrictEqual({});
  });

  it('should acknowledge a message in the default queue', async () => {
    const msgId = 'msg1';
    const result = await actor.ackMessage(msgId);
    console.log('Acknowledge a message in the default queue result:', result);
    expect(result.success).toBe(true);
  });
});
