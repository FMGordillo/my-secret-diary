import Head from "next/head";

const Sparks = () => (
  <span role="img" aria-label="sparkles">
    ✨
  </span>
);

export default function Home() {
  return (
    <>
      <Head>
        <title>My Diary - ChiroTech</title>
        <meta
          name="description"
          content="🔒 Live example on how adapt Web3 in your company"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex min-h-full flex-col items-center justify-center bg-gradient-to-br from-[#b16788] to-[#012a58]">
        <section className="hero py-16 ">
          <div className="hero-content flex flex-col gap-4 md:flex-row-reverse md:gap-8">
            <div className="flex max-w-sm items-center justify-center">
              <img src="/intro.jpeg" className="w-full rounded-lg shadow-2xl" />
            </div>
            <div className="flex flex-col gap-4">
              <h1 className="text-xl md:text-4xl">
                <span className="text-4xl font-bold md:text-7xl">
                  Share your secrets
                </span>
                <br />{" "}
                <span>
                  Secured with your wallet key{" "}
                  <span role="img" aria-label="lock">
                    🔒
                  </span>
                </span>
              </h1>
              <p className="text-center italic">
                Try it out <Sparks /> at no cost <Sparks />
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
