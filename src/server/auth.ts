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
import { sql } from "drizzle-orm";
import { users } from "./db/schema";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  debug: true,
  pages: {
    signIn: "/sign-in",
    // signOut: "/sign-out",
    // error: "/error",
    // verifyRequest: "/verify-request",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      console.log('redirect', { url, baseUrl });
      return baseUrl
    },
    async session({ session, token }: { session: any; token: any }) {
      console.log({ session, token });
      // session.address = token.sub;
      session.user.id = token.sub;
      // session.user.image = "https://www.fillmurray.com/128/128";
      return session;
    },
  },
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  adapter: SQLiteDrizzleAdapter(db, sqliteTable),
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
          const siwe = new SiweMessage(
            JSON.parse(credentials?.message || "{}"),
          );
          const nextAuthUrl = new URL(env.NEXTAUTH_URL);

          // I think nonce only works without localhost
          // const nonce = await getCsrfToken({ req })
          // console.log('haber ese nons', nonce)

          const result = await siwe.verify({
            signature: credentials?.signature || "",
            domain: nextAuthUrl.host,
            // nonce,
          });

          console.log("yay", siwe);
          console.log({ result });

          if (result.success) {
            // Should I persist this somewhere?

            const currentUser = await db.run(
              sql`SELECT * FROM ${users} WHERE ethAddress = ${siwe.address}`,
            );

            if (currentUser.rows.length > 0) {
              console.log(currentUser.rows[0])
              return currentUser.rows[0];
            } else {
              const createdUser = await db.run(
                sql`INSERT INTO ${users} (ethAddress) VALUES (${siwe.address})`,
              );
              console.log(createdUser.rows[0])
              return createdUser.rows[0];
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
