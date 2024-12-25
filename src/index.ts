import { Env } from "./types";
import { getFuture } from "./generator";
import { html } from "./template";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const future = await getFuture(env);
    const res = html(future);
    return new Response(res, { headers: { "Content-Type": "text/html" } });
  },
};
