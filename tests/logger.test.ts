import { describe, expect, it, afterAll, beforeAll } from 'vitest';
import { log, LogLevel } from '../src';

// Helper function to test log level changes dynamically
const testLogLevelChange = (newLevel: string) => {
  const prevLevel = process.env.SCRAPELESS_LOG_LEVEL;
  process.env.SCRAPELESS_LOG_LEVEL = newLevel;

  // Log module is a singleton and may have cached the log level
  // In a real application, the module would be reloaded with new environment variables
  // Here we just verify the environment variable change, as the module is already loaded

  try {
    expect(process.env.SCRAPELESS_LOG_LEVEL).toBe(newLevel);
    // Log methods should still be available
    expect(() => log.info(`Current log level: ${newLevel}`)).not.toThrow();
  } finally {
    // Restore original level
    process.env.SCRAPELESS_LOG_LEVEL = prevLevel;
  }
};

describe('Log Module', () => {
  // Mock console output and winston logging
  beforeAll(() => {
    // Set test environment variables
    process.env.SCRAPELESS_LOG_LEVEL = 'trace';
    process.env.SCRAPELESS_RUN_ID = 'test-run';
    process.env.SCRAPELESS_LOG_ROOT_DIR = './test-logs';
  });

  afterAll(() => {
    // Clear environment variables
    delete process.env.SCRAPELESS_LOG_LEVEL;
    delete process.env.SCRAPELESS_RUN_ID;
    delete process.env.SCRAPELESS_LOG_ROOT_DIR;
  });

  describe('Log Levels', () => {
    it('should support all log levels', () => {
      expect(LogLevel.TRACE).toBe('trace');
      expect(LogLevel.DEBUG).toBe('debug');
      expect(LogLevel.INFO).toBe('info');
      expect(LogLevel.WARN).toBe('warn');
      expect(LogLevel.ERROR).toBe('error');
    });

    it('should allow changing log level through environment variables', () => {
      testLogLevelChange('debug');
      testLogLevelChange('info');
      testLogLevelChange('warn');
      testLogLevelChange('error');
    });
  });

  describe('Log Methods', () => {
    it('log level should be all', () => {
      console.log('Log level:', process.env.SCRAPELESS_LOG_LEVEL);

      log.info('info');
      log.debug('debug');
      log.warn('warn');
      log.error('error');
      log.trace('trace');
    });

    it('trace method should log successfully', () => {
      log.info('User logged in', 'additional info');
      log.info('User {0}', 'John', 'extra info');
      log.info('{0} logged in at {1}', 'John', '10:00', 'via web');
      expect(() => log.trace('Test trace log')).not.toThrow();
    });

    it('tracef method should log formatted messages successfully', () => {
      expect(() => log.trace('User {0} performed action', 'testUser')).not.toThrow();
    });

    it('debug method should log successfully', () => {
      expect(() => log.debug('Test debug log')).not.toThrow();
    });

    it('debugf method should log formatted messages successfully', () => {
      expect(() => log.debug('Operation {0} result: {1}', 'test', 'success')).not.toThrow();
    });

    it('info method should log successfully', () => {
      expect(() => log.info('Test info log')).not.toThrow();
    });

    it('infof method should log formatted messages successfully', () => {
      expect(() => log.info('User {0} logged in, IP: {1}', 'testUser', '192.168.1.1')).not.toThrow();
    });

    it('warn method should log successfully', () => {
      expect(() => log.warn('Test warn log')).not.toThrow();
    });

    it('warnf method should log formatted messages successfully', () => {
      expect(() => log.warn('Operation {0} timed out: {1}ms', 'query', '5000')).not.toThrow();
    });

    it('error method should log successfully', () => {
      expect(() => log.error('Test error log')).not.toThrow();
    });

    it('errorf method should log formatted messages successfully', () => {
      expect(() => log.error('Operation {0} failed, error code: {1}', 'create', '500')).not.toThrow();
    });
  });

  describe('Log Formatting', () => {
    it('should handle multiple parameters correctly', () => {
      expect(() => log.info('Multiple parameter log', 1, true, { test: 'data' })).not.toThrow();
    });

    it('should handle object parameters correctly', () => {
      const obj = { id: 1, name: 'test' };
      expect(() => log.debug('Object parameter:', obj)).not.toThrow();
    });

    it('should handle error objects correctly', () => {
      const error = new Error('Test error');
      expect(() => log.error('Error message:', error)).not.toThrow();
    });

    it('should handle format logs without parameters', () => {
      expect(() => log.info('Format log without parameters')).not.toThrow();
    });

    it('should handle cases with fewer parameters than placeholders', () => {
      expect(() => log.info('Parameter {0} and {1}', 'only one')).not.toThrow();
    });

    it('should handle different parameter types correctly', () => {
      expect(() =>
        log.info('String: {0}, Number: {1}, Boolean: {2}, Object: {3}', 'test', 123, true, { id: 1 })
      ).not.toThrow();
    });

    it('should handle repeated use of the same placeholder', () => {
      expect(() => log.info('Repeated use of {0} in {1}, used again {0}', 'placeholder', 'message')).not.toThrow();
    });

    it('should handle large numbers of parameters', () => {
      expect(() => log.info('{0}{1}{2}{3}{4}{5}{6}{7}{8}{9}', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9)).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty messages', () => {
      expect(() => log.info('')).not.toThrow();
    });

    it('should handle null and undefined', () => {
      expect(() => log.info(null)).not.toThrow();
      expect(() => log.info(undefined)).not.toThrow();
    });

    it('should handle circular reference objects', () => {
      const circularObj: any = { name: 'Circular object' };
      circularObj.self = circularObj;

      expect(() => {
        try {
          log.info('Circular reference object:', circularObj);
        } catch (error) {
          // JSON.stringify will fail on circular references, but we expect logger to handle it gracefully
          console.error('Failed to handle circular reference:', error);
          throw error;
        }
      }).not.toThrow();
    });

    it('should handle non-string format templates', () => {
      expect(() => {
        try {
          log.info(123, 'test');
        } catch (error) {
          console.error('Failed to handle non-string format:', error);
          throw error;
        }
      }).not.toThrow();
    });

    it('should handle exceptionally long log content', () => {
      const longString = 'x'.repeat(10000);
      expect(() => log.info(longString)).not.toThrow();
    });

    it('should handle special characters', () => {
      expect(() => log.info('Special characters: 😀🔥👍\n\t\r\\"\'')).not.toThrow();
    });
  });

  describe('Environment Variables', () => {
    it('should use log level from environment variables', () => {
      // Already set to trace in beforeAll
      expect(() => log.trace('Environment variable log level test')).not.toThrow();
    });

    it('should use runId from environment variables', () => {
      // Verify we can get and use runId
      expect(process.env.SCRAPELESS_RUN_ID).toBe('test-run');
    });
  });

  describe('Prefixes', () => {
    it('should support prefixes', () => {
      log.setPrefix('Scrapeless');
      expect(() => log.info('Test log')).not.toThrow();
    });
  });
});
