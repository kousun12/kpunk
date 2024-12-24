export interface Env {
  LOST_FUTURES_KV: KVNamespace;
  API_KEY: string;
  BASE_URL: string;
  BASE_PARAMS: string;
  EXTRA_HEADERS?: string;
  NEWS_API_KEY: string;
}

export type NewsItem = { title: string; description: string };
export type LostFuture = { date: string; value: string };
export type TodayFuture = { date: string; future: string; news: NewsItem[] };
