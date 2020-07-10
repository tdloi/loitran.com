import sanitize from "sanitize-html";
import { IBlock, IContent } from "./interfaces";
import { createElement } from "react";
import { component } from "./components/Formatter";

export const formatDate = (date: string) => {
  const d = new Date(date);
  const ye = new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
  const mo = new Intl.DateTimeFormat("en", { month: "short" }).format(d);
  const da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);

  return `${da} ${mo} ${ye}`;
};

// recursive render element
export const render = (item: IContent, key: string | number | null = null): React.ReactElement => {
  if (item.tag === "code") {
    // ts does not support React Component directly
    return createElement(component.Code, item.attr as any, null);
  }
  if (item.content == null || typeof item.content === "string") {
    return createElement(item.tag, item.attr, item.content);
  }
  if (key != null) {
    return createElement(item.tag, { ...item.attr, key: key }, render(item.content));
  }
  return createElement(item.tag, item.attr, render(item.content));
};

export const format = (item: IBlock): Array<IContent> => {
  if (item.type === "header") {
    return [{ tag: "h1", attr: {}, content: sanitize(item.properties.title[0][0]) }];
  }
  if (item.type === "image") {
    return [
      {
        tag: "img",
        attr: { src: item.properties.source, caption: item.properties.caption },
        content: null,
      },
    ];
  }
  if (item.type === "quote") {
    // TODO: Allow line split \n
    return [{ tag: "quote", attr: {}, content: item.properties.title[0][0] }];
  }
  if (item.type === "code") {
    return [
      {
        tag: "code",
        attr: {
          content: item.properties.title[0][0],
          language: item.properties.language[0][0].toLowerCase(),
        },
        content: null,
      },
    ];
  }
  return formatText(item);
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
  tags: Array<[string, string?]> | undefined,
  index: number,
  content: string | null = null
): IContent => {
  let tag = tags?.[index]?.[0];
  if (tag == null && content == null) return item;
  if (tag == null) {
    tag = "span";
  }

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
  }

  if (content) {
    item = { tag: tag, attr: attr, content: content };
  } else {
    item.content = { tag: tag, attr: attr, content: item.content };
  }
  return formatTextTag(item, tags, index + 1);
};
