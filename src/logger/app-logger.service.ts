import { Injectable, LoggerService, LogLevel } from '@nestjs/common';

type LogMetadata = Record<string, unknown>;

function isPlainObject(value: unknown): value is LogMetadata {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function resolveLogLevels(value: string | undefined): LogLevel[] {
  const allowedLevels: LogLevel[] = [
    'log',
    'error',
    'warn',
    'debug',
    'verbose',
    'fatal',
  ];

  if (!value) {
    return ['log', 'error', 'warn', 'debug', 'verbose', 'fatal'];
  }

  const levels = value
    .split(',')
    .map((level) => level.trim() as LogLevel)
    .filter((level) => allowedLevels.includes(level));

  return levels.length > 0 ? levels : ['log', 'error', 'warn'];
}

@Injectable()
export class AppLoggerService implements LoggerService {
  private readonly logLevels = new Set(resolveLogLevels(process.env.LOG_LEVEL));

  log(message: unknown, ...optionalParams: unknown[]) {
    this.write('log', message, optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]) {
    this.write('error', message, optionalParams);
  }

  warn(message: unknown, ...optionalParams: unknown[]) {
    this.write('warn', message, optionalParams);
  }

  debug(message: unknown, ...optionalParams: unknown[]) {
    this.write('debug', message, optionalParams);
  }

  verbose(message: unknown, ...optionalParams: unknown[]) {
    this.write('verbose', message, optionalParams);
  }

  fatal(message: unknown, ...optionalParams: unknown[]) {
    this.write('fatal', message, optionalParams);
  }

  setLogLevels(levels: LogLevel[]) {
    this.logLevels.clear();

    for (const level of levels) {
      this.logLevels.add(level);
    }
  }

  logHttpRequest(metadata: LogMetadata) {
    this.write('log', 'HTTP request completed', [metadata], 'HTTP');
  }

  logHttpError(message: string, metadata: LogMetadata) {
    this.write('error', message, [metadata], 'HTTP');
  }

  private write(
    level: LogLevel,
    message: unknown,
    optionalParams: unknown[] = [],
    context = 'Application',
  ) {
    if (!this.logLevels.has(level)) {
      return;
    }

    const payload: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      level,
      pid: process.pid,
      context,
      message: this.normalizeMessage(message),
    };

    const extra = this.extractOptionalParams(optionalParams);

    if (extra.context) {
      payload.context = extra.context;
    }

    if (extra.trace) {
      payload.trace = extra.trace;
    }

    if (extra.metadata) {
      payload.metadata = extra.metadata;
    }

    const line = `${JSON.stringify(payload)}\n`;

    if (level === 'error' || level === 'fatal') {
      process.stderr.write(line);
      return;
    }

    process.stdout.write(line);
  }

  private extractOptionalParams(optionalParams: unknown[]) {
    const params = [...optionalParams];
    let context: string | undefined;
    let trace: string | undefined;
    let metadata: unknown;

    if (params.length > 0 && typeof params[params.length - 1] === 'string') {
      context = params.pop() as string;
    }

    if (params.length > 0 && typeof params[0] === 'string') {
      trace = params.shift() as string;
    }

    if (params.length === 1) {
      metadata = params[0];
    } else if (params.length > 1) {
      metadata = params;
    }

    return {
      context,
      trace,
      metadata,
    };
  }

  private normalizeMessage(message: unknown) {
    if (message instanceof Error) {
      return message.message;
    }

    if (typeof message === 'string') {
      return message;
    }

    if (isPlainObject(message)) {
      return message;
    }

    return String(message);
  }
}
