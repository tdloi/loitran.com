import { FC } from "react";
import Link from "next/link";
import { IBlogPosts } from "@/interfaces";
import dayjs from "dayjs";
import { theme } from "@/constants";

interface IProps {
  posts: IBlogPosts[];
}

export const BlogPosts: FC<IProps> = (props) => {
  return (
    <ul className="posts">
      {props?.posts?.map((post) => (
        <li key={post.slug}>
          <Link href={`/post/${post.slug}`}>
            <a className="post">
              <span className="post-date">{dayjs(post.date).format("DD MMM")}</span>
              <span className="post-title">{post.name}</span>
            </a>
          </Link>
        </li>
      ))}
      <style jsx>{`
        .posts {
          margin-top: 0.5rem;
        }
        .post {
          text-decoration: none;
        }
        .post:hover {
          border-bottom: 2px solid ${theme.fgAlt};
        }
        .posts li:hover::marker {
          color: ${theme.primary};
        }
        .post-date {
          margin-right: 0.7rem;
          margin-bottom: 0.4rem;
          color: ${theme.fgAlt};
          font-size: 0.92rem;
        }
        .post-title {
          color: ${theme.fg};
          font-size: 1.2rem;
        }
      `}</style>
    </ul>
  );
};
