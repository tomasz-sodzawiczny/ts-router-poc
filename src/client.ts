import { createApiProxy } from "./lib/router";
import { Api } from "./server";

const api = createApiProxy<Api>();

async function main() {
  try {
    const user = await api.users.getUser("1");
    console.log(user.name);
  } catch (e) {
    console.error(e);
  }
}

main();
