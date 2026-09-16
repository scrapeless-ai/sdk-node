/** Parameters are forwarded unchanged; input fields depend on the actor. */
export interface AIScraperTaskRequest {
  /** e.g. scraper.chatgpt, scraper.perplexity, scraper.gemini */
  actor: string;
  input: Record<string, any>;
  webhook?: { url: string; [key: string]: any };
  [key: string]: any;
}

/** Raw API response. Results may be absent until the task succeeds. */
export interface AIScraperTaskResult<T = any> {
  /** Known statuses: success, failed, running. */
  status: string;
  message?: string;
  task_result?: T;
  [key: string]: any;
}

export interface AIScraperTaskResponse<T = any> extends AIScraperTaskResult<T> {
  task_id: string;
}
