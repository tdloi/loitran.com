import { NotionResponse, IGetTableOptions } from "../../interfaces";
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

  if (response.status === 400) {
    throw new Error("NOT FOUND. Please check your INDEX ID or TOKEN");
  }

  const data: NotionResponse = await response.json();
  // too many request Notion will return empty
  if (data.recordMap.collection == null) {
    return getNotionData(endpoint, body);
  }

  return data;
}

export async function getPage(pageId: string) {
  return getNotionData("loadPageChunk", {
    pageId: pageId,
    limit: 999,
    chunkNumber: 0,
    verticalColumns: false,
  });
}

const defaultOptions: IGetTableOptions = {
  limit: 999,
  search: "",
  published: true,
  emptyDate: false, // allow empty date field
};

export async function getTable(table_id: string, getTableOptions: IGetTableOptions) {
  const options = {
    ...defaultOptions,
    ...getTableOptions,
  };
  let pageInfo = null;
  let cacheFile = `${CACHE_DIR}/table_${table_id}`;

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
      published_field: Object.keys(schema).filter((key) => schema[key].type === "checkbox")[0],
    };
    writeFile(cacheFile, JSON.stringify(pageInfo));
  }

  const params = {
    loader: {
      type: "table",
      limit: options.limit,
    },
    query: {
      sort: [{ property: pageInfo.date_field, direction: "descending" }],
    },
  };

  const filters = [];

  if (typeof options.published === "boolean") {
    // @ts-ignore
    filters.push({
      property: pageInfo.published_field,
      filter: {
        operator: "checkbox_is",
        value: { type: "exact", value: options.published },
      },
    });
  }

  if (options.emptyDate === false) {
    filters.push({
      property: pageInfo.date_field,
      filter: {
        operator: "is_not_empty",
      },
    });
  }

  if (filters.length !== 0) {
    // @ts-ignore
    params.query["filter"] = {
      operator: "and",
      filters: filters,
    };
  }

  if (options.search !== "") {
    // @ts-ignore
    params.loader["searchQuery"] = options.search;
  }

  return getNotionData("queryCollection", {
    collectionId: pageInfo.id,
    collectionViewId: pageInfo.viewId,
    ...params,
  });
}
