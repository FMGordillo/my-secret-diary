import Head from "next/head";

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

      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-[#b16788] to-[#012a58]">
        <section className="hero py-16 ">
          <div className="hero-content flex gap-4 md:gap-8 flex-col md:flex-row-reverse">
            <div className="flex items-center justify-center max-w-sm">
              <img src="/intro.jpeg" className="motion-reduce:animate-bounce w-full rounded-lg shadow-2xl" />
            </div>
            <h1 className="text-4xl">
              <span className="text-6xl font-bold">Share your secrets</span>
              <br /> <span>Secured with your wallet key</span>
            </h1>
          </div>
        </section>
      </div>
    </>
  );
}
