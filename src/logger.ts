/**
 * VY Prompt Master - Logging System
 * Centralized logging with different log levels and formatting
 */

import chalk from 'chalk';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerOptions {
  level?: LogLevel;
  prefix?: string;
  enabled?: boolean;
}

export class Logger {
  private level: LogLevel;
  private prefix: string;
  private enabled: boolean;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level || 'info';
    this.prefix = options.prefix || '';
    this.enabled = options.enabled !== undefined ? options.enabled : true;
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) return false;

    const levelOrder: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levelOrder.indexOf(this.level);
    const messageLevelIndex = levelOrder.indexOf(level);

    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    const levelColors: Record<LogLevel, typeof chalk> = {
      debug: chalk.gray,
      info: chalk.blue,
      warn: chalk.yellow,
      error: chalk.red,
    };

    const levelLabel = level.toUpperCase().padEnd(5);
    const coloredLevel = levelColors[level](levelLabel);

    return `${coloredLevel} [${timestamp}]${this.prefix ? ` ${this.prefix}` : ''} ${message}`;
  }

  debug(message: string): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message));
    }
  }

  info(message: string): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message));
    }
  }

  warn(message: string): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message));
    }
  }

  error(message: string): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message));
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

// Global logger instance
export const logger = new Logger();