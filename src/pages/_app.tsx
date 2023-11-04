import "~/styles/globals.css";
import Layout from "~/components/Layout";
import type { AppProps } from "next/app";
import type { NextPage } from "next";
import type { ReactElement, ReactNode } from "react";
import type { Session } from "next-auth";
import localFont from "next/font/local";
import { SessionProvider } from "next-auth/react";
import { WagmiConfig, createConfig, mainnet } from "wagmi";
import { api } from "~/utils/api";
import { createPublicClient, http } from "viem";

const config = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
});

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
  session: Session | null;
};

const geistFont = localFont({
  src: [
    {
      weight: "100",
      style: "normal",
      path: "../../fonts/Geist/Geist-UltraLight.woff2",
    },
    {
      weight: "300",
      style: "normal",
      path: "../../fonts/Geist/Geist-Light.woff2",
    },
    {
      weight: "300",
      style: "normal",
      path: "../../fonts/Geist/Geist-Thin.woff2",
    },
    {
      weight: "400",
      style: "normal",
      path: "../../fonts/Geist/Geist-Regular.woff2",
    },
    {
      weight: "500",
      style: "normal",
      path: "../../fonts/Geist/Geist-Medium.woff2",
    },
    {
      weight: "600",
      style: "normal",
      path: "../../fonts/Geist/Geist-SemiBold.woff2",
    },
    {
      weight: "700",
      style: "normal",
      path: "../../fonts/Geist/Geist-Bold.woff2",
    },
    {
      weight: "800",
      style: "normal",
      path: "../../fonts/Geist/Geist-Black.woff2",
    },
    {
      weight: "900",
      style: "normal",
      path: "../../fonts/Geist/Geist-UltraBlack.woff2",
    },
  ],
  variable: "--geist-font",
});

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) {
  const getLayout = Component?.getLayout ?? ((page) => <Layout>{page}</Layout>);

  return (
    <WagmiConfig config={config}>
      <SessionProvider session={session as Session}>
        <div className={`${geistFont.className} h-full`}>
          {getLayout(<Component {...pageProps} />)}
        </div>
      </SessionProvider>
    </WagmiConfig>
  );
}

export default api.withTRPC(MyApp);
