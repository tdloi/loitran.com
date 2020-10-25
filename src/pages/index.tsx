import { GetStaticProps } from "next";
import { NotionRenderer, BlockMapType } from "react-notion";
import { IBlogEntry } from "@/interfaces";
import { getContent, getPosts } from "@/helpers";
import { INDEX_ID } from "@/constants";
import { BlogEntries } from "@/components/BlogEntry";

interface IProps {
  about: BlockMapType;
  posts: Array<IBlogEntry>;
}

export default function Home(props: IProps) {
  return (
    <div className="container">
      <p className="hi">Hi, I'm Loi</p>
      <NotionRenderer blockMap={props.about} />

      <section className="recent-posts">
        <h1 className="title">Recent Posts</h1>
        {props.posts.length === 0 ? (
          <span>No post available</span>
        ) : (
          <BlogEntries entries={props.posts} />
        )}
      </section>
      <style jsx>{`
        .recent-posts {
          margin-top: 1rem;
        }
        .hi {
          font-size: 2.5rem;
          font-weight: 600;
          margin: 1.2rem 0 0;
        }
        .title {
          font-size: 2rem;
          text-decoration: underline;
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}
export const getStaticProps: GetStaticProps = async () => {
  const recentsPost = await getPosts("", 3);
  console.log(recentsPost);
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
