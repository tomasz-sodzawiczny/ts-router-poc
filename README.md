# TS API Router PoC

Fun proof of concept for a TypeScript API router, which hides HTTP as an implementation detail.

👉 I know there are some downsides and limitations to this solution (see [Downsides](#Downsides)), but I find it really clever and satisfying so I did it anyway. 🤷‍♂️

Achieves the following experience, without writing **any additional boilerplate** (really, no extra code). Pure TS, no additional build steps. Typesafe between client and server. Supports nesting and composability.

```js
// server
async function doSometing(param: string) {
  /* ... */
}
const api = { doSomething };

// client
await api.doSomething("foo");
```

See [client.ts](src/client.ts) and [server.ts](src/server.ts) to see a working example. And [lib/router.ts](src/lib/router.ts) for the magic.

## How it works

Handler functions are put in an `api` object.

When server receives an HTTP request, it's path is mapped to the "path" inside the `api` object: e.g. request to `/api/users/getUser` will try to call `api.users.getUser()`.

On the client, the `api` object is function wrapped in a recursive Proxy (🤯), so accessing any path is possible (`api.anything.you.put.in.here()`), and the accessed value allways is a function that will send a request to the correspondig URL: `/api/anything/you/put/in/here`.

The type of the server-side `api` object is exported and used on the client to restrict the usage of client-side `api`. This way only the exising paths will be called, and the client-server typesafety is achieved.

## TODOs and Considerations

All handlers have to be asynchronous functions. The arguments and return type have to be JSON-serializable. Currently this is not type-checked (but seems possible).

The handlers don't have the request context passed to them explicitly (e.g. like in Koa or Express). The context (e.g. for auth) would have to be passed implicitly, likely by [async hooks](https://nodejs.org/api/async_hooks.html).

## Downsides

In the current solution, the client doesn't get any metadata about the handlers - so e.g. we cannot use `GET` for some requests and `POST` for other, which might be undesired (this implementation uses `POST` for all).
