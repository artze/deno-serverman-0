import { assertEquals } from "@src/deps.ts";

import { createTestServer } from "@src/_test_util.ts";
import { createApp } from "@src/app.ts";
import { createRouter } from "@src/router.ts";

Deno.test(
  {
    name: "res.status when no matching path",
  },
  async () => {
    const app = createApp();
    const router = createRouter();
    router.get("/", (ctx) => {
      ctx.res.body = "foobar";
    });
    app.use("/foobar", router.handlerFn);
    const testServer = createTestServer(app);
    const result = await testServer.get("/abcd");
    assertEquals(result.status, 404);
  }
);

Deno.test(
  {
    name: "res.status when status code set within middleware",
  },
  async () => {
    const app = createApp();
    const router = createRouter();
    router.get("/", (ctx) => {
      ctx.res.status = 201;
    });
    app.use("/foobar", router.handlerFn);
    const testServer = createTestServer(app);
    const result = await testServer.get("/foobar");
    assertEquals(result.status, 201);
  }
);

Deno.test(
  {
    name: "res.status when status code unset but res body is set within middleware",
  },
  async () => {
    const app = createApp();
    const router = createRouter();
    router.get("/", (ctx) => {
      ctx.res.body = "thing";
    });
    app.use("/foobar", router.handlerFn);
    const testServer = createTestServer(app);
    const result = await testServer.get("/foobar");
    assertEquals(result.status, 200);
  }
);

Deno.test(
  {
    name: "res.status when both status code and res body unset",
  },
  async () => {
    const app = createApp();
    const router = createRouter();
    router.get("/", () => {});
    app.use("/foobar", router.handlerFn);
    const testServer = createTestServer(app);
    const result = await testServer.get("/foobar");
    assertEquals(result.status, 404);
  }
);
