import { NotionAPI } from "notion-client";
import { BlockMap, CollectionInstance } from "notion-types";
import { BLOG_INDEX_ID, PAGE_TITLE } from "./constants";

export const formatDate = (
  date: string,
  callback?: (d: string, m: string, y: string) => string
) => {
  const d = new Date(date);
  const ye = new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
  const mo = new Intl.DateTimeFormat("en", { month: "short" }).format(d);
  const da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);

  if (callback) {
    return callback(da, mo, ye);
  }
  return `${da} ${mo}`;
};

export function getTitle(title: string | null, extra: string = "") {
  if (title == null) return PAGE_TITLE + " " + extra;

  return `${title} | ${PAGE_TITLE} ${extra}`;
}

const api = new NotionAPI();
export async function getPage(pageId: string) {
  return api.getPageRaw(pageId);
}

export async function getContent(pageId: string, section: string) {
  const page = await api.getPageRaw(pageId);

  let iteratingSectionItem = false;
  return Object.keys(page.recordMap.block || {}).reduce((blocks, id: string) => {
    const block = page.recordMap.block[id];
    // use header (h1) as section
    if (block.value.type == "header") {
      if (block.value.properties?.title[0][0].toLowerCase() === section.toLowerCase()) {
        iteratingSectionItem = true;
      } else {
        iteratingSectionItem = false;
      }
    } else if (iteratingSectionItem === true) {
      blocks[id] = block;
    }

    return blocks;
  }, {} as BlockMap);
}

export async function getPosts(search: string = "", limit = 9999) {
  const page = await api.getPageRaw(BLOG_INDEX_ID);
  if (page.recordMap.collection == null) {
    return [];
  }

  const collectionId = Object.keys(page.recordMap.collection || {})[0];
  const viewId = Object.keys(page.recordMap.collection_view || {})[0];
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
  const properties = Object.values(
    collections.recordMap.collection_view || {}
  )[0].value.format.table_properties.map(
    (p: { width: number; visiable: boolean; property: string }) => p.property
  );

  if (collections.result.total === 0) return [];

  const ids = collections.result.blockIds;
  return ids.map((id) => {
    const value = collections.recordMap.block[id].value;
    const row: any = { id: value.id };

    for (let prop of properties) {
      // hidden column
      if (schema[prop] == null) continue;
      // TODO: Check dupplicate name
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
