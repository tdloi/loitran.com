import { GetStaticProps, GetStaticPaths } from "next";
import { IBlogEntry } from "../../interfaces";
import DefaultErrorPage from "next/error";
import { getPosts, getPage } from "../../helpers";
import { NotionRenderer, BlockMapType } from "react-notion";

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
        <NotionRenderer blockMap={props.content} />
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
  console.log(metadata);

  if (metadata == null) {
    return {
      props: {
        metadata: null,
      },
    };
  }

  const blocks = await getPage(metadata[0].id);

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
