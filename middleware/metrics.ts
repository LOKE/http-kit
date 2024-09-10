import { IncomingMessage, ServerResponse } from "http";
import onFinished from "on-finished";
import { Counter, Histogram } from "prom-client";
import { parse } from "url";
import { createDurationTimer, Next } from "./helpers";

const noop = () => undefined;

export const requestCounter = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests made.",
  labelNames: ["method", "path", "code"],
  registers: [],
});
export const requestTimer = new Histogram({
  name: "http_request_duration_seconds",
  help: "The HTTP request latencies in seconds.",
  labelNames: ["method", "path"],
  registers: [],
});

export function createMetricsMiddleware() {
  return (
    req: IncomingMessage & { routePath?: string },
    res: ServerResponse,
    next: Next = noop,
  ) => {
    const { method = "<NONE>", url = "" } = req; // grab url at the start before the router rewrites it
    const end = createDurationTimer(req);

    onFinished(res, () => {
      const { routePath } = req;
      const { statusCode } = res;

      const path = routePath || parse(url).pathname || "<NONE>";
      const [s, n] = end();
      const seconds = s + n / 1e9;

      requestCounter.inc({ method, path, code: statusCode });
      requestTimer.observe({ method, path }, seconds);
    });

    next();
  };
}
