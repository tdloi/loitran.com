import path from "path";
import fs from "fs";

const normalizeId = (id: string | undefined) => {
  if (!id || id == undefined) return "";
  if (id.length === 36) return id;
  if (id.length !== 32) {
    throw new Error(
      `Invalid index-id: ${id} should be 32 characters long. Info here https://github.com/ijjk/notion-blog#getting-blog-index-and-token`
    );
  }
  return `${id.substr(0, 8)}-${id.substr(8, 4)}-${id.substr(12, 4)}-${id.substr(16, 4)}-${id.substr(
    20
  )}`;
};

const CACHE_DIR = path.resolve(".cache");
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR);
}

if (process.env.NOTION_TOKEN == undefined) {
  throw new Error("Missing NOTION_TOKEN");
}

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const BLOG_INDEX_ID = normalizeId(process.env.BLOG_INDEX_ID);
const INDEX_ID = normalizeId(process.env.INDEX_ID);
const API_ENDPOINT = "https://www.notion.so/api/v3";

export { CACHE_DIR, NOTION_TOKEN, BLOG_INDEX_ID, INDEX_ID, API_ENDPOINT };
