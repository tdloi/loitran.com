import { NotionAPI } from "notion-client";
import { BlockMap, CollectionInstance } from "notion-types";
import fetch from "node-fetch";
import { BLOG_INDEX_ID, NOTION_TOKEN, PAGE_TITLE, TWITTER_TOKEN } from "./constants";
import { IPost } from "./interfaces";

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
  const startTime = Date.now();
  const res = await api.getPageRaw(pageId).then((res) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`Finished get page 「${parsePageId(pageId)}」 in ${Date.now() - startTime}ms`);
    }
    return res;
  });
  // @ts-ignore: API error
  if (res.errorId != null) {
    // @ts-ignore
    throw new Error(`${res.name}: ${res.message}`);
  }
  return res;
}

export async function getContent(pageId: string, section: string) {
  const page = await getPage(pageId);
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

export async function getPosts(search: string = "", limit = 9999): Promise<IPost[]> {
  const page = await getPage(BLOG_INDEX_ID);
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

function getTweetId(url: string): string {
  return url.substr(url.lastIndexOf("/") + 1);
}

export async function fetchTweet(tweetId: string) {
  const guestToken = await fetch("https://api.twitter.com/1.1/guest/activate.json", {
    headers: {
      Authorization: `Bearer ${TWITTER_TOKEN}`,
    },
    method: "POST",
  })
    .then((res) => res.json())
    .then((res) => {
      if ("guest_token" in res) return res.guest_token;
      throw new Error("Could not get GUEST TOKEN");
    });
  const tweet = await fetch(
    `https://api.twitter.com/2/timeline/conversation/${tweetId}.json?` +
      new URLSearchParams({
        tweet_mode: "extended",
        include_reply_count: "1",
      }),
    {
      headers: {
        Authorization: `Bearer ${TWITTER_TOKEN}`,
        "x-guest-token": guestToken,
      },
    }
  ).then((res) => res.json());

  return tweet;
}

export async function getTweet(url: string) {
  const tweetId = getTweetId(url);
  const tweet = await fetchTweet(tweetId);
  const userId = tweet.globalObjects.tweets[tweetId]["user_id_str"];
  return {
    ...tweet.globalObjects.tweets[tweetId],
    user: {
      ...tweet.globalObjects.users[userId],
    },
  };
}
