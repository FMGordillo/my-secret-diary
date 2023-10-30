import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import type { PropsWithChildren } from "react";

type LayoutProps = PropsWithChildren;

export default function Layout({ children }: LayoutProps) {
  const { data: sessionData } = useSession();
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="bg-red-900">
        <div className="container mx-auto flex items-center justify-between py-2">
          <span className="text-xl">Your secret diary</span>
          <button
            className="btn"
            onClick={sessionData ? () => void signOut() : () => void signIn()}
          >
            {sessionData ? "sign out" : "sign in"}
          </button>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
