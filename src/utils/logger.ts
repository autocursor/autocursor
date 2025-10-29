/**
 * Logger System - Structured logging for debugging
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
}

class Logger {
  private logLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private listeners: Array<(entry: LogEntry) => void> = [];

  setLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  debug(category: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  info(category: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, category, message, data);
  }

  warn(category: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, category, message, data);
  }

  error(category: string, message: string, data?: any): void {
    this.log(LogLevel.ERROR, category, message, data);
  }

  private log(level: LogLevel, category: string, message: string, data?: any): void {
    if (level < this.logLevel) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      data,
    };

    this.logs.push(entry);
    
    // Maintain max size
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(entry));

    // Console output
    const levelStr = LogLevel[level];
    const prefix = `[${new Date(entry.timestamp).toISOString()}] [${levelStr}] [${category}]`;
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, data || '');
        break;
      case LogLevel.INFO:
        console.log(prefix, message, data || '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, data || '');
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, data || '');
        break;
    }
  }

  getLogs(category?: string): LogEntry[] {
    if (category) {
      return this.logs.filter(log => log.category === category);
    }
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  onLog(listener: (entry: LogEntry) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = new Logger();

