import { FC } from "react";
import Link from "next/link";
import { IBlogEntry } from "@/interfaces";
import { formatDate } from "@/helpers";

interface IProps {
  entries: Array<IBlogEntry>;
}

export const BlogEntries: FC<IProps> = (props) => {
  return (
    <ul className="posts">
      {props?.entries?.map((post) => (
        <li key={post.slug}>
          <Link href={`/post/${post.slug}`}>
            <a className="post">
              <span className="post-date">{formatDate(post.date)}</span>
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
          border-bottom: 2px solid var(--fgAlt);
        }
        .post-date {
          margin-right: 0.7rem;
          margin-bottom: 0.4rem;
          color: var(--fgAlt);
          font-size: 0.95rem;
        }
        .post-title {
          color: var(--fg);
          font-size: 1.2rem;
        }
      `}</style>
    </ul>
  );
};
