import type { Ctx } from "@src/_ctx.ts";
import { Layer, createLayer } from "@src/_layer.ts";
import type { RequestHandlerFn } from "@src/app.ts";

export function createRoute(fns: RequestHandlerFn[]) {
  const stack: Layer[] = [];
  for (let i = 0; i < fns.length; i++) {
    stack.push(createLayer("*", fns[i]));
  }

  async function handlerFn(ctx: Ctx, outerNext: () => Promise<void>) {
    let currentIdx = -1;
    async function next() {
      while (currentIdx < stack.length) {
        currentIdx++;
        if (currentIdx === stack.length) {
          break;
        }
        const layer = stack[currentIdx];
        return await layer.handlerFn(ctx, next);
      }
      /**
       * We have reached the end of stack, invoke next()
       * of outer stack
       */
      if (currentIdx === stack.length) {
        await outerNext();
      }
    }
    await next();
  }

  return {
    handlerFn,
  };
}
