import { AppProps } from "next/app";
import Head from "next/head";
import "modern-normalize/modern-normalize.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { theme } from "@/constants";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="wrapper">
      <Head>
        <title>Loi Tran</title>
        <link rel="icon" href="favicon.svg" sizes="any" type="image/svg+xml" />
        <meta name="theme-color" content={theme.bg} key="theme-color" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" key="viewport" />
      </Head>
      <Header />
      <main className="container">
        <Component {...pageProps} />
      </main>
      <Footer />
      <style jsx>{`
        .wrapper {
          display: grid;
          grid-template-rows: auto 1fr auto;
          height: 100vh;
          max-width: 980px;
          margin: 0 auto;
          padding-left: 2rem;
          padding-right: 2rem;
        }
        .container {
          margin-bottom: 2rem;
        }
      `}</style>
      <style jsx global>{`
        @font-face {
          font-family: "SpaceGrotesk";
          font-style: normal;
          font-weight: 400;
          font-display: swap;
          src: url("/SpaceGrotesk-Regular.woff2") format("woff2");
        }

        html,
        body {
          padding: 0;
          margin: 0;
          background: ${theme.bg};
          color: ${theme.fg};
          font-family: SpaceGrotesk, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
            Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
          font-size: 18px;
          line-height: 1.65;
        }

        .shiki {
          padding: 1rem 0.5rem;
        }
        @media (min-width: 560px) {
          .shiki {
            padding: 1rem 1.2rem;
          }
        }

        blockquote {
          border-left: solid 2px;
          margin: 0;
          padding: 0.25rem 0;
          padding-left: 1rem;
        }

        pre {
          overflow: auto;
          width: calc(100vw - 4rem);
          max-width: calc(980px - 4rem);
        }

        .notion-link {
          color: ${theme.fg};
          text-decoration-color: ${theme.primary};
          text-decoration-style: double;
        }

        .notion-callout {
          display: flex;
          padding: 0.6rem 0.3rem;
          border: solid 1px rgb(77, 77, 83);
        }
        .notion-callout .notion-emoji {
          margin-right: 0.5rem;
        }
        .notion-code {
          font-size: 0.88rem;
          padding: 0.1rem 0.2rem;
          background: #b0a8a82b;
        }
        @media (max-width: 767px) {
          .video {
            max-height: 33vh;
          }
        }
      `}</style>
    </div>
  );
}
