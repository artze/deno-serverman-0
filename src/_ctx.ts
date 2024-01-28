export interface Ctx {
  req: Request & { parentPathname: string };
  res: {
    status?: number;
    body?: string;
  };
}

export function createCtx(req: Request): Ctx {
  return {
    /**
     * TODO
     * Object spread operator does not work here. Find out why.
     * https://stackoverflow.com/questions/32925460/object-spread-vs-object-assign
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
     *
     * - Experiment with using spread with class instances
     */
    req: Object.assign(req, { parentPathname: "" }),
    res: {},
  };
}
