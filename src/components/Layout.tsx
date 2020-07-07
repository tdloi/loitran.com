import { Header } from "./Header";
import { Footer } from "./Footer";

export const Layout: React.FC = (props) => {
  return (
    <div className="layout">
      <Header />
      <main className="content">{props.children}</main>
      <Footer />
      <style jsx>{`
        .layout {
          display: grid;
          grid-template-rows: auto 1fr auto;
          height: 100vh;
          max-width: 1080px;
          margin: 0 auto;
          padding-left: 2rem;
          padding-right: 2rem;
        }
        .content {
          padding-top: 2rem;
          padding-bottom: 2rem;
        }
      `}</style>
    </div>
  );
};
