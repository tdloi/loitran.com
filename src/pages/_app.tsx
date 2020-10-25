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
}
