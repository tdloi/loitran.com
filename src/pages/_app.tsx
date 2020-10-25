import { AppProps } from "next/app";
import Head from "next/head";
import "modern-normalize/modern-normalize.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "@/global.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="layout">
      <Head>
        <title>Loi Tran</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#12141c" key="theme-color" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" key="viewport" />
      </Head>
      <Header />
      <main className="content">
        <Component {...pageProps} />
      </main>
      <Footer />
      <style jsx>{`
        .layout {
          display: grid;
          grid-template-rows: auto 1fr auto;
          height: 100vh;
          max-width: 980px;
          margin: 0 auto;
          padding-left: 2rem;
          padding-right: 2rem;
        }
        .content {
          margin-bottom: 2rem;
        }
      `}</style>
    </div>
  );
}
