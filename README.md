# LOKE HTTP Kit

A set of helpers and middleware for making http servers in node

## Usage

Middleware are most easily used with express

```js
const express = require("express");

const app = express();
```

### createLoggingMiddleware(logger: Logger)

Add http logging, can be used with loke-logger v3 or just console;

```js
const { createLoggingMiddleware } = require("@loke/http-kit");

app.use(createLoggingMiddleware(console));
```

### createErrorMiddleware(logger: Logger)

Add basic error formatting and logging, can be used with loke-logger v3 or just console;

```js
const { createErrorMiddleware } = require("@loke/http-kit");

app.use(createErrorMiddleware(console));
```

### createMetricsMiddleware()

You need to register all metrics before hand using `registerMetrics`

```js
const { createMetricsMiddleware, registerMetrics } = require("@loke/http-kit");
const promClient = require("prom-client");

registerMetrics(promClient.register);

app.use(createMetricsMiddleware());
```

### Class: Router

A basic router similar to the one provided by express

key differences are:

- handles async errors
- can't be nested, (can be nested inside a express `use` though)
- supports metrics

```js
const { Router } = require("@loke/http-kit");

const router = new Router();

router.get("/foo/:bar", async ({ req, res, params }) => {
  // get a path param
  const foo = params.foo;

  // req, res are just the standard node/express objects
  // so this could also be `res.json({ foo })`
  res.send(`Hello, ${foo}`);
});

app.use(router.createHandler());
```

### graceful

```js
const { graceful } = require("@loke/http-kit");

const PORT = 8000;

async function main() {
  const server = http.createServer(app);

  const { shutdown } = graceful(server);

  server.listen(PORT);

  // Await stop signal
  await stopSignal();

  // Finish current requests then stop http server
  await shutdown();
}

const stopSignal = () =>
  new Promise((resolve) => {
    process.once("SIGINT", resolve);
    process.once("SIGTERM", resolve);
  });

main();
```
