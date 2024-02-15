import { assertEquals } from "@src/deps.ts";

import type { Ctx } from "@src/_ctx.ts";
import { Method, createRouter, matchRoute } from "@src/router.ts";

Deno.test(
  {
    name: "matchRoute()",
    ignore: true,
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

function createMockCtx(pathname: string, method: Method): Ctx {
  return {
    req: {
      method,
      url: new URL(pathname, "http://localhost:3000").toString(),
      parentPathname: "",
    },
    res: {},
  } as Ctx;
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
    router.use(() => {
      callLog.push(0);
    });
    router.use("/foobar", () => {
      callLog.push(1);
    });
    router.get("/foobar", () => {
      callLog.push(2);
    });
    router.get("/foo", () => {
      callLog.push(3);
    });
    await router.handlerFn(ctx);
    assertEquals(callLog, [0, 1, 2]);
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
    router.use(() => {
      callLog.push(0);
    });
    subRouter.use(() => {
      callLog.push(1);
    });
    subRouter.use("/abc", () => {
      callLog.push(2);
    });
    subRouter.get("/sub", () => {
      callLog.push(3);
    });
    router.use("/foobar", subRouter.handlerFn);
    await router.handlerFn(ctx);
    assertEquals(callLog, [0, 1, 3]);
  }
);
