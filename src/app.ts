import { Router, createRouter } from "@src/router.ts";
import { Ctx, createCtx } from "@src/ctx.ts";

export type RequestHandlerFn = (ctx: Ctx) => void;

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

  function use(...fns: RequestHandlerFn[]): void;
  function use(pathname: string, ...fns: RequestHandlerFn[]): void;
  function use(
    pathnameOrFn: string | RequestHandlerFn,
    ...fns: RequestHandlerFn[]
  ): void {
    if (!appRouter) {
      appRouter = createRouter();
    }
    if (typeof pathnameOrFn === "string") {
      appRouter.use(pathnameOrFn, ...fns);
    } else {
      appRouter.use(pathnameOrFn, ...fns);
    }
  }

  return {
    listen,
    use,
  };
}
