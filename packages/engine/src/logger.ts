type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  level: LogLevel;
  namespace: string;
  message: string;
  data?: Record<string, unknown>;
}

function isDevMode(): boolean {
  try {
    const g = globalThis as Record<string, unknown>;
    const proc = g.process as { env?: Record<string, string> } | undefined;
    return proc?.env?.NODE_ENV !== 'production';
  } catch {
    return true;
  }
}

const ENABLED = isDevMode();

/**
 * Create a namespaced console logger that is silent in production.
 * @param namespace Prefix shown in every log line, e.g. "[Engine]".
 * @returns An object with error, warn, info, and debug methods.
 */
function createLogger(namespace: string) {
  function log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (!ENABLED) return;
    const prefix = `[${namespace}]`;
    switch (level) {
      case 'error':
        // biome-ignore lint/suspicious/noConsole: logger is the single approved console wrapper
        console.error(prefix, message, data ?? '');
        break;
      case 'warn':
        // biome-ignore lint/suspicious/noConsole: logger is the single approved console wrapper
        console.warn(prefix, message, data ?? '');
        break;
      case 'info':
        // biome-ignore lint/suspicious/noConsole: logger is the single approved console wrapper
        console.info(prefix, message, data ?? '');
        break;
      case 'debug':
        // biome-ignore lint/suspicious/noConsole: logger is the single approved console wrapper
        console.debug(prefix, message, data ?? '');
        break;
    }
  }

  return {
    error: (msg: string, data?: Record<string, unknown>) => log('error', msg, data),
    warn: (msg: string, data?: Record<string, unknown>) => log('warn', msg, data),
    info: (msg: string, data?: Record<string, unknown>) => log('info', msg, data),
    debug: (msg: string, data?: Record<string, unknown>) => log('debug', msg, data),
  };
}

export { createLogger };
export type { LogLevel, LogEntry };
