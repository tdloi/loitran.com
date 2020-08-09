import { GetStaticProps, GetStaticPaths } from "next";
import { IBlogEntry, IContent } from "../../interfaces";
import { getBlogList } from "../../lib/notion";
import DefaultErrorPage from "next/error";
import { getPage } from "../../lib/notion/getData";
import { format } from "../../helpers";
import { Content } from "../../components/Content";

interface IProps {
  metadata: IBlogEntry | null;
  content: Array<IContent>;
}

export default function Home(props: IProps) {
  if (props.metadata == null) {
    return <DefaultErrorPage statusCode={404} />;
  }

  return (
    <div className="container">
      <section className="section">
        <h1 className="title">{props.metadata?.name}</h1>
        <Content content={props.content} />
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
  const posts = await getBlogList({
    limit: 999,
    published: true,
  });

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

  const metadata = await getBlogList({
    limit: 1,
    search: slug,
  });

  if (metadata == null) {
    return {
      props: {
        metadata: null,
      },
    };
  }
  const data = await getPage(metadata[0].id);
  const content = data.recordMap.block[metadata[0].id].value.content.map((id) =>
    format(data.recordMap.block[id].value)
  );

  return {
    props: {
      metadata: metadata[0],
      content: content,
    },
    revalidate: 60,
  };
};

export const config = {
  // https://github.com/zeit/next.js/pull/11949
  unstable_runtimeJS: false,
};
