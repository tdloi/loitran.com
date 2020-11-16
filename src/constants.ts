const NOTION_TOKEN = process.env.NOTION_TOKEN || "";
const BLOG_INDEX_ID = process.env.BLOG_INDEX_ID || "";
const INDEX_ID = process.env.INDEX_ID || "";
const WORKER_PROXY = process.env.WORKER_PROXY || "";
const theme = {
  bg: "#12141c",
  fg: "#d2d0d0",
  primary: "#2bbc8a",
  bgAlt: "#2a2d37",
  fgAlt: "#838383",
};

export { NOTION_TOKEN, BLOG_INDEX_ID, INDEX_ID, WORKER_PROXY, theme };
