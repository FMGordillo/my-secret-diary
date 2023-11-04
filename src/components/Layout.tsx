// FIXME: Should this be here?
declare global {
  interface Window {
    ethereum: {
      on: (event: string, callback: (accounts: unknown[]) => void) => void;
      removeListener: (
        event: string,
        callback: (args: unknown[]) => void,
      ) => void;
    };
  }
}

import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useEffect, type PropsWithChildren } from "react";

type LayoutProps = PropsWithChildren;

export default function Layout({ children }: LayoutProps) {
  const { data: sessionData } = useSession();

  const handleAccountsChanged = (accounts: unknown[]) => {
    console.log("acount changed", accounts);
    if (accounts.length === 0) {
      // TODO: maybe notify the user that their wallet is not connected
      void signOut();
    }
  };

  useEffect(() => {
    const tryThis = () => {
      try {
        window.ethereum.on("accountsChanged", handleAccountsChanged);
      } catch (error) {
        console.error(error);
      }
    };
    tryThis();

    return () => {
      if (window && window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged,
        );
      }
    };
  }, [sessionData]);

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex h-full flex-col">
        <header className="bg-primary/70">
          <div className="container mx-auto flex items-center justify-between p-2">
            <Link href="/app">
              <span className="text-xl">Your secret diary</span>
            </Link>
            <button
              className={`btn ${
                sessionData ? "animate-none" : "motion-safe:animate-bounce"
              }`}
              onClick={sessionData ? () => void signOut() : () => void signIn()}
            >
              {sessionData ? "sign out" : "sign in"}
            </button>
          </div>
        </header>
        <main className="h-full">{children}</main>
      </div>
    </>
  );
}
