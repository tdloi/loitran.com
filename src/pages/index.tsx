import { GetStaticProps } from "next";
import { IBlogEntry } from "../interfaces";
import { getContent, getPosts } from "../helpers";
import { NotionRenderer, BlockMapType } from "react-notion";
import { INDEX_ID } from "../constants";
import { BlogEntries } from "../components/BlogEntry";

interface IProps {
  about: BlockMapType;
  posts: Array<IBlogEntry>;
}

export default function Home(props: IProps) {
  return (
    <div className="container">
      <p className="intro">Hi, I'm Loi</p>
      <NotionRenderer blockMap={props.about} />

      <section className="section">
        <h1 className="title">Recent Posts</h1>
        {!props.posts && <span>No post available</span>}
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
  const recentsPost = await getPosts("", 3);
  const about = await getContent(INDEX_ID, "about");

  return {
    props: {
      about: about,
      posts: recentsPost,
    },
    revalidate: 60,
  };
};

export const config = {
  // https://github.com/zeit/next.js/pull/11949
  unstable_runtimeJS: false,
};
