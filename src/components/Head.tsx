import NextHead from "next/head";
import { PropsWithChildren } from "react";
import { PageProps } from "@/interfaces";

export const Head: React.FC<PropsWithChildren<{ page: PageProps }>> = (props) => {
  return (
    <NextHead>
      <title>{props.page.title}</title>
      <meta name="description" content={props.page.description} />
      {props.children}
    </NextHead>
  );
};
