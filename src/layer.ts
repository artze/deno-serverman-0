import type { MiddlewareFn } from "./app.ts";

export interface Layer {
  handlerFn: MiddlewareFn;
  pathname: string;
}

export function createLayer(pathname: string, handlerFn: MiddlewareFn): Layer {
  return {
    pathname,
    handlerFn,
  };
}
