const assert = require("node:assert/strict");
const { createServer } = require("node:http");
const { test } = require("node:test");
const { Router } = require("./dist");

test("Router matches parameterized paths through path-to-regexp", async (t) => {
  const router = new Router();
  router.get("/items/:id", ({ params, res }) => res.end(params.id));
  const server = createServer(router.createHandler());
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(
    () =>
      new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  );

  const address = server.address();
  assert.ok(address && typeof address === "object");
  const response = await fetch(`http://127.0.0.1:${address.port}/items/42`);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "42");
});
