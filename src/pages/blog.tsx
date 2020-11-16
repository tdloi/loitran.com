import { GetStaticProps } from "next";
import { BlogPosts } from "@/components/BlogPosts";
import { IBlogPosts, PageProps } from "@/interfaces";
import { getContent, getPosts, dayjs } from "@/helpers";
import { Head } from "@/components/Head";
import { Content } from "@/components/Content";

interface IPosts {
  year: number;
  posts: IBlogPosts[];
}

interface IProps {
  page: PageProps;
  posts: IPosts[];
}

export default function Blog(props: IProps) {
  return (
    <div className="container">
      <Head page={props.page} />
      <Content blockMap={props.page.content} />
      {props.posts?.map((item) => (
        <section className="section" key={item.year} id={item.year.toString()}>
          <h1 className="title">{item.year}</h1>
          {!props.posts && <span>No post available</span>}
          <BlogPosts posts={item.posts} />
        </section>
      ))}
      <style jsx>{`
        .section {
          margin-top: 1rem;
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
  const page = await getContent("blog");
  const posts: IBlogPosts[] = await getPosts("");

  return {
    props: {
      page: page,
      posts:
        posts.reduce<IPosts[]>((acc, curr) => {
          const year = parseInt(curr.date);
          // divide post by year
          let item = acc.find((i) => i.year === year);
          if (item == null) {
            // new year
            acc.push({
              year: year ?? dayjs().year(),
              posts: [curr],
            });
          } else {
            item.posts.push(curr);
          }
          return acc;
        }, [] as IPosts[]) ?? null,
    },
    revalidate: 60,
  };
};

export const config = {
  // https://github.com/zeit/next.js/pull/11949
  unstable_runtimeJS: false,
};
