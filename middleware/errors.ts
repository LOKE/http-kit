import { IncomingMessage, ServerResponse } from "http";
import { HttpError, Next } from "./helpers";

interface ErrorLogger {
  error(msg: string): void;
}

export function createErrorMiddleware(logger: ErrorLogger) {
  return (
    err: HttpError,
    req: IncomingMessage,
    res: ServerResponse,
    next: Next
  ) => {
    const statusCode = err.statusCode || err.status || 500;

    if (statusCode >= 500) {
      logger.error(err.stack || err.message);
    }

    if (err.expose) {
      writeError(res, err, statusCode);
      return;
    }

    writeError(
      res,
      {
        message: "Internal Error - Please contact support.",
        code: "INTERNAL_ERROR"
      },
      statusCode
    );
  };
}

function writeError(
  res: ServerResponse,
  err: { message: string; code?: string },
  statusCode: number
) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      message: err.message,
      code: err.code
    })
  );
}
