import { Env } from "./types";
import { getFuture } from "./generator";
import { html } from "./template";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/future/")) {
      const date = url.pathname.split("/").pop();
      if (!date) {
        return new Response("Date parameter required", { status: 400 });
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return new Response("Invalid date format. Use YYYY-MM-DD", {
          status: 400,
        });
      }
      const future = await getFuture(env, date);
      return new Response(JSON.stringify(future), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
    const future = await getFuture(env);
    const res = html(future);
    return new Response(res, { headers: { "Content-Type": "text/html" } });
  },
};
