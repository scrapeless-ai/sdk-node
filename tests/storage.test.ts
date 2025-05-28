import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScrapelessClient } from '../src/client';

const mockFetch = vi.fn();

describe('DatasetStorage', () => {
  let client: ScrapelessClient;

  beforeEach(() => {
    client = new ScrapelessClient({ apiKey: 'test' });
    mockFetch.mockReset();
  });

  it('should list datasets', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ items: [{ id: 'ds1', name: 'dataset1' }], page: 1, pageSize: 10, total: 1 })
    });
    const result = await client.storage.dataset.listDatasets({ page: 1, pageSize: 10 });
    console.log('List datasets result:', result);
    expect(result.items[0].id).toBe('ds1');
  });

  it('should create a dataset', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'ds2', name: 'test-dataset' })
    });
    const ds = await client.storage.dataset.createDataset('test-dataset');
    console.log('Created dataset:', ds);
    expect(ds.id).toBe('ds2');
    expect(ds.name).toBe('test-dataset');
  });

  it('should update a dataset', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'ds2', name: 'updated-dataset' })
    });
    const ds = await client.storage.dataset.updateDataset('ds2', 'updated-dataset');
    console.log('Updated dataset:', ds);
    expect(ds.name).toBe('updated-dataset');
  });

  it('should delete a dataset', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, message: 'deleted' })
    });
    const res = await client.storage.dataset.delDataset('ds2');
    console.log('Delete dataset result:', res);
    expect(res.success).toBe(true);
  });

  it('should add items to a dataset', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, message: 'items added' })
    });
    const res = await client.storage.dataset.addItems('ds2', [{ foo: 'bar' }]);
    console.log('Add items result:', res);
    expect(res.success).toBe(true);
  });

  it('should get items from a dataset', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ items: [{ foo: 'bar' }], page: 1, pageSize: 10, total: 1 })
    });
    const result = await client.storage.dataset.getItems<{ foo: string }>('ds2', { page: 1, pageSize: 10 });
    console.log('Get items result:', result);
    expect(result.items[0].foo).toBe('bar');
  });
});
