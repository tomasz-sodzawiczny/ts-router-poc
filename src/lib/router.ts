import Koa from "koa";
import fetch from "node-fetch";
import createError, { InternalServerError } from "http-errors";

// TODO is it possible to restrict confirm api object is correct?
export type RoutableApi = any;

/** Creates a routing middleware. */
export function router(api: RoutableApi): Koa.Middleware {
  return async function (ctx) {
    // TODO: normalize and escape path if needed
    const path = ctx.path.split("/").filter((part) => part !== "");

    const handler = path.reduce(
      (subApi, dir) => {
        if (!subApi) {
          // In this setup not found shouldn't happen, so 500
          throw new InternalServerError("Handler not found");
        }
        // @ts-expect-error figure out RoutableApi type
        return subApi[dir];
      },
      { api }
    ) as unknown;

    if (typeof handler !== "function") {
      throw new InternalServerError("Invalid handler");
    }

    const { args } = ctx.request.body;
    const data = await handler(...args);

    ctx.body = { data };
  };
}

/** Creates an api Proxy that will call the matching function server-side. */
export function createApiProxy<ApiType>(prefix: string[] = ["api"]): ApiType {
  async function call(...args: any[]) {
    const path = prefix.join("/");
    const response = await fetch(`http://localhost:8080/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ args }),
    });
    if (!response.ok) {
      throw createError(response.status, response.statusText);
    }
    const { data } = await response.json();
    return data;
  }

  // @ts-expect-error return ApiType
  return new Proxy(call, {
    get: (_, prop) => {
      if (typeof prop !== "string") {
        throw new Error("Attempted to access Symbol property");
      }
      return createApiProxy([...prefix, prop]);
    },
  });
}
