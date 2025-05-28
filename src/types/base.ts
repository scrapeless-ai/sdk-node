export type RequestResponse<T, R extends boolean> = R extends true ? { status: number; data: T } : T;

/**
 * Response structure for API requests with status
 */
export interface ResponseWithStatus<T> {
  status: number;
  data: T;
}
