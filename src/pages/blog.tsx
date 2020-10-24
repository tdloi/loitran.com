import { GetStaticProps } from "next";
import { getBlogList } from "../lib/notion";
import { BlogEntries } from "../components/BlogEntry";
import { IBlogEntry } from "../interfaces";
import { getContent } from "../helpers";
import { INDEX_ID } from "../constants";
import { NotionRenderer, BlockMapType } from "react-notion";

interface IPosts {
  year: number;
  posts: Array<IBlogEntry>;
}

interface IProps {
  description: BlockMapType;
  posts: Array<IPosts>;
}

export default function Blog(props: IProps) {
  return (
    <div className="container">
      <NotionRenderer blockMap={props.description} />
      {props.posts?.map((item) => (
        <section className="section" key={item.year}>
          <h1 className="title">{item.year}</h1>
          {!props.posts && <span>No post available</span>}
          <BlogEntries entries={item.posts} />
        </section>
      ))}
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

export const getStaticProps: GetStaticProps = async () => {
  const description = await getContent(INDEX_ID, "blog");
  const posts = await getBlogList({ limit: 999 });

  return {
    props: {
      description: description,
      posts:
        posts?.reduce((acc: any, curr) => {
          let item: IPosts | undefined = acc.find((i: IBlogEntry) => i.year === curr.year);
          if (item == null) {
            acc.push({
              year: curr.year,
              posts: [curr],
            });
          } else {
            item.posts.push(curr);
          }
          return acc;
        }, []) ?? null,
    },
    revalidate: 60,
  };
};

export const config = {
  // https://github.com/zeit/next.js/pull/11949
  unstable_runtimeJS: false,
};
