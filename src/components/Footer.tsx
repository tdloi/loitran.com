import { theme } from "@/constants";

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <a className="link" href="https://github.com/tdloi">
        github
      </a>
      <span className="interpunct">・</span>
      <a className="link" href="https://twitter.com/tdloi">
        twitter
      </a>
      <style jsx>{`
        .footer {
          padding: 0.8rem 0;
          border-top: 1px solid ${theme.bgAlt};
          line-height: 1.7rem;
          display: flex;
          justify-content: flex-end;
        }
        .link {
          text-decoration: underline;
          color: ${theme.fg};
        }
        .interpunct {
          margin-left: 0.35rem;
          margin-right: 0.35rem;
        }
      `}</style>
    </footer>
  );
};
