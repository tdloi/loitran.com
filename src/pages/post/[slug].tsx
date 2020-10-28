import { GetStaticProps, GetStaticPaths } from "next";
import Head from "next/head";
import { NotionRenderer, BlockMapType } from "react-notion";
import { IBlogEntry } from "@/interfaces";
import { getPosts, getPage, formatDate, getTitle } from "@/helpers";

const shiki = require("shiki");

interface IProps {
  metadata: IBlogEntry;
  content: BlockMapType;
}

export default function Home(props: IProps) {
  return (
    <div className="container">
      <Head>
        <title>{getTitle(props.metadata.name, "Blog")}</title>
      </Head>
      <section className="section">
        <h1 className="post-title">{props.metadata?.name}</h1>
        <span className="post-date">
          {formatDate(props.metadata.date, (d, m, y) => `${d} ${m} ${y}`)}
        </span>
        <NotionRenderer
          blockMap={props.content}
          customBlockComponents={{
            code: ({ blockValue, renderComponent }) => (
              <div
                dangerouslySetInnerHTML={{
                  // @ts-ignore
                  __html: blockValue.hightlight,
                }}
              ></div>
            ),
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
  // Add Shiki code highlight
  // additional language which Notion does not support
  // e.g. // lang=JSX
  const re = /^\/\/\slang=(?<language>[a-zA-Z]+)\n/;
  for (let key in blocks.recordMap.block) {
    const content = blocks.recordMap.block[key].value;
    if (content.type === "code") {
      let code = content.properties.title[0][0];
      let lang = content.properties.language[0][0].toLowerCase();
      const result = re.exec(code);
      if (result?.groups != null) {
        lang = result.groups.language.toLowerCase();
        code = code.replace(re, "");
      }

      const hightlight = await shiki
        .getHighlighter({
          theme: "material-theme-darker",
        })
        .then((highlighter: any) => {
          return highlighter.codeToHtml(code, lang);
        });
      // @ts-ignore
      content.hightlight = hightlight;
    }
  }

  return {
    props: {
      metadata: metadata[0],
      content: blocks.recordMap.block,
    },
    revalidate: 60,
  };
};

export const config = {
  // https://github.com/zeit/next.js/pull/11949
  unstable_runtimeJS: false,
};
