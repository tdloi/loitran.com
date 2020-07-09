import { theme } from "../theme";
import { FC } from "react";
import { IBlogEntry } from "../interfaces";
import Link from "next/link";
import { formatDate } from "../helpers";

interface IProps {
  entries: Array<IBlogEntry>;
}

export const BlogEntries: FC<IProps> = (props) => {
  return (
    <ul>
      {props.entries.map((post) => (
        <li key={post.slug}>
          <Link href={`/post/${post.slug}`}>
            <a className="post-entry">
              <span className="post-date">{formatDate(post.date)}</span>
              <span className="post-title">{post.name}</span>
            </a>
          </Link>
        </li>
      ))}
      <style jsx>{`
        .post-entry {
          text-decoration: none;
        }
        .post-entry:hover {
          border-bottom: 2px solid ${theme.fgAlt};
        }
        .post-date {
          margin-right: 0.7rem;
          margin-bottom: 0.4rem;
          color: ${theme.fgAlt};
        }
        .post-title {
          color: ${theme.fg};
        }
      `}</style>
    </ul>
  );
};
