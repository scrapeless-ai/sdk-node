import { ResponseWithStatus } from './base';
/**
 * Legacy SDK compatibility type: Captcha request
 */
export interface ICreateCaptcha {
  actor: string;
  input: object;
  proxy?: string;
}

/**
 * Legacy SDK compatibility type: Captcha response
 */
export interface ICreateCaptchaResponse {
  state: 'idle';
  success: boolean;
  taskId: string;
}

/**
 * Legacy SDK compatibility type: Captcha result
 */
export interface IGetCaptchaResult {
  actor: string;
  createTime: number;
  elapsed: number;
  state?: string;
  solution: {
    token: string;
  };
  success: boolean;
  taskId: string;
}

/**
 * Legacy SDK compatibility type: ScrapelessCaptcha interface
 */
export interface ScrapelessCaptcha {
  captchaCreate: (data: ICreateCaptcha) => Promise<ResponseWithStatus<ICreateCaptchaResponse>>;
  captchaResultGet: (taskId: string) => Promise<ResponseWithStatus<IGetCaptchaResult>>;
  captchaSolver: (data: ICreateCaptcha) => Promise<IGetCaptchaResult>;
}
