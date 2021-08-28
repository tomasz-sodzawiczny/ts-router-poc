import { NotFound } from "http-errors";
import Koa from "koa";
import koaBody from "koa-body";
import { router } from "./lib/router";

/** Example handler. */
async function getUser(id: string) {
  if (id === "1") {
    return { name: "Bob" };
  }
  throw new NotFound(`No user with id ${id}`);
}

/** API exposed to the client. */
const api = {
  users: {
    getUser,
  },
};

/** Shared with the client. */
export type Api = typeof api;

const app = new Koa();
app.use(koaBody());
app.use(router(api));
app.listen(8080, () => console.info(`Listening at http://localhost:8080`));
