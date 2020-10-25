import { GetStaticProps } from "next";
import Head from "next/head";
import { NotionRenderer, BlockMapType } from "react-notion";
import { BlogEntries } from "@/components/BlogEntry";
import { IBlogEntry } from "@/interfaces";
import { getContent, getPosts, getTitle } from "@/helpers";
import { INDEX_ID, PAGE_TITLE } from "@/constants";

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
      <Head>
        <title>{getTitle(null, "Blog")}</title>
      </Head>
      <NotionRenderer blockMap={props.description} />
      {props.posts?.map((item) => (
        <section className="section" key={item.year} id={item.year.toString()}>
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
  const posts: IBlogEntry[] = await getPosts("");
  for (let post of posts) {
    post.year = parseInt(post.date);
  }

  return {
    props: {
      description: description,
      posts:
        posts.reduce((acc: any, curr) => {
          // divide post by year
          let item: IPosts | undefined = acc.find((i: IBlogEntry) => i.year === curr.year);
          if (item == null) {
            // new year
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
