// Load environment variables from .env file
import dotenv from 'dotenv';
import { ScrapelessClient } from './client';
import { PrintEnv } from './env';

const env = process.env.NODE_ENV || 'development';
dotenv.config();
dotenv.config({ path: `.env.${env}` });
dotenv.config({ path: `.env.${env}.local` });

PrintEnv();

// Export main client class
export const Scrapeless = ScrapelessClient;
export type Scrapeless = ScrapelessClient;
export { ScrapelessClient };

export * from './scraping-browser';
export * from './utils';
export * from './client';
export * from './env';
export * from './actor';
export * from './types';
export * from './universal';
export * from './scraping-crawl';
