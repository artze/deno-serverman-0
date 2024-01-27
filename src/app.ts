import { Router, createRouter } from "@src/router.ts";
import { Ctx, createCtx } from "@src/ctx.ts";

export type MiddlewareFn = (ctx: Ctx) => void;

export function createApp() {
  let appRouter: Router;

  function appHandlerFn(req: Request) {
    console.debug("reqUrl", req.url);
    if (!appRouter) {
      console.warn("No router present");
      return new Response(null, { status: 501 });
    }
    const ctx = createCtx(req);
    appRouter.handlerFn(ctx);
    return new Response(ctx.res.body, { status: ctx.res.status });
  }

  function listen({ port }: { port: number }) {
    Deno.serve({ port }, appHandlerFn);
  }

  function use(...middlewareFns: MiddlewareFn[]): void;
  function use(...routerHandlerFns: MiddlewareFn[]): void;
  function use(path: string, ...fns: MiddlewareFn[]): void;
  function use(
    pathOrMiddlewareFn: string | MiddlewareFn,
    ...fns: MiddlewareFn[]
  ): void {
    if (!appRouter) {
      appRouter = createRouter();
    }
    if (typeof pathOrMiddlewareFn === "string") {
      appRouter.use(pathOrMiddlewareFn, ...fns);
    } else {
      appRouter.use(pathOrMiddlewareFn, ...fns);
    }
  }

  return {
    listen,
    use,
  };
}
