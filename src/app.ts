import { Router, createRouter } from "@src/router.ts";
import { Ctx, createCtx } from "@src/_ctx.ts";

export type RequestHandlerFn = (
  ctx: Ctx,
  next: () => Promise<void>
) => void | Promise<void>;
export type App = ReturnType<typeof createApp>;

function createResponse(ctx: Ctx): Response {
  const status = ctx.res.status
    ? ctx.res.status
    : ctx.res.body === undefined
    ? 404
    : 200;
  return new Response(ctx.res.body, { status });
}

export function createApp() {
  let appRouter: Router;

  async function appHandlerFn(req: Request) {
    console.debug("reqUrl", req.url);
    if (!appRouter) {
      console.warn("No router present");
      return new Response(null, { status: 501 });
    }
    const ctx = createCtx(req);
    await appRouter.handlerFn(ctx);
    return createResponse(ctx);
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
      appRouter.use("*", pathnameOrFn, ...fns);
    }
  }

  return {
    listen,
    use,
  };
}
