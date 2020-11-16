import { GetStaticProps, GetStaticPaths } from "next";
import { BlockMapType } from "react-notion";
import { getTweet, proxyFetch, codeHighlight, ITwitterOptions } from "@tdloi/notion-utils";
import { IBlogPosts, PageProps } from "@/interfaces";
import { getPosts, getPage, dayjs } from "@/helpers";
import { WORKER_PROXY } from "@/constants";
import { Head } from "@/components/Head";
import { Content } from "@/components/Content";

interface IProps {
  page: PageProps;
  metadata: IBlogPosts;
  content: BlockMapType;
  postsIndex: Record<string, string>;
}

export default function Home(props: IProps) {
  return (
    <div className="container">
      <Head page={props.page} />
      <section className="section">
        <h1 className="post-title">{props.metadata?.name}</h1>
        <span className="post-date">{dayjs(props.metadata.date).format("DD MMMM, YYYY")}</span>
        <Content blockMap={props.content} postsIndex={props.postsIndex} />
      </section>
      <style jsx>{`
        .section {
          margin-top: 1rem;
        }
        .intro {
          font-size: 2.5rem;
          font-weight: 600;
        }
        .post-title {
          font-size: 2rem;
          margin-top: 0.5rem;
          margin-bottom: 0;
        }
        .post-date {
          color: var(--fgAlt);
          font-size: 0.95rem;
        }
        @media (max-width: 767px) {
          .video {
            max-height: 33vh;
          }
        }
        .code {
          font-size: 0.88rem;
          padding: 0.1rem 0.2rem;
          background: #b0a8a82b;
        }
      `}</style>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPosts("", 2);

  return {
    paths:
      posts?.map((post) => {
        return {
          params: { slug: post.slug },
        };
      }) ?? [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  let { slug }: any = context.params;
  if (typeof slug !== "string") {
    slug = slug[0];
  }

  const posts = await getPosts();
  const postsIndex = posts.reduce<Record<string, string>>((acc, curr) => {
    acc[curr.id] = curr.slug;
    return acc;
  }, {});

  const metadata = posts.find((i) => i.slug === slug);
  if (metadata == undefined) {
    return {
      props: {
        metadata: null,
      },
      notFound: true,
    };
  }

  const blocks = await getPage(metadata.id);

  for (let key in blocks.recordMap.block) {
    const content = blocks.recordMap.block[key].value;
    if (content.type === "code") {
      // @ts-ignore
      content.hightlight = await codeHighlight(content, require("shiki"));
    }
    if (content.type === "tweet") {
      const options: ITwitterOptions = WORKER_PROXY ? { fetch: proxyFetch(WORKER_PROXY) } : {};
      // @ts-ignore
      content.meta = await getTweet(content.properties.source[0][0], options);
    }
  }

  return {
    props: {
      metadata: metadata,
      page: {
        title: (metadata.name ?? "") + "| Loi Tran Blog",
        description: metadata.description ?? "",
      },
      content: blocks.recordMap.block,
      postsIndex: postsIndex,
    },
    revalidate: 60,
  };
};

export const config = {
  // https://github.com/zeit/next.js/pull/11949
  unstable_runtimeJS: false,
};
