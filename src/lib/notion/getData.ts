import { NotionResponse } from "../../interfaces";
import { API_ENDPOINT, NOTION_TOKEN } from "../../constants";

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
  // get collection and collection view id
  const collection = await getPage(table_id);
  const schema = Object.values(collection.recordMap.collection)[0].value.schema;
  const date_field = Object.keys(schema).filter((key) => schema[key].type === "date")[0];

  return getNotionData("queryCollection", {
    collectionId: Object.keys(collection.recordMap.collection)[0],
    collectionViewId: Object.keys(collection.recordMap.collection_view)[0],
    loader: {
      type: "table",
      limit: limit,
    },
    query: {
      sort: [{ property: date_field, direction: "descending" }],
    },
  });
}
