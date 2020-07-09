import { NotionResponse } from "../../interfaces";
import { API_ENDPOINT, NOTION_TOKEN, CACHE_DIR } from "../../constants";
import { readFile, writeFile } from "../../utils";

async function getNotionData(endpoint: string, body: any): Promise<NotionResponse> {
  const response = await fetch(`${API_ENDPOINT}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: NOTION_TOKEN,
    },
    body: JSON.stringify(body),
  });
  return response.json();
}

export async function getPage(pageId: string) {
  return getNotionData("loadPageChunk", {
    pageId: pageId,
    limit: 999,
    chunkNumber: 0,
    verticalColumns: false,
  });
}

export async function getTable(table_id: string, limit) {
  let pageInfo = null;
  const cacheFile = `${CACHE_DIR}/table_${table_id}`;

  try {
    pageInfo = JSON.parse(await readFile(cacheFile, "utf-8"));
  } catch {
    const collection = await getPage(table_id);
    // get collection and collection view id
    const schema = Object.values(collection.recordMap.collection)[0].value.schema;
    pageInfo = {
      id: Object.keys(collection.recordMap.collection)[0],
      viewId: Object.keys(collection.recordMap.collection_view)[0],
      date_field: Object.keys(schema).filter((key) => schema[key].type === "date")[0],
    };
    writeFile(cacheFile, JSON.stringify(pageInfo));
  }

  return getNotionData("queryCollection", {
    collectionId: pageInfo.id,
    collectionViewId: pageInfo.viewId,
    loader: {
      type: "table",
      limit: limit,
    },
    query: {
      sort: [{ property: pageInfo.date_field, direction: "descending" }],
    },
  });
}
