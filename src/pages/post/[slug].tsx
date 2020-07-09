import { GetStaticProps, GetStaticPaths } from "next";
import { IBlogEntry } from "../../interfaces";
import { getBlogList } from "../../lib/notion";
import DefaultErrorPage from "next/error";

interface IProps {
  post: IBlogEntry | null;
}

export default function Home(props: IProps) {
  if (props.post == null) {
    return <DefaultErrorPage statusCode={404} />;
  }

  return (
    <div className="container">
      <section className="section">
        <h1 className="title">{props.post?.name}</h1>
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
    paths: posts.map((post) => {
      return {
        params: { slug: post.slug },
      };
    }),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  let { slug } = context.params;
  if (typeof slug !== "string") {
    slug = slug[0];
  }

  let post = await getBlogList({
    limit: 1,
    search: slug,
  });

  return {
    props: {
      post: post?.[0] ?? null,
    },
  };
};
