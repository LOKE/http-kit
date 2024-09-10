import chalk from "chalk";
import { IncomingMessage, ServerResponse } from "http";
import onFinished from "on-finished";
import { parse as parseUrl } from "url";
import { createDurationTimer, Next } from "./helpers";

const noop = () => undefined;

function getLogLevel(status: number) {
  if (status >= 500) {
    return "error";
  }
  if (status >= 400) {
    return "warn";
  }
  return "info";
}

interface Logger {
  info(msg: string): void;
  warn(msg: string): void;
  error(msg: string): void;
}

interface Options {
  name?: string;
  warnSlowThreshold?: number;
  criticalSlowThreshold?: number;
}

interface LoggableRequest extends IncomingMessage {
  ip?: string;
}

export function createLoggingMiddleware(logger: Logger, opts: Options = {}) {
  const { name, warnSlowThreshold = 100, criticalSlowThreshold = 200 } = opts;

  return (req: LoggableRequest, res: ServerResponse, next: Next = noop) => {
    const { method, url } = req;
    const end = createDurationTimer(req);

    onFinished(res, () => {
      const { statusCode } = res;
      const duration = end();

      const logLevel = getLogLevel(res.statusCode);
      const agentPrefix = parseUseragent(req.headers["user-agent"]);
      const { path } = parseUrl(url || "");

      logger[logLevel](
        [
          name,
          chalk.blue(agentPrefix),
          req.ip,
          method,
          path,
          formatResponseStatus(statusCode),
          // req.error ? req.error.message : undefined,
          formatResponseTime(
            duration,
            warnSlowThreshold,
            criticalSlowThreshold,
          ),
        ]
          .filter(Boolean)
          .join(" "),
      );
    });

    next();
  };
}

const NO_AGENT_STRING = "NoUseragent";

function parseUseragent(agentStr?: string) {
  if (!agentStr) {
    return NO_AGENT_STRING;
  }
  return agentStr.split(" ")[0] || NO_AGENT_STRING;
}

function formatResponseTime(
  duration: [number, number],
  warn: number,
  critical: number,
): string {
  const [s, n] = duration;
  const milliseconds = s * 1e3 + n / 1e6;
  const formatted = milliseconds.toFixed(2) + "ms";

  if (milliseconds >= critical) {
    return chalk.red(formatted);
  }
  if (milliseconds >= warn) {
    return chalk.yellow(formatted);
  }
  return formatted;
}

function formatResponseStatus(statusCode: number): string {
  const statusStr = String(statusCode);

  if (statusCode >= 500) {
    return chalk.red(statusStr);
  }
  if (statusCode >= 400) {
    return chalk.yellow(statusStr);
  }
  return statusStr;
}
