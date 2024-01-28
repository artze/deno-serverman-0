import { Ctx } from "@src/_ctx.ts";
import { Layer, createLayer } from "@src/_layer.ts";
import { createRoute } from "@src/_route.ts";
import type { RequestHandlerFn } from "@src/app.ts";

export type Router = ReturnType<typeof createRouter>;
export type Method = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

export function createRouter() {
  const stack: Layer[] = [];

  function handlerFn(ctx: Ctx) {
    console.debug(stack);
    for (let i = 0; i < stack.length; i++) {
      const layer = stack[i];
      const layerPathnamePattern = new URLPattern({
        pathname: ctx.req.parentPathname + layer.pathname,
      });
      if (!layerPathnamePattern.test(ctx.req.url)) {
        continue;
      }
      if (layer.method && ctx.req.method.toUpperCase() !== layer.method) {
        continue;
      }
      ctx.req.parentPathname =
        ctx.req.parentPathname + layer.pathname.replace("*", "");
      layer.handlerFn(ctx);
    }
  }

  function use(...fns: RequestHandlerFn[]): void;
  function use(pathname: string, ...fns: RequestHandlerFn[]): void;
  function use(
    pathnameOrFn: string | RequestHandlerFn,
    ...fns: RequestHandlerFn[]
  ): void {
    let pathname = "*";
    const middlewareFns: RequestHandlerFn[] = [];
    if (typeof pathnameOrFn === "string") {
      pathname = `${pathnameOrFn}*`;
      middlewareFns.push(...fns);
    } else {
      middlewareFns.push(pathnameOrFn);
      if (fns.length > 0) {
        middlewareFns.push(...fns);
      }
    }
    for (let i = 0; i < middlewareFns.length; i++) {
      stack.push(createLayer(pathname, middlewareFns[i]));
    }
  }

  function get(pathname: string, ...fns: RequestHandlerFn[]) {
    const route = createRoute(fns);
    stack.push(createLayer(pathname, route.handleFn, "GET"));
  }

  return {
    get,
    use,
    handlerFn,
  };
}
