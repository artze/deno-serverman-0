import type { RequestHandlerFn } from "./app.ts";
import type { Method } from "@src/router.ts";

export interface Layer {
  handlerFn: RequestHandlerFn;
  pathname: string;
  method?: Method;
}

export function createLayer(
  pathname: string,
  handlerFn: RequestHandlerFn,
  method?: Method
): Layer {
  const layer: Layer = { pathname, handlerFn };
  if (method) {
    layer.method = method;
  }
  return layer;
}
