import { Env, LostFuture, NewsItem, TodayFuture } from "./types";

const fakeUA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)" +
  " Chrome/58.0.3029.110 Safari/537.3";

export async function getFuture(env: Env, date?: string): Promise<TodayFuture> {
  const currentDate = new Date().toISOString().split("T")[0];
  const requestDate = date || currentDate;
  let found = await env.LOST_FUTURES_KV.get(requestDate);
  const news = await getNewsItems(6, requestDate, env);

  if (found && news) {
    return { date: requestDate, future: found, news: news };
  }

  let newsConcat = news
    .map((item) => `${item.title}. ${item.description}`)
    .join("\n");

  const rawParams = env.BASE_PARAMS.replace(
    "{{ NEWS_ITEMS }}",
    JSON.stringify(newsConcat).replace(/^"(.*)"$/, "$1"),
  );
  const baseParams = JSON.parse(rawParams);
  const extraHeaders = env.EXTRA_HEADERS ? JSON.parse(env.EXTRA_HEADERS) : {};
  const future = await generate(
    env.BASE_URL,
    env.API_KEY,
    baseParams,
    extraHeaders,
  );
  await env.LOST_FUTURES_KV.put(requestDate, future);
  return { date: requestDate, future, news: news };
}

async function getNewsItems(
  n: number,
  date: string,
  env: Env,
): Promise<NewsItem[]> {
  const key = `news-${n}-${date}`;
  let found = await env.LOST_FUTURES_KV.get(key);
  if (found) return JSON.parse(found);

  const apiKey = env.NEWS_API_KEY;
  const url = `https://newsapi.org/v2/top-headlines?country=us&pageSize=${n}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-Api-Key": apiKey,
      "Content-Type": "application/json",
      "User-Agent": fakeUA,
    },
  });
  const data: { articles: NewsItem[] } = await response.json();
  if (!data.articles || data.articles.length === 0) {
    throw new Error("Invalid response");
  }
  await env.LOST_FUTURES_KV.put(key, JSON.stringify(data.articles));
  return data.articles;
}

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
