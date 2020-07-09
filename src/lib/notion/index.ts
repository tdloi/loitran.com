import { getTable, getPage } from "./getData";
import { BLOG_INDEX_ID, INDEX_ID } from "../../constants";

export async function getBlogList(limit = 999) {
  const contentsList = await getTable(BLOG_INDEX_ID, limit);
  const schema = Object.values(contentsList.recordMap.collection)[0].value.schema;
  const blockIds = contentsList.result.blockIds;
  return blockIds.map((id) =>
    Object.keys(schema).reduce(
      (result, index) => {
        const prop_value = contentsList.recordMap.block[id].value.properties?.[index];
        const key = schema[index].name.toLowerCase();
        let value = null;

        if (prop_value == undefined) {
          if (schema[index].type === "checkbox") {
            value = false;
          }
          result[key] = value;
          return result;
        }

        switch (schema[index].type) {
          case "date":
            // @ts-ignore
            value = prop_value[0][1][0][1].start_date;
            break;
          case "checkbox":
            value = prop_value[0][0] === "Yes";
            break;
          case "multi_select":
            // @ts-ignore
            value = prop_value[0][0].split(",");
            break;
          default:
            value = prop_value[0][0];
        }
        result[key] = value;
        return result;
      },
      {
        name: null,
        date: null,
        slug: null,
        published: false,
        tags: [],
      }
    )
  );
}

export async function getIndex() {
  const data = await getPage(INDEX_ID);
  const content = {};
  let label = null;
  let labelContent = [];

  for (let key of data.recordMap.block[INDEX_ID].value.content) {
    const value = data.recordMap.block[key].value;

    if (value.properties == undefined) {
      labelContent.push(null); // empty line
      continue;
    }
    if (value.type === "header") {
      if (label !== null) {
        content[label] = labelContent;
      }
      label = value.properties.title[0][0].toLowerCase();
      labelContent = [];
    } else {
      labelContent.push(value.properties.title[0][0]);
    }
  }
  content[label] = labelContent;

  return content;
}
