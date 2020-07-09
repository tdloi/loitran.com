import { GetStaticProps } from "next";
import { getBlogList, getIndex } from "../lib/notion";
import Link from "next/link";
import { theme } from "../theme";

export default function Home(props) {
  return (
    <div className="container">
      <p className="intro">Hi, I'm Loi</p>
      {props.index.about.map((i) => {
        if (i === null) return <br />;
        return <p key={i}>{i}</p>;
      })}
      <section className="section">
        <h1 className="title">Recently Posts</h1>
        <ul>
          {props.blogs.map((i) => (
            <Link key={i.slug} href={`/post/${i.slug}`}>
              <p>
                <span className="post-date">{i.date}</span>
                <span>{i.name}</span>
              </p>
            </Link>
          ))}
        </ul>
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
        .post-date {
          margin-right: 0.7rem;
          margin-bottom: 0.4rem;
          color: ${theme.fgAlt};
        }
      `}</style>
    </div>
  );
}
export const getStaticProps: GetStaticProps = async (context) => {
  const recentsPost = await getBlogList(3);
  const index = await getIndex();

  return {
    props: {
      index: index,
      blogs: recentsPost,
    },
  };
};
