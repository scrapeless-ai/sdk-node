/**
 * Example: Demonstrating how to use the Log module with prefixes
 * Filename: logger-prefix-example.mjs
 */
import { log as Log } from '@scrapeless-ai/sdk';

async function runExample() {
  try {
    // Example 1: Using static prefix for all logs
    Log.setPrefix('Scrapeless');
    Log.info('Detecting rendering type for https://www.scrapeless.io/');
    Log.debug('Using detection strategy: userAgent');
    Log.warn('Connection is slow, timeout increased to 30s');

    // Example 2: Create different loggers with different prefixes
    const browserLog = Log.withPrefix('Browser');
    const proxyLog = Log.withPrefix('ProxyManager');

    browserLog.info('Starting new browser session');
    proxyLog.info('Selecting proxy from pool');
    Log.info('This log still uses Scrapeless prefix');

    // Example 3: Change prefix
    Log.setPrefix('SessionManager');
    Log.info('Created new session with ID: sess_12345');

    // Example 4: Format logs with placeholders
    browserLog.info('Navigation to {0} completed in {1}ms', 'https://example.com', 1250);

    // Example 5: Multiple parameters
    proxyLog.debug('Connection stats:', {
      latency: '120ms',
      country: 'US',
      alive: true
    });

    console.log('\nExample completed. Check the logs above to see prefixes with colors.');
  } catch (error) {
    console.error('Example error:', error);
  }
}

// Run the example
runExample().catch(console.error);
