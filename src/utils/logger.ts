import winston from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as stackTrace from 'stack-trace';
import Transport from 'winston-transport';

// Log level definitions
export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

// Log level mapping (Winston doesn't support trace level, map it to debug but preserve identifier)
const LOG_LEVELS = {
  [LogLevel.ERROR]: 0,
  [LogLevel.WARN]: 1,
  [LogLevel.INFO]: 2,
  [LogLevel.TRACE]: 3,
  [LogLevel.DEBUG]: 4
};

// Color configuration
const LEVEL_COLORS = {
  [LogLevel.TRACE]: 'gray',
  [LogLevel.DEBUG]: 'cyan',
  [LogLevel.INFO]: 'green',
  [LogLevel.WARN]: 'yellow',
  [LogLevel.ERROR]: 'red'
};

// Prefix color configuration
const PREFIX_COLORS = ['cyan', 'magenta', 'blue', 'yellow', 'green'];

// Get safe default log directory
const getDefaultLogDir = () => {
  return './logs';
  // // Use relative directory ./logs in test environment
  // if (process.env.NODE_ENV === 'test') {
  // }
  //
  // try {
  //   // Try to use system temp directory
  //   const tempDir = os.tmpdir();
  //   return path.join(tempDir, 'scrapeless-logs');
  // } catch (e) {
  //   // If unable to get temp directory, use logs folder in current directory
  //   return './logs';
  // }
};

// Get configuration from environment variables
const LOG_MAX_SIZE = process.env.SCRAPELESS_LOG_MAX_SIZE || '100m';
const LOG_MAX_BACKUPS = parseInt(process.env.SCRAPELESS_LOG_MAX_BACKUPS || '5', 10);
const LOG_MAX_AGE = parseInt(process.env.SCRAPELESS_LOG_MAX_AGE || '7', 10);
const LOG_ROOT_DIR = process.env.SCRAPELESS_LOG_ROOT_DIR || getDefaultLogDir();

try {
  if (!fs.existsSync(LOG_ROOT_DIR)) {
    fs.mkdirSync(LOG_ROOT_DIR, { recursive: true });
  }
} catch (err) {
  console.error(`Failed to create log directory ${LOG_ROOT_DIR}:`, err);
  // If unable to create directory, use console transport only and disable file transport
}

// Function to colorize text for console output
const colorize = (text: string, color: string) => {
  // ANSI color codes
  const colors: { [key: string]: string } = {
    gray: '\x1b[90m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m'
  };

  return colors[color] ? `${colors[color]}${text}${colors.reset}` : text;
};

// Create custom format
const customFormat = winston.format.printf(({ level, message, timestamp, prefix }) => {
  const prefixStr = prefix ? `${prefix}: ` : '';
  return `${timestamp} ${level} ${prefixStr}${message}`;
});

// Console format with colors
const consoleFormat = winston.format.printf(({ level, message, timestamp, prefix }) => {
  const prefixStr = prefix ? `${colorizePrefix(prefix as string)}: ` : '';
  return `${timestamp} ${level} ${prefixStr}${message}`;
});

// Function to deterministically choose color for prefix
const colorizePrefix = (prefix: string) => {
  if (!prefix) return '';

  // Use hash of prefix to choose a color deterministically
  const hash = prefix.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorIndex = hash % PREFIX_COLORS.length;
  // return colorize(prefix, PREFIX_COLORS[colorIndex]);
  return colorize(prefix, 'blue');
};

// Prepare transport array
const transports: Transport[] = [
  // Console output
  new winston.transports.Console({
    level: LogLevel.DEBUG,
    format: winston.format.combine(
      winston.format.colorize({ colors: LEVEL_COLORS }),
      winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ssZ' }),
      consoleFormat
    )
  })
];

// Add file transport if log directory is available
try {
  fs.accessSync(LOG_ROOT_DIR, fs.constants.W_OK);
  // Use type conversion to avoid type errors
  const fileTransport = new winston.transports.DailyRotateFile({
    level: LogLevel.DEBUG,
    filename: path.join(LOG_ROOT_DIR, 'scrapeless-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: LOG_MAX_SIZE,
    maxFiles: LOG_MAX_BACKUPS,
    createSymlink: true,
    symlinkName: 'scrapeless.log'
  });
  transports.push(fileTransport as unknown as Transport);
} catch (err) {
  console.warn(`Cannot write to log directory ${LOG_ROOT_DIR}, file logging disabled:`, err);
}

// Logger format that includes prefix metadata
const formatWithPrefix = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ssZ' }),
  customFormat
);

// Create Winston logger instance
const logger = winston.createLogger({
  levels: LOG_LEVELS,
  level: process.env.SCRAPELESS_LOG_LEVEL || LogLevel.INFO,
  format: formatWithPrefix,
  transports
});

// Store logger instances by prefix
const loggerInstances: Map<string, winston.Logger> = new Map();

// Create custom logger with prefix
const getLoggerWithPrefix = (prefix: string): winston.Logger => {
  if (!prefix) return logger;

  if (loggerInstances.has(prefix)) {
    return loggerInstances.get(prefix)!;
  }

  const prefixLogger = logger.child({ prefix });
  loggerInstances.set(prefix, prefixLogger);
  return prefixLogger;
};

// Create logger interface
export class log {
  private static _prefix: string = '';

  // Set prefix for logs
  static setPrefix(prefix: string): void {
    this._prefix = prefix;
  }

  // Get current prefix
  static getPrefix(): string {
    return this._prefix;
  }

  // Create a new logger with a specific prefix
  static withPrefix(prefix: string): log {
    const newLog = new log();
    newLog._prefix = prefix;
    return newLog;
  }

  // Get logger with current prefix
  private static getLogger(): winston.Logger {
    return getLoggerWithPrefix(this._prefix);
  }

  // Instance prefix for instances created with withPrefix
  private _prefix: string = '';

  // Get instance logger with prefix
  private getLogger(): winston.Logger {
    return getLoggerWithPrefix(this._prefix);
  }

  // Trace level logs
  static trace(format: string | any, ...args: any[]): void {
    this.getLogger().log(LogLevel.TRACE, this.formatString(format, args));
  }

  // Instance method for trace
  trace(format: string | any, ...args: any[]): void {
    this.getLogger().log(LogLevel.TRACE, log.formatString(format, args));
  }

  // Debug level logs
  static debug(format: string | any, ...args: any[]): void {
    this.getLogger().debug(this.formatString(format, args));
  }

  // Instance method for debug
  debug(format: string | any, ...args: any[]): void {
    this.getLogger().debug(log.formatString(format, args));
  }

  // Info level logs
  static info(format: string | any, ...args: any[]): void {
    this.getLogger().info(this.formatString(format, args));
  }

  // Instance method for info
  info(format: string | any, ...args: any[]): void {
    this.getLogger().info(log.formatString(format, args));
  }

  static log(format: string | any, ...args: any[]): void {
    this.getLogger().info(this.formatString(format, args));
  }

  // Instance method for log
  log(format: string | any, ...args: any[]): void {
    this.getLogger().info(log.formatString(format, args));
  }

  static print(format: string | any, ...args: any[]): void {
    this.getLogger().info(this.formatString(format, args));
  }

  // Instance method for print
  print(format: string | any, ...args: any[]): void {
    this.getLogger().info(log.formatString(format, args));
  }

  // Warn level logs
  static warn(format: string | any, ...args: any[]): void {
    this.getLogger().log(LogLevel.WARN, this.formatString(format, args));
  }

  // Instance method for warn
  warn(format: string | any, ...args: any[]): void {
    this.getLogger().log(LogLevel.WARN, log.formatString(format, args));
  }

  // Error level logs
  static error(format: string | any, ...args: any[]): void {
    this.getLogger().log(LogLevel.ERROR, this.formatString(format, args));
  }

  // Instance method for error
  error(format: string | any, ...args: any[]): void {
    this.getLogger().log(LogLevel.ERROR, log.formatString(format, args));
  }

  // Helper formatting functions
  private static formatMessage(message: any, args: any[]): string {
    if (args.length === 0) {
      return typeof message === 'string' ? message : JSON.stringify(message);
    }
    return [message, ...args]
      .map(arg => {
        if (typeof arg === 'string') return arg;
        try {
          return JSON.stringify(arg);
        } catch (e) {
          return `[Circular or Non-Serializable Object]`;
        }
      })
      .join(' ');
  }

  private static formatString(format: string | any, args: any[]): string {
    // First ensure format is a string, otherwise convert it to string
    if (typeof format !== 'string') {
      return String(format) + args.map(arg => ` ${arg}`).join('');
    }

    // Track used parameter indices
    const usedIndices = new Set<number>();

    // Replace all placeholders
    let result = args.reduce((msg, arg, i) => {
      const placeholder = `{${i}}`;
      if (msg.includes(placeholder)) {
        usedIndices.add(i);
        return msg.split(placeholder).join(typeof arg === 'object' ? JSON.stringify(arg) : String(arg));
      }
      return msg;
    }, format);

    // Append unused parameters
    if (usedIndices.size < args.length) {
      const unusedArgs = args.filter((_, i) => !usedIndices.has(i));
      if (unusedArgs.length <= 0) {
        return result;
      }

      result += unusedArgs
        .map(arg => {
          if (typeof arg === 'object') {
            try {
              return ` ${JSON.stringify(arg)}`;
            } catch (e) {
              return ` ${arg}`;
            }
          }
          return ` ${arg}`;
        })
        .join('');
    }

    return result;
  }
}
