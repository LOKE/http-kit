import { Registry } from "prom-client";
import * as connectionMetrics from "./helpers/connection-metrics";
import * as metricsMiddleware from "./middleware/metrics";

export function registerMetrics(registry: Pick<Registry, "registerMetric">) {
  registry.registerMetric(connectionMetrics.connectionCount);
  registry.registerMetric(connectionMetrics.connections);
  registry.registerMetric(connectionMetrics.inFlightRequests);
  registry.registerMetric(connectionMetrics.unusedConnections);

  registry.registerMetric(metricsMiddleware.requestCounter);
  registry.registerMetric(metricsMiddleware.requestTimer);
}
