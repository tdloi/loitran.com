import NextHead from "next/head";
import { PropsWithChildren } from "react";
import { getText } from "@/helpers";
import { PageProps } from "@/interfaces";

export const Head: React.FC<PropsWithChildren<{ page: PageProps }>> = (
  props: PropsWithChildren<{ page: PageProps }>
) => {
  return (
    <NextHead>
      <title>{getText(props.page.title)}</title>
      <meta name="description" content={getText(props.page.description)} />
      {props.children}
    </NextHead>
  );
};
