export type LogContext = Record<string, unknown>;

export interface Logger {
  info(event: string, context?: LogContext): void;
  warn(event: string, context?: LogContext): void;
  error(event: string, context?: LogContext): void;
}

function write(level: "info" | "warn" | "error", event: string, context: LogContext = {}) {
  const entry = JSON.stringify({
    level,
    event,
    ...context,
    timestamp: new Date().toISOString(),
  });

  if (level === "error") console.error(entry);
  else if (level === "warn") console.warn(entry);
  else console.info(entry);
}

export const logger: Logger = {
  info: (event, context) => write("info", event, context),
  warn: (event, context) => write("warn", event, context),
  error: (event, context) => write("error", event, context),
};
