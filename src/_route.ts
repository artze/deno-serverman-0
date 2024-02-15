import type { Ctx } from "@src/_ctx.ts";
import { Layer, createLayer } from "@src/_layer.ts";
import type { RequestHandlerFn } from "@src/app.ts";

export function createRoute(fns: RequestHandlerFn[]) {
  const stack: Layer[] = [];
  for (let i = 0; i < fns.length; i++) {
    stack.push(createLayer("*", fns[i]));
  }

  async function handlerFn(ctx: Ctx) {
    for (let i = 0; i < stack.length; i++) {
      await stack[i].handlerFn(ctx);
    }
  }

  return {
    handlerFn,
  };
}
