import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { env } from "~/env.mjs";
import { db } from "~/server/db";
import { sqliteTable } from "~/server/db/schema";
import { SQLiteDrizzleAdapter } from "./drizzleSqliteAdapter";
// import { getCsrfToken } from "next-auth/react"
import { SiweMessage } from "siwe";
import CredentialsProvider from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { users } from "./db/schema";
import { type BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import invariant from "tiny-invariant";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      ethAddress: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    ethAddress: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  debug: true,
  pages: {
    signIn: "/sign-in",
    // signOut: "/sign-out",
    // error: "/error",
    // verifyRequest: "/verify-request",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.ethAddress = user.ethAddress;
      }
      return token;
    },
    session({ session, token }) {
      session.user.ethAddress = token.ethAddress as string | null;
      session.user.id = token.sub ?? "";
      return session;
    },
  },
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  adapter: SQLiteDrizzleAdapter(
    db as BaseSQLiteDatabase<"async", unknown>,
    sqliteTable,
  ),
  providers: [
    CredentialsProvider({
      id: "ethereum-login",
      name: "Ethereum",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials) {
        try {
          const siweMessage = JSON.parse(
            credentials?.message ?? "{}",
          ) as object;

          invariant(
            typeof siweMessage === "object",
            "siweMessage should be a valid object",
          );

          const siwe = new SiweMessage(siweMessage);
          const nextAuthUrl = new URL(env.NEXTAUTH_URL);

          // I think nonce only works without localhost
          // const nonce = await getCsrfToken({ req })
          // console.log('haber ese nons', nonce)

          const result = await siwe.verify({
            signature: credentials?.signature ?? "",
            domain: nextAuthUrl.host,
            // nonce,
          });

          if (result.success) {
            const currentUser = await db
              .select()
              .from(users)
              .where(eq(users.ethAddress, siwe.address))
              .get();

            if (currentUser) {
              return currentUser;
            } else {
              return db
                .insert(users)
                .values({
                  ethAddress: siwe.address,
                })
                .returning()
                .get();
            }
          }

          return null;
        } catch (e) {
          console.log(e);

          return null;
        }
      },
    }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
