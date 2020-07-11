import { theme } from "../theme";

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div>
        <a className="link" href="https://github.com/tdloi">
          github
        </a>
        <a className="link" href="https://twitter.com/tdloi">
          twitter
        </a>
      </div>
      <div>
        Powered by <span className="brand nextjs">NextJS</span> +{" "}
        <span className="brand notion">Notion</span>
      </div>
      <style jsx>{`
        .footer {
          padding: 0.8rem 0;
          border-top: 1px solid ${theme.bgAlt};
          display: flex;
          flex-direction: row-reverse;
          justify-content: space-between;
          line-height: 1.7rem;
        }
        @media (max-width: 570px) {
          .footer {
            flex-direction: column;
            align-items: center;
          }
        }
        .brand {
          letter-spacing: 0.5px;
          font-weight: 500;
        }
        .nextjs {
          color: yellow;
        }
        .vercel {
          color: plum;
        }
        .notion {
          color: ghostwhite;
        }
        .link {
          text-decoration: underline;
          color: ${theme.fg};
          margin-left: 1rem;
        }
      `}</style>
    </footer>
  );
};
