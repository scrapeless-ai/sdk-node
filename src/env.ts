import { log as Log } from './utils';

const log = Log.withPrefix('Environment');

/**
 * Scrapeless Actor environment variables
 *
 * This module provides access to environment variables used by the Scrapeless
 * Actor runtime. It defines all supported environment variables and provides
 * utility functions to retrieve them.
 *
 */
export enum ActorEnv {
  // Environment variables used by Scrapeless api client
  SCRAPELESS_BASE_API_URL = 'SCRAPELESS_BASE_API_URL',
  SCRAPELESS_ACTOR_API_URL = 'SCRAPELESS_ACTOR_API_URL',
  SCRAPELESS_STORAGE_API_URL = 'SCRAPELESS_STORAGE_API_URL',
  SCRAPELESS_BROWSER_API_URL = 'SCRAPELESS_BROWSER_API_URL',
  SCRAPELESS_CRAWL_API_URL = 'SCRAPELESS_CRAWL_API_URL',

  SCRAPELESS_API_KEY = 'SCRAPELESS_API_KEY',
  SCRAPELESS_USER_ID = 'SCRAPELESS_USER_ID',
  SCRAPELESS_TEAM_ID = 'SCRAPELESS_TEAM_ID',

  // Environment variables used by Scrapeless Actor runtime
  SCRAPELESS_ACTOR_ID = 'SCRAPELESS_ACTOR_ID',
  SCRAPELESS_RUN_ID = 'SCRAPELESS_RUN_ID',
  SCRAPELESS_INPUT = 'SCRAPELESS_INPUT',

  // Environment variables used by Scrapeless storage services
  SCRAPELESS_DATASET_ID = 'SCRAPELESS_DATASET_ID',
  SCRAPELESS_KV_NAMESPACE_ID = 'SCRAPELESS_KV_NAMESPACE_ID',
  SCRAPELESS_BUCKET_ID = 'SCRAPELESS_BUCKET_ID',
  SCRAPELESS_QUEUE_ID = 'SCRAPELESS_QUEUE_ID'
}

/**
 * Get environment variable
 * @param key Environment variable key
 * @returns Value of the environment variable
 * @throws Error if the environment variable is not defined
 */
export function getEnv(key: keyof typeof ActorEnv): string {
  const env = process.env[ActorEnv[key]];
  if (env === undefined) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return env;
}

/**
 * Get environment variable with default value
 * @param key Environment variable key
 * @param defaultValue Default value to return if env variable is not defined
 * @returns Value of the environment variable or default value
 */
export function getEnvWithDefault(key: keyof typeof ActorEnv, defaultValue: string): string {
  const env = process.env[ActorEnv[key]];
  return env === undefined ? defaultValue : env;
}

export function PrintEnv() {
  for (const key in ActorEnv) {
    const value = process.env[key];
    log.trace(`{0}: {1}`, key, value);
  }
}
