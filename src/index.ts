import { Env } from './types';
import { generate } from './generator';
import { html } from './template';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const currentDate = new Date().toISOString().split('T')[0];
    let future = await env.LOST_FUTURES.get(currentDate);

    if (!future) {
      future = await generate(env.MY_API_KEY);
      await env.LOST_FUTURES.put(currentDate, future);
    }

    const res = html(future);
    return new Response(res, {
      headers: { 'Content-Type': 'text/html' },
    });
  },
};