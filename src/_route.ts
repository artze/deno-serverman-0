import type { Ctx } from "@src/_ctx.ts";
import { Layer, createLayer } from "@src/_layer.ts";
import type { RequestHandlerFn } from "@src/app.ts";

export function createRoute(fns: RequestHandlerFn[]) {
  const stack: Layer[] = [];
  for (let i = 0; i < fns.length; i++) {
    stack.push(createLayer("*", fns[i]));
  }

  function handlerFn(ctx: Ctx) {
    console.debug(stack);
    for (let i = 0; i < stack.length; i++) {
      stack[i].handlerFn(ctx);
    }
  }

  return {
    handlerFn,
  };
}
