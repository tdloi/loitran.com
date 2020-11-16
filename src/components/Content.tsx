import { PropsWithChildren } from "react";
import Image from "next/image";
import { Tweet } from "@tdloi/notion-utils";
import { defaultMapImageUrl, NotionRenderer } from "react-notion";
import { NotionRendererProps } from "react-notion/dist/renderer";

interface IProps extends NotionRendererProps {
  postsIndex?: Record<string, string>;
}

export const Content: React.FC<PropsWithChildren<IProps>> = (props) => {
  return (
    <NotionRenderer
      {...props}
      customDecoratorComponents={{
        c: (props) => <code className="code">{props.children}</code>,
      }}
      customBlockComponents={{
        code: ({ blockValue }) => (
          <div
            dangerouslySetInnerHTML={{
              // @ts-ignore
              __html: blockValue.hightlight,
            }}
          ></div>
        ),
        image: ({ blockValue }) => (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Image
              src={defaultMapImageUrl(blockValue.properties.source[0][0], {
                // @ts-ignore
                value: blockValue,
              })}
              alt="Picture"
              // @ts-ignore
              width={blockValue.format.block_width}
              // @ts-ignore
              height={blockValue.format.block_height}
              loading="eager"
              layout="intrinsic"
            />
          </div>
        ),
        video: ({ blockValue }) => (
          <iframe
            // @ts-ignore
            width={blockValue.format.block_width}
            // @ts-ignore
            height={blockValue.format.block_width * blockValue.format.block_aspect_ratio}
            // @ts-ignore
            src={blockValue.format.display_source.replace("youtube", "youtube-nocookie")}
            style={{ maxWidth: "100%" }}
            className="video"
          ></iframe>
        ),
        tweet: ({ blockValue }) => (
          // @ts-ignore
          <Tweet tweet={blockValue.meta} variant="dark" />
        ),
      }}
      hooks={{
        setPageUrl: (pageId) => props.postsIndex?.[pageId] ?? pageId,
      }}
    />
  );
};
