import { NotionAPI } from "notion-client";
import { BlockMap, CollectionInstance } from "notion-types";
import { BLOG_INDEX_ID, NOTION_TOKEN, PAGE_TITLE } from "./constants";

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

// https://github.com/NotionX/react-notion-x/blob/master/packages/notion-utils/src/parse-page-id.ts
const pageIdRe = /\b([a-f0-9]{32})\b/;
const pageId2Re = /\b([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\b/;

const parsePageId = (id: string) => {
  id = id.split("?")[0];

  if (id.match(pageIdRe)) {
    return `${id.substr(0, 8)}-${id.substr(8, 4)}-${id.substr(12, 4)}-${id.substr(
      16,
      4
    )}-${id.substr(20)}`;
  }

  if (id.match(pageId2Re)) {
    return id;
  }

  return "";
};

const api = new NotionAPI({ authToken: NOTION_TOKEN });
export async function getPage(pageId: string) {
  return api.getPageRaw(pageId);
}

export async function getContent(pageId: string, section: string) {
  const page = await api.getPageRaw(pageId);
  if (page.recordMap?.block == null) {
    throw new Error(
      `Could not get page with id "${pageId}". Please make sure your INDEX_ID is correct.`
    );
  }

  const _pageID = parsePageId(pageId);

  let iteratingSectionItem = false;
  let contentIDs: string[] = [];
  const content = Object.keys(page.recordMap.block).reduce((blocks, id: string) => {
    const block = page.recordMap.block[id];
    // use header (h1) as seperator to divide each part into section
    if (block.value.type == "header") {
      if (block.value.properties?.title[0][0].toLowerCase() === section.toLowerCase()) {
        iteratingSectionItem = true;
      } else {
        // this is on another section
        iteratingSectionItem = false;
      }
    }
    // always include current page so that React Notion could get list of content
    else if (block.value.id === _pageID) {
      blocks[id] = block;
    } else if (iteratingSectionItem === true) {
      blocks[id] = block;
      contentIDs.push(id);
    }

    return blocks;
  }, {} as BlockMap);

  // remove unused block id in page content list
  // actually it is unnecessary, just to stop ReactNotion emit warning block not found
  content[_pageID].value.content = contentIDs;
  return content;
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
