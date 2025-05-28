import { ScrapelessError } from '../../client';
import * as zt from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ErrorResponse, ExtractParams, ExtractResponse } from '../../types/scraping-crawl';
import { ScrapingCrawlBaseService } from './base';

export class ExtractService extends ScrapingCrawlBaseService {
  constructor(apiKey: string, baseUrl: string, timeout: number) {
    super(apiKey, baseUrl, timeout);
  }

  /**
   * Extract structured data from one or more URLs using a Zod schema.
   * @param urls Array of URLs to extract from
   * @param params Extraction parameters, including Zod schema
   * @returns Extracted data
   */
  async extractUrls<T extends zt.ZodSchema = any>(
    urls?: string[],
    params?: ExtractParams<T>
  ): Promise<ExtractResponse<zt.infer<T>> | ErrorResponse> {
    const jsonData: { urls?: string[] } & ExtractParams<T> = { urls, ...params };
    let jsonSchema: any;
    try {
      if (!params?.schema) {
        jsonSchema = undefined;
      } else if (
        typeof params.schema === 'object' &&
        params.schema !== null &&
        Object.getPrototypeOf(params.schema)?.constructor?.name?.startsWith('Zod')
      ) {
        jsonSchema = zodToJsonSchema(params.schema as zt.ZodType);
      } else {
        jsonSchema = params.schema;
      }
    } catch {
      throw new ScrapelessError('Invalid schema. Schema must be either a valid Zod schema or JSON schema object.', 400);
    }
    try {
      const response = await this.request<any>('/v1/extract', 'POST', {
        ...jsonData,
        schema: jsonSchema,
        origin: 'api-sdk'
      });
      if (response.id) {
        let extractStatus;
        do {
          extractStatus = await this.request<any>(`/v1/extract/${response.id}`, 'GET');
          if (extractStatus.status === 'completed') {
            if (extractStatus.success) {
              return {
                success: true,
                data: extractStatus.data,
                warning: extractStatus.warning,
                error: extractStatus.error,
                sources: extractStatus?.sources || undefined
              };
            } else {
              throw new ScrapelessError(`Failed to extract data. Error: ${extractStatus.error}`, 400);
            }
          } else if (['failed', 'cancelled'].includes(extractStatus.status)) {
            throw new ScrapelessError(`Extract job ${extractStatus.status}. Error: ${extractStatus.error}`, 400);
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        } while (extractStatus.status !== 'completed');
      } else {
        throw new ScrapelessError('Failed to start extract job', 400);
      }
    } catch (error: any) {
      throw new ScrapelessError(error.message, error.statusCode || 500);
    }
    throw new ScrapelessError('Unreachable', 500);
  }

  /**
   * Start an asynchronous extraction job for multiple URLs.
   * @param urls Array of URLs to extract from
   * @param params Extraction parameters
   * @returns Job info
   */
  async asyncExtractUrls(urls: string[], params?: ExtractParams): Promise<ExtractResponse | ErrorResponse> {
    const jsonData: any = { urls, ...params };
    let jsonSchema: any;
    try {
      if (
        params?.schema &&
        typeof params.schema === 'object' &&
        Object.getPrototypeOf(params.schema)?.constructor?.name?.startsWith('Zod')
      ) {
        jsonSchema = zodToJsonSchema(params.schema);
      } else {
        jsonSchema = params?.schema;
      }
    } catch {
      throw new ScrapelessError('Invalid schema. Schema must be either a valid Zod schema or JSON schema object.', 400);
    }
    try {
      const response = await this.request<any>('/v1/extract', 'POST', {
        ...jsonData,
        schema: jsonSchema,
        origin: 'api-sdk'
      });
      return response;
    } catch (error: any) {
      throw new ScrapelessError(error.message, error.statusCode || 500);
    }
  }

  /**
   * Get the status of an extraction job.
   * @param jobId Extraction job ID
   * @returns Extraction job status and data
   */
  async getExtractStatus(jobId: string): Promise<any> {
    try {
      const response = await this.request<any>(`/v1/extract/${jobId}`, 'GET');
      return response;
    } catch (error: any) {
      throw new ScrapelessError(error.message, error.statusCode || 500);
    }
  }
}
