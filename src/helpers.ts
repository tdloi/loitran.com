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
