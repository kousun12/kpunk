import { Env, TodayFuture } from "./types";
import { getFuture } from "./generator";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      
      // Handle /api/future/:date endpoint
      if (url.pathname.startsWith('/api/future/')) {
        const date = url.pathname.split('/').pop();
        if (!date) {
          return new Response('Date parameter required', { status: 400 });
        }

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return new Response('Invalid date format. Use YYYY-MM-DD', { status: 400 });
        }

        const future = await getFuture(env, date);
        return new Response(JSON.stringify(future), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Handle root path - serve the HTML template
      if (url.pathname === '/') {
        const future = await getFuture(env);
        const html = generateHtml(future);
        return new Response(html, {
          headers: { 'Content-Type': 'text/html' },
        });
      }

      return new Response('Not found', { status: 404 });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal server error', { status: 500 });
    }
  },
};

function generateHtml(future: TodayFuture): string {
  // Import the template function from template.ts
  const { html } = require('./template');
  return html(future);
}
