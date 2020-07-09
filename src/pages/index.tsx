import { GetStaticProps } from "next";
import { getBlogList, getIndex } from "../lib/notion";
import { BlogEntries } from "../components/BlogEntry";
import { IBlogEntry } from "../interfaces";

interface IProps {
  index: {
    about?: Array<string>;
  };
  posts: Array<IBlogEntry>;
}

export default function Home(props: IProps) {
  return (
    <div className="container">
      <p className="intro">Hi, I'm Loi</p>
      {props.index.about?.map((i) => {
        if (i === null) return <br key={i} />;
        return <p key={i}>{i}</p>;
      })}
      <section className="section">
        <h1 className="title">Recent Posts</h1>
        <BlogEntries entries={props.posts} />
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
export const getStaticProps: GetStaticProps = async () => {
  const recentsPost = await getBlogList({ limit: 3 });
  const index = await getIndex();

  return {
    props: {
      index: index,
      posts: recentsPost,
    },
  };
};
