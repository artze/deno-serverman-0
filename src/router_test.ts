import { assertEquals } from "@src/deps.ts";

import { matchRoute } from "@src/router.ts";

Deno.test("matchRoute()", async (t) => {
  const testCases = [
    {
      name: "no intersections - without wildcard 1",
      layerPathname: "/cat",
      parentPathname: "",
      reqUrl: "http://abc.com/cat",
      expected: true,
    },
    {
      name: "no intersections - without wildcard 2",
      layerPathname: "/calico",
      parentPathname: "/cat",
      reqUrl: "http://abc.com/cat/calico",
      expected: true,
    },
    {
      name: "no intersections - without wildcard 3",
      layerPathname: "/calico",
      parentPathname: "/cat",
      reqUrl: "http://abc.com/cat",
      expected: false,
    },
    {
      name: "no intersections - with wildcard 1",
      layerPathname: "*",
      parentPathname: "",
      reqUrl: "http://abc.com/cat",
      expected: true,
    },
    {
      name: "no intersections - with wildcard 2",
      layerPathname: "/calico*",
      parentPathname: "/cat",
      reqUrl: "http://abc.com/cat/calico",
      expected: true,
    },
    {
      name: "no intersections - with wildcard 3",
      layerPathname: "/calico/:id",
      parentPathname: "/cat",
      reqUrl: "http://abc.com/cat/calico/3",
      expected: true,
    },
    {
      name: "no intersections - with wildcard 4",
      layerPathname: "/calico*",
      parentPathname: "/cat",
      reqUrl: "http://abc.com/cat",
      expected: false,
    },
    {
      name: "with intersections - without wildcard 1",
      layerPathname: "/calico/profile",
      parentPathname: "/cat/calico",
      reqUrl: "http://abc.com/cat/calico/profile",
      expected: true,
    },
    {
      name: "with intersections - without wildcard 2",
      layerPathname: "/calico/profile/8",
      parentPathname: "/cat/calico/profile",
      reqUrl: "http://abc.com/cat/calico/profile/8",
      expected: true,
    },
    {
      name: "with intersections - without wildcard 3",
      layerPathname: "/calico/profile",
      parentPathname: "/cat/calico/foobar",
      reqUrl: "http://abc.com/cat/calico/foobar",
      expected: false,
    },
    {
      name: "with intersections - with wildcard 1",
      layerPathname: "/cat/calico*",
      parentPathname: "/cat",
      reqUrl: "http://abc.com/cat/calico/foobar",
      expected: true,
    },
    {
      name: "with intersections - with wildcard 2",
      layerPathname: "/calico/profile*",
      parentPathname: "/cat/calico/profile",
      reqUrl: "http://abc.com/cat/calico/profile/name",
      expected: true,
    },
  ];
  for (const testCase of testCases) {
    await t.step(testCase.name, () => {
      const r = matchRoute({
        layerPathname: testCase.layerPathname,
        parentPathname: testCase.parentPathname,
        reqUrl: testCase.reqUrl,
      });
      assertEquals(r, testCase.expected);
    });
  }
});
