import { BaseService } from './base';
import { sleep } from '../utils/utils';
import {
  ICreateCaptcha,
  ICreateCaptchaResponse,
  IGetCaptchaResult,
  ScrapelessCaptcha,
  ResponseWithStatus
} from '../types';

export class CaptchaService extends BaseService implements ScrapelessCaptcha {
  private readonly basePath = '/api/v1';

  constructor(apiKey: string, baseUrl: string, timeout: number) {
    super(apiKey, baseUrl, timeout);
  }

  /**
   * Create a captcha solving task
   * @param data Captcha request data
   */
  async captchaCreate(data: ICreateCaptcha): Promise<ResponseWithStatus<ICreateCaptchaResponse>> {
    return this.request<ICreateCaptchaResponse, true>(`${this.basePath}/createTask`, 'POST', data, {}, true);
  }

  /**
   * Get captcha solving result
   * @param taskId Task ID
   */
  async captchaResultGet(taskId: string): Promise<ResponseWithStatus<IGetCaptchaResult>> {
    return this.request<IGetCaptchaResult, true>(
      `${this.basePath}/getTaskResult/${taskId}`,
      'GET',
      undefined,
      {},
      true
    );
  }

  /**
   * Create captcha task and wait for result
   * @param data Captcha request data
   */
  async captchaSolver(data: ICreateCaptcha): Promise<IGetCaptchaResult> {
    const task = await this.captchaCreate(data);
    const result = await this.captchaResultGet(task.data.taskId);

    if (result.data.success) return result.data;

    while (true) {
      await sleep(1000);
      const result = await this.captchaResultGet(task.data.taskId);
      if (result.data.success) {
        return result.data;
      }
    }
  }
}
