import { getCsrfToken, signIn, useSession } from "next-auth/react";
import { SiweMessage } from "siwe";
import { useAccount, useConnect, useNetwork, useSignMessage } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { type ReactElement, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { type GetServerSideProps } from "next";

export default function SignInPage() {
  const modalRef = useRef<HTMLDialogElement>(null);
  const { signMessageAsync } = useSignMessage();
  const { chain } = useNetwork();
  const { address, isConnected } = useAccount();
  const { isLoading, connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogin = async () => {
    try {
      const callbackUrl = "/";
      const message = new SiweMessage({
        domain: window.location.origin,
        address: address,
        statement:
          "(ChiroTech): Sign in with your Ethereum wallet, see how easy it is!",
        uri: window.location.origin,
        version: "1",
        chainId: chain?.id,
        nonce: await getCsrfToken(),
      });

      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      });

      void signIn("ethereum-login", {
        message: JSON.stringify(message),
        redirect: false,
        signature,
        callbackUrl,
      });
    } catch (error) {
      window.alert(error);
    }
  };

  const showModal = () => {
    if (modalRef) {
      modalRef.current?.showModal();
    }
  };

  useEffect(() => {
    if (isConnected && !session) {
      void handleLogin();
      return;
    }

    if (isConnected) {
      void router.replace("/app");
    }
  }, [router, session, isConnected]);

  return (
    <main className="container mx-auto flex h-screen items-center justify-center">
      <div className="mockup-window border border-base-300 bg-neutral-800">
        <div className="flex flex-col justify-center gap-4 border-t border-base-300 p-8">
          <div>
            <h1 className="text-xl font-bold">Select your login method</h1>
            <p>Hint: There&apos;s only one logical option</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={(e) => {
              e.preventDefault();
              if (!isConnected) {
                connect();
                showModal();
              } else {
                void handleLogin();
              }
            }}
          >
            {isLoading && (
              <img
                src="/loading.svg"
                className="w-6 motion-safe:animate-spin"
                alt="loading-image"
              />
            )}
            Sign in with Ethereum
          </button>

          <button className="btn btn-primary" disabled>
            Sign in with Google
          </button>

          <button className="btn" disabled>
            Sign in with Facebook
          </button>
        </div>
      </div>

      <dialog ref={modalRef} id="message_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="text-lg font-bold">Sign the message sent to you</h3>

          <p className="my-4">
            You should see in Metamask something similar to the message below:
          </p>

          <pre className="max-w-prose whitespace-pre-line bg-[#24272a] p-4">
            http://localhost:3000 wants you to sign in with your Ethereum
            account:
            <br />
            0x...
            <br />
            <br />
            (ChiroTech): Sign in with your Ethereum wallet, see how easy it is!
            <br />
            <br />
            URI: http://localhost:3000
            <br />
            Version: 1
            <br />
            Chain ID: 5
            <br />
            Nonce: ...
            <br />
            Issued At: {new Date().toDateString()}
          </pre>

          <p className="mt-4">
            Please <b>confirm</b> the message and you will be signed in
          </p>
        </div>
      </dialog>
    </main>
  );
}

SignInPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <Head>
        <title>Sign in with Ethereum</title>
      </Head>
      {page}
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      csrfToken: (await getCsrfToken(context)) ?? null,
    },
  };
};
