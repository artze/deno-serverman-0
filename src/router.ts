import { Ctx } from "@src/_ctx.ts";
import { Layer, createLayer } from "@src/_layer.ts";
import { createRoute } from "@src/_route.ts";
import type { RequestHandlerFn } from "@src/app.ts";

type MethodHandlers = {
  [key in Lowercase<Method>]: (
    pathname: string,
    ...fns: RequestHandlerFn[]
  ) => void;
};

export type Router = ReturnType<typeof createRouter>;

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
  const strMatchResult = layerPathname.match(/([^*]*)(\*{1,2}$)?/);
  if (!strMatchResult) {
    throw new Error("layerPathname cannot be parsed");
  }
  /** catch-all app.use() registered, always return true */
  if (layerPathname === "**") {
    return true;
  }
  const [, layerPathnameWithoutAsterisk, asterisk] = strMatchResult;
  const layerPathnameArr = layerPathnameWithoutAsterisk
    .split("/")
    .filter((s) => s !== "");
  const parentPathnameArr = parentPathname.split("/").filter((s) => s !== "");
  let counter = 0;
  for (let i = 1; i <= layerPathnameArr.length; i++) {
    if (
      layerPathnameArr.slice(0, i).join("/") ===
      parentPathnameArr.slice(-i).join("/")
    ) {
      counter = i;
      break;
    }
  }
  let processedLayerPathname = layerPathnameArr.slice(counter).join("/");
  if (processedLayerPathname.length > 0) {
    processedLayerPathname = "/" + processedLayerPathname;
  }
  const layerPathnamePattern = new URLPattern({
    pathname:
      parentPathname + processedLayerPathname + (asterisk ? asterisk : ""),
  });

  return layerPathnamePattern.test(reqUrl);
}

export function createRouter() {
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

  /**
   * TODO What happens if no match found?
   */
  async function handlerFn(ctx: Ctx) {
    let currentIdx = -1;
    async function next() {
      while (currentIdx < stack.length) {
        currentIdx++;
        const layer = stack[currentIdx];
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
          ctx.req.parentPathname + layer.pathname.replace(/\*{1,2}/, "");
        await layer.handlerFn(ctx, next);
        break;
      }
    }
    await next();
  }

  function use(...fns: RequestHandlerFn[]): void;
  function use(pathname: string, ...fns: RequestHandlerFn[]): void;
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
