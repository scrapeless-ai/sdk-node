import nodeFetch from 'node-fetch';
import { ScrapelessError } from '../client';
import { log as Log } from '../utils';
import { RequestResponse } from '../types';

const log = Log.withPrefix('BaseService.request');

export abstract class BaseService {
  protected constructor(
    protected readonly apiKey: string,
    protected readonly baseUrl: string,
    protected readonly timeout: number = 30_000,
    protected readonly handleResponse?: (res: any) => any
  ) {}

  protected async request<T, R extends boolean = false>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: Record<string, any>,
    additionalHeaders: Record<string, string> = {},
    responseWithStatus: R = false as R
  ): Promise<RequestResponse<T, R>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
      ...additionalHeaders
    };

    const options: any = {
      method,
      headers,
      timeout: this.timeout
    };

    if (body) {
      options.body = JSON.stringify(body);
      // log.debug("Request body:", options.body);
    }

    if (body && additionalHeaders['content-type']?.startsWith('multipart/form-data;')) {
      options.headers = {
        ...additionalHeaders,
        'X-API-Key': this.apiKey
      };
      options.body = body;
    }

    const response = await nodeFetch(`${this.baseUrl}${endpoint}`, options);

    // Get response content, parse it if it's JSON
    let data: any;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    // log.debug("Response data:", data);

    if (!response.ok) {
      let errorMessage = '';
      let errorCode = response.status;
      if (typeof data === 'object') {
        if (data.error) {
          errorMessage = data.error;
        }
        if (data.msg) {
          errorMessage = data.msg;
        }
        if (data.code) {
          errorCode = data.code;
        }
        if (data.traceId) {
          // If error message exists, add traceId info, otherwise create default error message
          if (errorMessage) {
            errorMessage += ` (TraceID: ${data.traceId})`;
          } else {
            errorMessage = `failed with status ${response.status} (TraceID: ${data.traceId})`;
          }
        }
      }
      // If no error message has been set, use the default message
      if (!errorMessage) {
        errorMessage = `failed with status ${response.status}`;
      }
      errorMessage = `Request ${method} ${this.baseUrl}${endpoint} ${errorMessage}`;
      log.error(errorMessage);
      throw new ScrapelessError(errorMessage, errorCode);
    }

    if (this.handleResponse) {
      return this.handleResponse(data) as RequestResponse<T, R>;
    }

    return responseWithStatus
      ? ({ data: data as T, status: response.status } as RequestResponse<T, R>)
      : (data.data as RequestResponse<T, R>);
  }
}
