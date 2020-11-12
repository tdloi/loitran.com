import { GetStaticProps, GetStaticPaths } from "next";
import Head from "next/head";
import Image from "next/image";
import { NotionRenderer, BlockMapType, defaultMapImageUrl } from "react-notion";
import { getTweet, Tweet, proxyFetch, codeHighlight } from "@tdloi/notion-utils";
import { IBlogEntry } from "@/interfaces";
import { getPosts, getPage, getTitle, dayjs } from "@/helpers";
import { TWITTER_TOKEN, WORKER_PROXY } from "@/constants";

interface IProps {
  metadata: IBlogEntry;
  content: BlockMapType;
  postsIndex: Record<string, string>;
}

export default function Home(props: IProps) {
  return (
    <div className="container">
      <Head>
        <title>{getTitle(props.metadata.name, "Blog")}</title>
      </Head>
      <section className="section">
        <h1 className="post-title">{props.metadata?.name}</h1>
        <span className="post-date">{dayjs(props.metadata.date).format("DD MMMM, YYYY")}</span>
        <NotionRenderer
          blockMap={props.content}
          customDecoratorComponents={{
            c: (props) => <code className="code">{props.children}</code>,
          }}
          customBlockComponents={{
            code: ({ blockValue, renderComponent }) => (
              <div
                dangerouslySetInnerHTML={{
                  // @ts-ignore
                  __html: blockValue.hightlight,
                }}
              ></div>
            ),
            image: ({ blockValue, renderComponent }) => (
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
            video: ({ blockValue, renderComponent }) => (
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
            tweet: ({ blockValue, renderComponent }) => (
              // @ts-ignore
              <Tweet tweet={blockValue.meta} variant="dark" />
            ),
          }}
          hooks={{
            setPageUrl: (pageId) => props.postsIndex[pageId],
          }}
        />
      </section>
      <style jsx>{`
        .section {
          margin-top: 1rem;
        }
        .intro {
          font-size: 2.5rem;
          font-weight: 600;
        }
        .post-title {
          font-size: 2rem;
          margin-top: 0.5rem;
          margin-bottom: 0;
        }
        .post-date {
          color: var(--fgAlt);
          font-size: 0.95rem;
        }
        @media (max-width: 767px) {
          .video {
            max-height: 33vh;
          }
        }
        .code {
          font-size: 0.88rem;
          padding: 0.1rem 0.2rem;
          background: #b0a8a82b;
        }
      `}</style>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPosts("", 2);

  return {
    paths:
      posts?.map((post) => {
        return {
          params: { slug: post.slug },
        };
      }) ?? [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  let { slug }: any = context.params;
  if (typeof slug !== "string") {
    slug = slug[0];
  }

  const metadata = await getPosts(slug, 1);

  if (metadata.length == 0) {
    return {
      props: {
        metadata: null,
      },
      notFound: true,
    };
  }

  const blocks = await getPage(metadata[0].id);

  for (let key in blocks.recordMap.block) {
    const content = blocks.recordMap.block[key].value;
    if (content.type === "code") {
      // @ts-ignore
      content.hightlight = await codeHighlight(content, require("shiki"));
    }
    if (content.type === "tweet") {
      // @ts-ignore
      content.meta = await getTweet(content.properties.source[0][0], TWITTER_TOKEN, {
        fetch: proxyFetch(WORKER_PROXY),
      });
    }
  }

  const posts = await getPosts();
  const postsIndex = posts.reduce<Record<string, string>>((acc, curr) => {
    acc[curr.id] = curr.slug;
    return acc;
  }, {});

  return {
    props: {
      metadata: metadata[0],
      content: blocks.recordMap.block,
      postsIndex: postsIndex,
    },
    revalidate: 60,
  };
};

export const config = {
  // https://github.com/zeit/next.js/pull/11949
  unstable_runtimeJS: false,
};
