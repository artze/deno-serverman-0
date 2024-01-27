import { MiddlewareFn } from "@src/app.ts";
import { Ctx } from "@src/ctx.ts";
import { Layer, createLayer } from "@src/layer.ts";

export type Router = ReturnType<typeof createRouter>;

export function createRouter() {
  const stack: Layer[] = [];

  function handlerFn(ctx: Ctx) {
    console.log(stack);
    for (let i = 0; i < stack.length; i++) {
      const reqPath = new URL(ctx.req.url).pathname;
      const layer = stack[i];
      /** TODO needs to support first segment matching */
      if (layer.path === "/" || layer.path === reqPath) {
        layer.handlerFn(ctx);
      }
    }
  }

  function use(...fns: MiddlewareFn[]): void;
  function use(path: string, ...fns: MiddlewareFn[]): void;
  function use(
    pathOrMiddlewareFn: string | MiddlewareFn,
    ...fns: MiddlewareFn[]
  ): void {
    let path = "/";
    const middlewareFns: MiddlewareFn[] = [];
    if (typeof pathOrMiddlewareFn === "string") {
      path = pathOrMiddlewareFn;
      middlewareFns.push(...fns);
    } else {
      middlewareFns.push(pathOrMiddlewareFn);
      if (fns.length > 0) {
        middlewareFns.push(...fns);
      }
    }
    for (let i = 0; i < middlewareFns.length; i++) {
      stack.push(createLayer(path, middlewareFns[i]));
    }
  }

  return {
    use,
    handlerFn,
  };
}
