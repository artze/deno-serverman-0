export interface Ctx {
  req: Request;
  res: {
    status?: number;
    body?: string;
  };
}

export function createCtx(req: Request): Ctx {
  return {
    req,
    res: {},
  };
}
