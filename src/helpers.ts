import sanitize from "sanitize-html";
import { IBlock, IContent } from "./interfaces";
import { createElement } from "react";

export const formatDate = (date: string) => {
  const d = new Date(date);
  const ye = new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
  const mo = new Intl.DateTimeFormat("en", { month: "short" }).format(d);
  const da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);

  return `${da} ${mo} ${ye}`;
};

// recursive render element
export const render = (item: IContent, key: string | number | null = null): React.ReactElement => {
  if (item.content == null || typeof item.content === "string") {
    return createElement(item.tag, item.attr, item.content);
  }
  if (key != null) {
    return createElement(item.tag, { ...item.attr, key: key }, render(item.content));
  }
  return createElement(item.tag, item.attr, render(item.content));
};

export const format = (item: IBlock): Array<IContent> => {
  return (
    item.properties?.title.reduce((acc, curr) => {
      acc.push(formatElementTag({} as IContent, curr?.[1] as any, 0, sanitize(curr?.[0] ?? "")));
      return acc;
    }, [] as any) ?? []
  );
};

// recursive format element as each element may have multiple tag (bold, italic,...)
const formatElementTag = (
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
  return formatElementTag(item, tags, index + 1);
};
