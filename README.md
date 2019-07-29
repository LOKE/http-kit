# LOKE HTTP Kit

A set of helpers and middleware for making http servers in node

## Usage

Middleware are most easily used with express

```
const express = require("express");

const app = express();
```

### createLoggingMiddleware(logger: Logger)

Add http logging, can be used with loke-logger v3 or just console;

```
const { createLoggingMiddleware } = require("@loke/http-kit");

app.use(createLoggingMiddleware(console));
```

### createErrorMiddleware(logger: Logger)

Add basic error formatting and logging, can be used with loke-logger v3 or just console;

```
const { createErrorMiddleware } = require("@loke/http-kit");

app.use(createErrorMiddleware(console));
```

### createMetricsMiddleware()

You need to register all metrics before hand using `registerMetrics`

```
const { createMetricsMiddleware, registerMetrics } = require("@loke/http-kit");
const promClient = require("prom-client");

registerMetrics(promClient.register);

app.use(createMetricsMiddleware());
```
