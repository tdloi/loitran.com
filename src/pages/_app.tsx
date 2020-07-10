import { AppProps } from "next/app";
import Head from "next/head";
// @ts-ignore
import resetCSS from "minireset.css";
import "../assets/prism-atom-dark.css";
import "typeface-raleway";
import { Layout } from "../components/Layout";
import { theme } from "../theme";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Head>
        <title>Loi Tran</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
      <style jsx global>
        {resetCSS}
      </style>
      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          background: ${theme.bg};
          color: ${theme.fg};
          font-family: Raleway, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu,
            Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
          font-size: 18px;
          line-height: 1.75;
        }
      `}</style>
    </Layout>
  );
}
