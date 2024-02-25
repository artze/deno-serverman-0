import type { App } from "@src/app.ts";
import { HttpMethod, httpMethods } from "@src/_http_methods.ts";

export interface TestServerResult {
  status: number;
  body: string;
}

type TestServerMethods = {
  [key in Lowercase<HttpMethod>]: (
    pathname: string,
    reqBody?: Record<string, unknown>
  ) => Promise<TestServerResult>;
};

export function createTestServer(app: App) {
  let hostnameInUse: string;
  let portInUse: number;
  const server = app.listen({
    port: 0,
    onListen: ({ hostname, port }) => {
      hostnameInUse = hostname;
      portInUse = port;
    },
  });
  const testServerMethods = {} as TestServerMethods;
  httpMethods.forEach((m) => {
    testServerMethods[m.toLowerCase() as Lowercase<HttpMethod>] =
      async function (
        pathname: string,
        reqBody?: Record<string, unknown>
      ): Promise<TestServerResult> {
        const res = await fetch(
          `http://${hostnameInUse}:${portInUse}${pathname}`,
          {
            method: m,
            body: JSON.stringify(reqBody),
          }
        );
        const result = {
          status: res.status,
          body: await res.text(),
        };
        await server.shutdown();
        return result;
      };
  });

  return { ...testServerMethods };
}
