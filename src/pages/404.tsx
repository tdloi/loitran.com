import { theme } from "@/constants";
import { GetStaticProps } from "next";
import Head from "next/head";

interface IStory {
  id: number;
  title: string;
  time: number;
}

interface IProps {
  stories: Array<IStory>;
}

export default function NotFound(props: IProps) {
  return (
    <div>
      <Head>
        <title>Oops! Not Found</title>
      </Head>
      <h1 className="title">Oops! Nothing here, how about reading some news?!</h1>
      <ul>
        {props.stories?.map((story) => (
          <li key={story.id}>
            <a href={`https://news.ycombinator.com/item?id=${story.id}`} className="item">
              {story.title}
            </a>
          </li>
        ))}
      </ul>
      <style jsx>{`
        ul {
          list-style: circle;
          margin-left: 1.5rem;
        }
        .title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        .item {
          text-decoration: none;
          line-height: 2rem;
          color: ${theme.fg};
        }
        .item:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const res = await fetch(
    "https://hacker-news.firebaseio.com/v0/beststories.json?print=pretty&limitToFirst=5&orderBy=%22$key%22"
  );
  const ids = await res.json();
  const stories = await Promise.all<IStory>(
    ids.map((id: number) =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((res) => res.json())
    )
  );

  return {
    props: {
      stories: stories.sort((a, b) => b.time - a.time),
    },
    revalidate: 84600,
  };
};

export const config = {
  // https://github.com/zeit/next.js/pull/11949
  unstable_runtimeJS: false,
};
