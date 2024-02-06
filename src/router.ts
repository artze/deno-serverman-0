import { Ctx } from "@src/_ctx.ts";
import { Layer, createLayer } from "@src/_layer.ts";
import { createRoute } from "@src/_route.ts";
import type { RequestHandlerFn } from "@src/app.ts";

type Use = {
  (...fns: RequestHandlerFn[]): void;
  (pathname: string, ...fns: RequestHandlerFn[]): void;
};

type MethodHandlers = {
  [key in Lowercase<Method>]: (
    pathname: string,
    ...fns: RequestHandlerFn[]
  ) => void;
};

export type Router = {
  handlerFn: (ctx: Ctx) => void;
  use: Use;
} & MethodHandlers;

const methods = ["DELETE", "GET", "PATCH", "POST", "PUT"] as const;
export type Method = typeof methods[number];

/**
 * TODO
 * Do we need to deal with this edge case?
 * router.use('/calico/xyz', () => {})
 * router.get('/calico/:id', () => {})
 */
export function matchRoute({
  layerPathname,
  parentPathname,
  reqUrl,
}: {
  layerPathname: string;
  parentPathname: string;
  reqUrl: string;
}): boolean {
  const layerPathnameArr = layerPathname.split("/").filter((s) => s !== "");
  const parentPathnameArr = parentPathname.split("/").filter((s) => s !== "");
  let counter = 0;
  for (let i = 1; i < layerPathnameArr.length; i++) {
    if (
      layerPathnameArr.slice(0, i).join("/") ===
      parentPathnameArr.slice(-i).join("/")
    ) {
      counter = i;
      break;
    }
  }
  const trimmedLayerPathname = layerPathnameArr.slice(counter).join("/");
  let combinedPathname;
  if (trimmedLayerPathname === "*") {
    combinedPathname = parentPathname + trimmedLayerPathname;
  } else {
    combinedPathname = parentPathname + "/" + trimmedLayerPathname;
  }
  const layerPathnamePattern = new URLPattern({
    pathname: combinedPathname,
  });

  return layerPathnamePattern.test(reqUrl);
}

export function createRouter(): Router {
  const stack: Layer[] = [];

  const methodHandlers: MethodHandlers = {} as MethodHandlers;
  methods.forEach((m) => {
    methodHandlers[m.toLowerCase() as Lowercase<Method>] = function (
      pathname: string,
      ...fns: RequestHandlerFn[]
    ) {
      const route = createRoute(fns);
      stack.push(createLayer(pathname, route.handlerFn, m));
    };
  });

  function handlerFn(ctx: Ctx) {
    console.debug(stack);
    for (let i = 0; i < stack.length; i++) {
      const layer = stack[i];
      if (
        !matchRoute({
          layerPathname: layer.pathname,
          parentPathname: ctx.req.parentPathname,
          reqUrl: ctx.req.url,
        })
      ) {
        continue;
      }
      if (layer.method && ctx.req.method.toUpperCase() !== layer.method) {
        continue;
      }
      ctx.req.parentPathname =
        ctx.req.parentPathname + layer.pathname.replace("*", "");
      layer.handlerFn(ctx);
    }
  }

  function use(
    pathnameOrFn: string | RequestHandlerFn,
    ...fns: RequestHandlerFn[]
  ): void {
    let pathname = "*";
    const middlewareFns: RequestHandlerFn[] = [];
    if (typeof pathnameOrFn === "string") {
      pathname = `${pathnameOrFn}*`;
      middlewareFns.push(...fns);
    } else {
      middlewareFns.push(pathnameOrFn);
      if (fns.length > 0) {
        middlewareFns.push(...fns);
      }
    }
    for (let i = 0; i < middlewareFns.length; i++) {
      stack.push(createLayer(pathname, middlewareFns[i]));
    }
  }

  return {
    ...methodHandlers,
    use,
    handlerFn,
  };
}
