import { Env } from "./types";

type NewsItem = { title: string; description: string };
type LostFuture = { date: string; value: string };

export async function getFuture(env: Env): Promise<string> {
  const currentDate = new Date().toISOString().split("T")[0];
  let found = await env.LOST_FUTURES_KV.get(currentDate);
  if (found) return found;

  const items = await getNewsItems(6, env);
  let newsConcat = items
    .map((item) => `${item.title}. ${item.description}`)
    .join("\n");

  const toParse = env.BASE_PARAMS.replace(
    "{{ NEWS_ITEMS }}",
    JSON.stringify(newsConcat).replace(/^"(.*)"$/, "$1"),
  );
  const baseParams = JSON.parse(toParse);
  const extraHeaders = env.EXTRA_HEADERS ? JSON.parse(env.EXTRA_HEADERS) : {};
  const future = await generate(
    env.BASE_URL,
    env.API_KEY,
    baseParams,
    extraHeaders,
  );
  await env.LOST_FUTURES_KV.put(currentDate, future);
  return future;
}

async function getNewsItems(n: number, env: Env): Promise<NewsItem[]> {
  const currentDate = new Date().toISOString().split("T")[0];
  const key = `news-${n}-${currentDate}`;
  let found = await env.LOST_FUTURES_KV.get(key);
  if (found) return JSON.parse(found);

  const apiKey = env.NEWS_API_KEY;
  const url = `https://newsapi.org/v2/top-headlines?country=us&pageSize=${n}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-Api-Key": apiKey,
      "Content-Type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
    },
  });
  const data: { articles: NewsItem[] } = await response.json();
  console.log("NEWS API", data);
  if (!data.articles || data.articles.length === 0) {
    throw new Error("Invalid response");
  }
  await env.LOST_FUTURES_KV.put(key, JSON.stringify(data.articles));
  return data.articles;
}

async function getPrevious(n: number, env: Env): Promise<LostFuture[]> {
  const currentDate = new Date().toISOString().split("T")[0];
  const dates = Array.from({ length: n }, (_, i) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    return date.toISOString().split("T")[0];
  });
  const futures = [];
  for (const date of dates) {
    const future = await env.LOST_FUTURES_KV.get(date);
    if (future) {
      futures.push({ date, value: future });
    }
  }
  return futures;
}

/**
 * Generate a single lost future.
 */
async function generate(
  url: string,
  apiKey: string,
  params: Record<string, unknown>,
  extraHeaders?: Record<string, string>,
): Promise<string> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      ...(extraHeaders || {}),
    },
    body: JSON.stringify(params),
  });
  const data: {
    content?: [{ text: string }];
    choices?: [{ text: string }];
  } = await response.json();
  const res = data.content || data.choices;
  if (!res) {
    throw new Error("Invalid response");
  }
  return res[0].text.trim();
}
