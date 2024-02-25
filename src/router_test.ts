import { assertEquals } from "@src/deps.ts";

import type { Ctx } from "@src/_ctx.ts";
import type { HttpMethod } from "@src/_http_methods.ts";
import { createRouter, matchRoute } from "@src/router.ts";

Deno.test(
  {
    name: "matchRoute()",
  },
  async (t) => {
    const testCases = [
      {
        name: "no intersections - without wildcard 1",
        layerPathname: "/cat",
        parentPathname: "",
        reqUrl: "http://abc.com/cat",
        expected: true,
      },
      {
        name: "no intersections - without wildcard 2",
        layerPathname: "/calico",
        parentPathname: "/cat",
        reqUrl: "http://abc.com/cat/calico",
        expected: true,
      },
      {
        name: "no intersections - without wildcard 3",
        layerPathname: "/calico",
        parentPathname: "/cat",
        reqUrl: "http://abc.com/cat",
        expected: false,
      },
      {
        name: "no intersections - with wildcard 1",
        layerPathname: "*",
        parentPathname: "",
        reqUrl: "http://abc.com/cat",
        expected: true,
      },
      {
        name: "no intersections - with wildcard 2",
        layerPathname: "/calico*",
        parentPathname: "/cat",
        reqUrl: "http://abc.com/cat/calico",
        expected: true,
      },
      {
        name: "no intersections - with wildcard 3",
        layerPathname: "/calico*",
        parentPathname: "/cat",
        reqUrl: "http://abc.com/cat/calico/foobar",
        expected: true,
      },
      {
        name: "no intersections - with wildcard 4",
        layerPathname: "/calico/:id",
        parentPathname: "/cat",
        reqUrl: "http://abc.com/cat/calico/3",
        expected: true,
      },
      {
        name: "no intersections - with wildcard 5",
        layerPathname: "/calico*",
        parentPathname: "/cat",
        reqUrl: "http://abc.com/cat",
        expected: false,
      },
      {
        name: "with intersections - without wildcard 1",
        layerPathname: "/calico/profile",
        parentPathname: "/cat/calico",
        reqUrl: "http://abc.com/cat/calico/profile",
        expected: true,
      },
      {
        name: "with intersections - without wildcard 2",
        layerPathname: "/calico/profile/8",
        parentPathname: "/cat/calico/profile",
        reqUrl: "http://abc.com/cat/calico/profile/8",
        expected: true,
      },
      {
        name: "with intersections - without wildcard 3",
        layerPathname: "/calico/profile",
        parentPathname: "/cat/calico/foobar",
        reqUrl: "http://abc.com/cat/calico/foobar",
        expected: false,
      },
      {
        name: "with intersections - with wildcard 1",
        layerPathname: "/cat/calico*",
        parentPathname: "/cat",
        reqUrl: "http://abc.com/cat/calico/foobar",
        expected: true,
      },
      {
        name: "with intersections - with wildcard 2",
        layerPathname: "/calico/profile*",
        parentPathname: "/cat/calico/profile",
        reqUrl: "http://abc.com/cat/calico/profile",
        expected: true,
      },
      {
        name: "with intersections - with wildcard 3",
        layerPathname: "/calico/profile*",
        parentPathname: "/cat/calico/profile",
        reqUrl: "http://abc.com/cat/calico/profile/name",
        expected: true,
      },
      {
        name: "with intersections - with wildcard 4",
        layerPathname: "/calico/profile*",
        parentPathname: "/cat/calico/profile",
        reqUrl: "http://abc.com/cat/calico",
        expected: false,
      },
    ];
    for (const testCase of testCases) {
      await t.step(testCase.name, () => {
        const r = matchRoute({
          layerPathname: testCase.layerPathname,
          parentPathname: testCase.parentPathname,
          reqUrl: testCase.reqUrl,
        });
        assertEquals(r, testCase.expected);
      });
    }
  }
);

function createMockCtx(pathname: string, method: HttpMethod): Ctx {
  return {
    req: {
      method,
      url: new URL(pathname, "http://localhost:3000").toString(),
      parentPathname: "",
    },
    res: {},
  } as Ctx;
}

function asyncOp() {
  return new Promise(function (resolve) {
    setTimeout(resolve, 0);
  });
}

Deno.test(
  {
    name: "router.use() without path",
  },
  async () => {
    const callLog: number[] = [];
    const router = createRouter();
    const ctx = createMockCtx("/", "GET");
    router.use(() => {
      callLog.push(0);
    });
    await router.handlerFn(ctx);
    assertEquals(callLog, [0]);
  }
);

Deno.test(
  {
    name: "router.use() with matching path",
  },
  async () => {
    const callLog: number[] = [];
    const router = createRouter();
    const ctx = createMockCtx("/foobar", "GET");
    router.use("/foobar", () => {
      callLog.push(0);
    });
    await router.handlerFn(ctx);
    assertEquals(callLog, [0]);
  }
);

Deno.test(
  {
    name: "router.use() with non-matching path",
  },
  async () => {
    const callLog: number[] = [];
    const router = createRouter();
    const ctx = createMockCtx("/", "GET");
    router.use("/foobar", () => {
      callLog.push(0);
    });
    await router.handlerFn(ctx);
    assertEquals(callLog, []);
  }
);

Deno.test(
  {
    name: "router.post() with match",
  },
  async () => {
    const callLog: number[] = [];
    const router = createRouter();
    const ctx = createMockCtx("/foobar", "POST");
    router.post("/foobar", () => {
      callLog.push(0);
    });
    router.get("/foobar", () => {
      callLog.push(1);
    });
    await router.handlerFn(ctx);
    assertEquals(callLog, [0]);
  }
);

Deno.test(
  {
    name: "router.put() with match",
  },
  async () => {
    const callLog: number[] = [];
    const router = createRouter();
    const ctx = createMockCtx("/foobar", "PUT");
    router.put("/foobar", () => {
      callLog.push(0);
    });
    router.get("/foobar", () => {
      callLog.push(1);
    });
    await router.handlerFn(ctx);
    assertEquals(callLog, [0]);
  }
);

Deno.test(
  {
    name: "router.patch() with match",
  },
  async () => {
    const callLog: number[] = [];
    const router = createRouter();
    const ctx = createMockCtx("/foobar", "PATCH");
    router.patch("/foobar", () => {
      callLog.push(0);
    });
    router.get("/foobar", () => {
      callLog.push(1);
    });
    await router.handlerFn(ctx);
    assertEquals(callLog, [0]);
  }
);

Deno.test(
  {
    name: "router.delete() with match",
  },
  async () => {
    const callLog: number[] = [];
    const router = createRouter();
    const ctx = createMockCtx("/foobar", "DELETE");
    router.delete("/foobar", () => {
      callLog.push(0);
    });
    router.get("/foobar", () => {
      callLog.push(1);
    });
    await router.handlerFn(ctx);
    assertEquals(callLog, [0]);
  }
);

Deno.test(
  {
    name: "router with multiple matches",
  },
  async () => {
    const callLog: number[] = [];
    const router = createRouter();
    const ctx = createMockCtx("/foobar", "GET");
    router.use(async (_ctx, next) => {
      callLog.push(0);
      await next();
    });
    router.use("/foobar", async (_ctx, next) => {
      callLog.push(1);
      await next();
    });
    router.get("/foobar", async (_ctx, next) => {
      callLog.push(2);
      await next();
    });
    router.get("/foo", async (_ctx, next) => {
      callLog.push(3);
      await next();
    });
    /** Simulate catch-all app.use() */
    router.use("*", () => {
      callLog.push(4);
    });
    await router.handlerFn(ctx);
    assertEquals(callLog, [0, 1, 2, 4]);
  }
);

Deno.test(
  {
    name: "router with sub-routers and multiple matches",
  },
  async () => {
    const callLog: number[] = [];
    const router = createRouter();
    const subRouter = createRouter();
    const ctx = createMockCtx("/foobar/sub", "GET");
    router.use(async (_ctx, next) => {
      callLog.push(0);
      await next();
    });
    subRouter.use(async (_ctx, next) => {
      callLog.push(1);
      await next();
    });
    subRouter.use("/abc", async (_ctx, next) => {
      callLog.push(2);
      await next();
    });
    subRouter.get("/sub", async (_ctx, next) => {
      callLog.push(3);
      await next();
    });
    router.use("/foobar", subRouter.handlerFn);
    await router.handlerFn(ctx);
    assertEquals(callLog, [0, 1, 3]);
  }
);

Deno.test({ name: "router with async requestHandler" }, async () => {
  const callLog: number[] = [];
  const router = createRouter();
  const ctx = createMockCtx("/foobar", "GET");
  router.use(async (_ctx, next) => {
    callLog.push(0);
    await next();
  });
  router.use(async (_ctx, next) => {
    await asyncOp();
    callLog.push(1);
    await next();
  });
  router.get("/foobar", async (_ctx, next) => {
    await asyncOp();
    callLog.push(2);
    await next();
  });
  await router.handlerFn(ctx);
  assertEquals(callLog, [0, 1, 2]);
});

Deno.test(
  { name: "router.use() catch-all after mw with specific paths" },
  async () => {
    const callLog: number[] = [];
    const router = createRouter();
    const subRouter = createRouter();
    const ctx = createMockCtx("/foobar", "GET");
    subRouter.use(async (_ctx, next) => {
      callLog.push(0);
      await next();
    });
    subRouter.get("/", async (_ctx, next) => {
      callLog.push(1);
      await next();
    });
    router.use("/foobar", subRouter.handlerFn);
    /** Simulate catch-all app.use() */
    router.use("*", async (_ctx, next) => {
      callLog.push(2);
      await next();
    });
    await router.handlerFn(ctx);
    assertEquals(callLog, [0, 1, 2]);
  }
);

Deno.test({ name: "router control flow with next()" }, async () => {
  const callLog: number[] = [];
  const router = createRouter();
  const subRouter = createRouter();
  const ctx = createMockCtx("/foobar", "GET");
  router.use(async (_ctx, next) => {
    callLog.push(0);
    await next();
    callLog.push(5);
  });
  subRouter.use(async (_ctx, next) => {
    callLog.push(1);
    await next();
    callLog.push(4);
  });
  subRouter.get("/", async (_ctx, next) => {
    callLog.push(2);
    await next();
    callLog.push(3);
  });
  router.use("/foobar", subRouter.handlerFn);
  await router.handlerFn(ctx);
  assertEquals(callLog, [0, 1, 2, 3, 4, 5]);
});
