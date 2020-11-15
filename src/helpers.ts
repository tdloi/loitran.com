import { NotionAPI } from "notion-client";
import { CollectionInstance, TextBlock } from "notion-types";
import LRU from "lru-cache";
import { BLOG_INDEX_ID, INDEX_ID, NOTION_TOKEN } from "./constants";
import { IPost } from "./interfaces";
import {
  parsePageId,
  getPageRaw,
  formatPageIntoSection,
  NotionPageChunk,
} from "@tdloi/notion-utils";
import _dayjs from "dayjs";
import _dayjsUTC from "dayjs/plugin/utc";
import { BlockMapType } from "react-notion";

_dayjs.extend(_dayjsUTC);
export const dayjs = _dayjs.utc;

const cachePage = new LRU<string, NotionPageChunk>();
export async function getPage(pageId: string, maxAge: number = 5 * 1000) {
  const page = cachePage.get(pageId);
  if (page) {
    return page;
  }

  const startTime = Date.now();
  const res = await getPageRaw(pageId, { notionToken: NOTION_TOKEN }).then((res) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`Finished get page 「${parsePageId(pageId)}」 in ${Date.now() - startTime}ms`);
    }
    return res;
  });

  if (res.errorId != null) {
    throw new Error(`${res.name}: ${res.message}`);
  }
  cachePage.set(pageId, res, maxAge);
  return res;
}

export async function getContent(section: string) {
  const page = await getPage(INDEX_ID);
  if (page.recordMap?.block == null) {
    throw new Error(
      `Could not get page with id "${INDEX_ID}". Please make sure your INDEX_ID is correct.`
    );
  }

  return formatPageIntoSection(page.recordMap.block, "sub_header")[section];
}

export function getText(blockMap: BlockMapType | string | null) {
  if (blockMap == null) {
    return "";
  }
  if (typeof blockMap === "string") {
    return blockMap;
  }

  return Object.values(blockMap)
    .filter((block) => block.value.type === "text")
    .map((block) => {
      const blockContent = block.value as TextBlock;
      return blockContent.properties?.title.flatMap((i) => i[0]).join("");
    })
    .join(". ");
}

const api = new NotionAPI({ authToken: NOTION_TOKEN });
export async function getPosts(search: string = "", limit = 9999): Promise<IPost[]> {
  const page = await getPage(BLOG_INDEX_ID, 7 * 24 * 60 * 60 * 1000);
  if (page.recordMap.collection == null) {
    return [];
  }

  const collectionId = Object.keys(page.recordMap.collection || {})[0];
  const viewId = Object.keys(page.recordMap.collection_view || {})[0];
  if (process.env.NODE_ENV !== "production") {
    console.log(`Collection ID: ${collectionId}\nView ID: ${viewId}`);
  }
  const schema = Object.values(page.recordMap.collection || {})[0].value.schema;

  const date_field = Object.keys(schema).filter((key) => schema[key].type === "date")[0];
  const published_field = Object.keys(schema).filter((key) => schema[key].type === "checkbox")[0];

  const table = await api.getCollectionData(collectionId, viewId, {
    limit: limit,
    searchQuery: search,
    query: {
      sort: [{ property: date_field, direction: "descending" }],
      filter: {
        operator: "and",
        filters: [
          {
            property: published_field,
            filter: {
              operator: "checkbox_is",
              value: { type: "exact", value: true },
            },
          },
          {
            property: date_field,
            filter: { operator: "is_not_empty" },
          },
          {
            property: date_field,
            filter: {
              operator: "date_is_on_or_before",
              value: {
                type: "relative",
                value: "today",
              },
            },
          },
        ],
      },
    },
  });

  return formatCollection(table);
}

function formatCollection(collections: CollectionInstance) {
  const schema = Object.values(collections.recordMap.collection || {})[0].value.schema;

  // get schema fields order
  const properties: string[] = Object.values(
    collections.recordMap.collection_view || {}
  )[0].value.format.table_properties.map(
    (p: { width: number; visiable: boolean; property: string }) => p.property
  );

  if (collections.result.total === 0) return [];

  // check if there is any duplicate properties
  const propertiesField = Object.values(schema).map((i) => i.name.toLowerCase());
  if (new Set(propertiesField).size != propertiesField.length) {
    const duplicatedPros = propertiesField.filter(
      (i, index) => propertiesField.indexOf(i) !== index
    );
    throw new Error(`duplicate table property: ${duplicatedPros.join(" - ")}`);
  }

  const ids = collections.result.blockIds;
  return ids.map((id) => {
    const value = collections.recordMap.block[id].value;
    const row: any = { id: value.id };

    for (let prop of properties) {
      // hidden column
      if (schema[prop] == null) continue;
      let name = schema[prop].name.toLowerCase();

      row[name] = getColumnValue(
        value.properties[prop] ? value.properties[prop][0] : [null],
        schema[prop].type
      );
    }
    return row;
  });
}

function getColumnValue(value: any, type: string) {
  switch (type) {
    case "date":
      if (value.length < 2) return null;
      return value[1][0][1].start_date;
    case "checkbox":
      return value[0] === "Yes";
    case "multi_select":
      if (value[0] == null) return [];
      return value[0].split(",");
    default:
      return value[0];
  }
}
