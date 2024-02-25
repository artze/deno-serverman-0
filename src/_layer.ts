import type { RequestHandlerFn } from "./app.ts";
import type { HttpMethod } from "@src/_http_methods.ts";

export interface Layer {
  handlerFn: RequestHandlerFn;
  pathname: string;
  method?: HttpMethod;
}

export function createLayer(
  pathname: string,
  handlerFn: RequestHandlerFn,
  method?: HttpMethod
): Layer {
  const layer: Layer = { pathname, handlerFn };
  if (method) {
    layer.method = method;
  }
  return layer;
}
