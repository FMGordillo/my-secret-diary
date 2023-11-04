import { type GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import Head from "next/head";
import { type FormEvent } from "react";
import invariant from "tiny-invariant";
import { authOptions } from "~/server/auth";
import { api } from "~/utils/api";

const sectionContainer = "rounded-lg bg-gray-800/50 p-8";

export default function App() {
  const { data: diaries, refetch } = api.diary.getDiary.useQuery();
  const mutation = api.diary.createDiary.useMutation();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    try {
      event.preventDefault();

      if (mutation.isLoading) {
        return;
      }

      const formData = new FormData(event.target as HTMLFormElement);
      const title = formData.get("title")?.toString();
      const content = formData.get("content")?.toString();

      invariant(content, "Content is required");

      void (await mutation.mutateAsync({
        title,
        content,
      }));

      void refetch();
    } catch (error) {
      console.error(error);
    } finally {
      (event.target as HTMLFormElement).reset();
    }
  }

  return (
    <>
      <Head>
        <title>My secret diary - ChiroTech</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto flex flex-col">
        <section className={sectionContainer}>
          <h2 className="mb-8 text-2xl">Create a new diary</h2>
          <form
            className="mx-auto max-w-md"
            onSubmit={(formData) => void handleSubmit(formData)}
          >
            <div className="form-control">
              <label className="label">
                <span className="label-text">Title</span>
                <input
                  name="title"
                  type="text"
                  className="input input-bordered w-full max-w-xs"
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Your notes</span>
                <textarea
                  required
                  name="content"
                  className="textarea textarea-bordered textarea-md w-full max-w-xs"
                ></textarea>
              </label>
            </div>

            <div className="mt-4 flex justify-center gap-4">
              <button className="btn btn-primary">
                Send note
                {mutation.isLoading && (
                  <span className="loading loading-spinner"></span>
                )}
              </button>

              <button type="reset" className="btn btn-secondary">
                Clear
              </button>
            </div>
          </form>
        </section>

        <section className={sectionContainer}>
          <h2 className="mb-8 text-2xl">Your diaries (top secret)</h2>
          <ul className="max-h-96 overflow-y-auto">
            {diaries?.map((diary) => (
              <div
                key={diary.id?.toString()}
                className="card mx-auto mb-8 max-w-md bg-base-100 shadow-xl"
              >
                <div className="card-body flex flex-col gap-4">
                  <h2 className="card-title">{diary.title?.toString()}</h2>
                  <div className="leading bg-[repeating-linear-gradient(transparent,_transparent_1.55em,_#373737_1.55em,_#373737_1.6em)] bg-local">
                    <p className="max-w-prose leading-relaxed ">
                      {diary.content?.toString()}
                    </p>
                  </div>
                  <p className="italic">
                    Created at {diary.createdAt?.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};
