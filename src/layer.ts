import type { RequestHandlerFn } from "./app.ts";

export interface Layer {
  handlerFn: RequestHandlerFn;
  pathname: string;
}

export function createLayer(
  pathname: string,
  handlerFn: RequestHandlerFn
): Layer {
  return {
    pathname,
    handlerFn,
  };
}
