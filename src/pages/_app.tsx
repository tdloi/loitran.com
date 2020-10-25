import { AppProps } from "next/app";
import Head from "next/head";
import "modern-normalize/modern-normalize.css";
import { Layout } from "@/components/Layout";
import "@/global.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Head>
        <title>Loi Tran</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </Layout>
  );
}
