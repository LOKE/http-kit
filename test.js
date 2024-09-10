const express = require("express");
const { createServer } = require("http");
const { register } = require("prom-client");

const {
  graceful,
  instrumentConnections,
  createLoggingMiddleware,
  createErrorMiddleware,
  createMetricsMiddleware,
  registerMetrics,
  Router,
} = require("./dist");

registerMetrics(register);

const app = express();

app.use(createLoggingMiddleware(console));
app.use(createMetricsMiddleware());

app.get("/metrics", async (req, res) => res.send(await register.metrics()));

const router = new Router();

router.get("/", ({ req, res }) => res.send("done"));
router.get("/var/:myvar", ({ req, res, params }) => res.json(params.myvar));
router.get("/error", ({ req, res }) => {
  console.log(req.socket.address());
  throw new Error("Errorzz!!!");
});

app.use(router.createHandler());

app.use(createErrorMiddleware(console));

const server = createServer(app);

instrumentConnections(server);
const { shutdown } = graceful(server);

server.listen(3000);

setTimeout(shutdown, 60000);
