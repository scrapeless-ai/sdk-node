import { createDir } from '../../../utils/memory';
import { MemoryService } from '../../memory';
import {
  ICommonResponse,
  IObjectBucket,
  IObjectBucketsPagination,
  IObjectCreateParams,
  IObjectItem,
  IObjectListParams,
  IObjectObjectsPagination,
  IObjectPaginationParams,
  IObjectStorage,
  IObjectUploadParams,
  IObjectUploadResponse
} from '../../../types';

/**
 * Object storage service implementation (local file system)
 */
export class LocalObjectStorage extends MemoryService implements IObjectStorage {
  private readonly objectDir = 'objects_stores';

  constructor() {
    super();
    createDir(this.objectDir);
  }

  listBuckets(params: IObjectListParams): Promise<IObjectBucketsPagination<IObjectBucket>> {
    throw new Error('local storage unimplemented');
  }

  createBucket(data: IObjectCreateParams): Promise<IObjectBucket> {
    throw new Error('local storage unimplemented');
  }

  deleteBucket(bucketId: string): Promise<ICommonResponse> {
    throw new Error('local storage unimplemented');
  }

  getBucket(bucketId: string): Promise<IObjectBucket> {
    throw new Error('local storage unimplemented');
  }

  list(bucketId: string, params: IObjectPaginationParams): Promise<IObjectObjectsPagination<IObjectItem>> {
    throw new Error('local storage unimplemented');
  }

  get(bucketId: string, objectId: string): Promise<Blob> {
    throw new Error('local storage unimplemented');
  }

  put(bucketId: string, data: IObjectUploadParams): Promise<IObjectUploadResponse> {
    throw new Error('local storage unimplemented');
  }

  delete(bucketId: string, objectId: string): Promise<ICommonResponse> {
    throw new Error('local storage unimplemented');
  }
}
