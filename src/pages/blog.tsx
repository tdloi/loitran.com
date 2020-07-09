import { GetStaticProps } from "next";
import { getBlogList, getIndex } from "../lib/notion";
import { BlogEntries } from "../components/BlogEntry";
import { IBlogEntry } from "../interfaces";

interface IProps {
  index: {
    blog: Array<string>;
  };
  posts: Array<{
    year: number;
    posts: Array<IBlogEntry>;
  }>;
}

export default function Blog(props: IProps) {
  return (
    <div className="container">
      {props.index.blog?.map((i) => {
        if (i === null) return <br key={i} />;
        return <p key={i}>{i}</p>;
      })}
      {props.posts.map((item) => (
        <section className="section" key={item.year}>
          <h1 className="title">{item.year}</h1>
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
  const index = await getIndex();
  const posts = await getBlogList({ limit: 999 });

  return {
    props: {
      index: index,
      posts: posts.reduce((acc, curr) => {
        let item = acc.find((i: IBlogEntry) => i.year === curr.year);
        if (item == null) {
          acc.push({
            year: curr.year,
            posts: [curr],
          });
        } else {
          item.posts.push(curr);
        }
        return acc;
      }, []),
    },
  };
};
