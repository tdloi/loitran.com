import sanitize from "sanitize-html";
import { IBlock, IContent } from "./interfaces";
import { createElement } from "react";
import { component } from "./components/Formatter";
import { NotionAPI } from "notion-client";
import { BlockMap, CollectionInstance } from "notion-types";
import { BLOG_INDEX_ID } from "./constants";

export const formatDate = (date: string) => {
  const d = new Date(date);
  const ye = new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
  const mo = new Intl.DateTimeFormat("en", { month: "short" }).format(d);
  const da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);

  return `${da} ${mo} ${ye}`;
};

// recursive render element
export const render = (item: IContent, key: string | number | null = null): React.ReactElement => {
  item.attr.key = key;
  if (item.tag === "code") {
    // ts does not support React Component directly
    return createElement(component.Code, item.attr as any, null);
  }
  if (item.content == null || typeof item.content === "string") {
    return createElement(item.tag, item.attr, item.content);
  }
  // render children
  if (Array.isArray(item.content)) {
    return createElement(
      item.tag,
      item.attr,
      ...item.content.map((child, index) => render(child, index))
    );
  }
  if (key != null) {
    return createElement(item.tag, { ...item.attr, key: key }, render(item.content));
  }

  return createElement(item.tag, item.attr, render(item.content));
};

export const format = (item: IBlock): IContent | Array<IContent> => {
  if (item.type === "header") {
    return { tag: "h1", attr: {}, content: sanitize(item.properties.title[0][0]) };
  }
  if (item.type === "sub_header") {
    return { tag: "h2", attr: {}, content: sanitize(item.properties.title[0][0]) };
  }
  if (item.type === "sub_sub_header") {
    return { tag: "h3", attr: {}, content: sanitize(item.properties.title[0][0]) };
  }

  if (item.type === "image") {
    return {
      tag: "img",
      attr: { src: item.properties.source, caption: item.properties.caption },
      content: null,
    };
  }
  if (item.type === "quote") {
    // TODO: Allow line split \n
    return { tag: "quote", attr: {}, content: item.properties.title[0][0] };
  }
  if (item.type === "code") {
    return {
      tag: "code",
      attr: {
        content: item.properties.title[0][0],
        language: item.properties.language[0][0].toLowerCase(),
      },
      content: null,
    };
  }

  return { tag: "p", attr: {}, content: formatText(item) };
};

export const formatText = (item: IBlock): Array<IContent> => {
  return (
    item.properties?.title.reduce((acc, curr) => {
      acc.push(formatTextTag({} as IContent, curr?.[1] as any, 0, sanitize(curr?.[0] ?? "")));
      return acc;
    }, [] as any) ?? []
  );
};

// recursive format element as each element may have multiple tag (bold, italic,...)
const formatTextTag = (
  item: IContent,
  tags: Array<[string, string?]>,
  index: number,
  content: string | null = null
): IContent => {
  let tag = tags?.[index]?.[0];
  if (tag == null && content == null) return item;

  let attr = {};
  const secondValue = tags?.[index]?.[1];
  switch (tag) {
    case "a":
      tag = "a";
      attr = { href: secondValue };
      break;
    case "_":
      tag = "u";
      break;
    case "c":
      tag = "code";
      break;
    case "h":
      tag = "span";
      if (secondValue?.includes("_background") === true) {
        attr = { style: { backgroundColor: secondValue?.split("_")[0] } };
      } else {
        attr = { style: { color: secondValue } };
      }
      break;
    default:
      tag = "span";
  }

  if (content) {
    item = { tag: tag, attr: attr, content: content };
  } else {
    item.content = { tag: tag, attr: attr, content: item.content };
  }
  return formatTextTag(item, tags, index + 1);
};

const api = new NotionAPI();
export async function getPage(pageId: string) {
  return api.getPageRaw(pageId);
}

export async function getContent(pageId: string, section: string) {
  const page = await api.getPageRaw(pageId);
  let iteratingSectionItem = false;
  return Object.keys(page.recordMap.block).reduce((blocks, id: string) => {
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
