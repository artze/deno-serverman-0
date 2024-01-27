import { MiddlewareFn } from "@src/app.ts";
import { Ctx } from "@src/ctx.ts";
import { Layer, createLayer } from "@src/layer.ts";

export type Router = ReturnType<typeof createRouter>;

export function createRouter() {
  const stack: Layer[] = [];

  function handlerFn(ctx: Ctx) {
    console.debug(stack);
    for (let i = 0; i < stack.length; i++) {
      const reqPathname = new URL(ctx.req.url).pathname;
      const layer = stack[i];
      /** TODO needs to support first segment matching */
      if (layer.pathname === "/" || layer.pathname === reqPathname) {
        layer.handlerFn(ctx);
      }
    }
  }

  function use(...fns: MiddlewareFn[]): void;
  function use(pathname: string, ...fns: MiddlewareFn[]): void;
  function use(
    pathnameOrMiddlewareFn: string | MiddlewareFn,
    ...fns: MiddlewareFn[]
  ): void {
    let pathname = "*";
    const middlewareFns: MiddlewareFn[] = [];
    if (typeof pathnameOrMiddlewareFn === "string") {
      pathname = `${pathnameOrMiddlewareFn}/*`;
      middlewareFns.push(...fns);
    } else {
      middlewareFns.push(pathnameOrMiddlewareFn);
      if (fns.length > 0) {
        middlewareFns.push(...fns);
      }
    }
    for (let i = 0; i < middlewareFns.length; i++) {
      stack.push(createLayer(pathname, middlewareFns[i]));
    }
  }

  return {
    use,
    handlerFn,
  };
}
