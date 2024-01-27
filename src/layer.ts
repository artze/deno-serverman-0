import type { MiddlewareFn } from "./app.ts";

export interface Layer {
  handlerFn: MiddlewareFn;
  path: string;
}

export function createLayer(path: string, handlerFn: MiddlewareFn): Layer {
  return {
    path,
    handlerFn,
  };
}
