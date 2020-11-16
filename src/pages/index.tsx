import { GetStaticProps } from "next";
import { NotionRenderer } from "react-notion";
import { IBlogPosts, PageProps } from "@/interfaces";
import { getContent, getPosts } from "@/helpers";
import { BlogPosts } from "@/components/BlogPosts";
import { Head } from "@/components/Head";

interface IProps {
  page: PageProps;
  posts: IBlogPosts[];
}

export default function Home(props: IProps) {
  return (
    <div className="container">
      <Head page={props.page} />
      <p className="hi">Hi, I'm Loi</p>
      <NotionRenderer blockMap={props.page.content} />

      <section className="recent-posts">
        <h1 className="title">Recent Posts</h1>
        {props.posts.length === 0 ? (
          <span>No post available</span>
        ) : (
          <BlogPosts posts={props.posts} />
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
  const page = await getContent("index");

  return {
    props: {
      page: page,
      posts: recentsPost,
    },
    revalidate: 60,
  };
};

export const config = {
  // https://github.com/zeit/next.js/pull/11949
  unstable_runtimeJS: false,
};
