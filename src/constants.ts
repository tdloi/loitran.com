const NOTION_TOKEN = process.env.NOTION_TOKEN || "";
const BLOG_INDEX_ID = process.env.BLOG_INDEX_ID || "";
const INDEX_ID = process.env.INDEX_ID || "";
const PAGE_TITLE = "Loi Tran";
// public twitter token, this is hardcode on twitter frontend build
const TWITTER_TOKEN =
  process.env.TWITTER_TOKEN ||
  "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";
const WORKER_PROXY = process.env.WORKER_PROXY || "";

export { NOTION_TOKEN, BLOG_INDEX_ID, INDEX_ID, PAGE_TITLE, TWITTER_TOKEN, WORKER_PROXY };
