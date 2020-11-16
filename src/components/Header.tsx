import { theme } from "@/constants";
import Link from "next/link";

export const Header: React.FC = () => {
  const nav = [
    { link: "/", title: "home" },
    { link: "/blog", title: "blog" },
    // { link: "/project", title: "project" },
  ];
  return (
    <header className="header">
      <Link href="/">
        <a className="logo">Loi Tran</a>
      </Link>
      <Link href="/">
        <a className="logo logo-short">LT</a>
      </Link>
      <nav>
        <ul className="nav">
          {nav.map((item) => (
            <li key={item.title}>
              <Link href={item.link}>
                <a className="nav-item">{item.title}</a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <style jsx>{`
        .header {
          padding-top: 0.8rem;
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid ${theme.bgAlt};
        }

        .logo {
          text-decoration: none;
          font-size: 2rem;
          color: ${theme.fg};
        }
        .logo-short {
          display: none;
        }
        @media (max-width: 450px) {
          .logo {
            display: none;
          }
          .logo-short {
            display: unset;
          }
        }

        .nav {
          display: flex;
          list-style: none;
        }
        .nav-item {
          text-decoration: none;
          color: ${theme.fg};
          margin-left: 2rem;
        }
      `}</style>
    </header>
  );
};
