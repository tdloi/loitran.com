import { GetStaticProps, GetStaticPaths } from "next";
import { IBlogEntry } from "../../interfaces";
import DefaultErrorPage from "next/error";
import { getPosts, getPage } from "../../helpers";
import { NotionRenderer, BlockMapType } from "react-notion";

const shiki = require("shiki");

interface IProps {
  metadata: IBlogEntry | null;
  content: BlockMapType;
}

export default function Home(props: IProps) {
  if (props.metadata == null) {
    return <DefaultErrorPage statusCode={404} />;
  }

  return (
    <div className="container">
      <section className="section">
        <h1 className="title">{props.metadata?.name}</h1>
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
        .title {
          font-size: 2rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPosts();

  return {
    paths:
      posts?.map((post) => {
        return {
          params: { slug: post.slug },
        };
      }) ?? [],
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  let { slug }: any = context.params;
  if (typeof slug !== "string") {
    slug = slug[0];
  }

  const metadata = await getPosts(slug, 1);

  if (metadata == null) {
    return {
      props: {
        metadata: null,
      },
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
