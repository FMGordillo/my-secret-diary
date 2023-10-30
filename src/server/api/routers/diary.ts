import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { diaries } from "~/server/db/schema";

export const diaryRouter = createTRPCRouter({
  getDiary: protectedProcedure.query(async ({ ctx }) => {
    console.log(ctx.session);
    const data = await ctx.db.run(
      sql`SELECT * FROM ${diaries} WHERE userId = ${ctx.session.user.id}`,
    );
    return data.rows;
  }),
  createDiary: protectedProcedure
    .input(z.object({ title: z.string(), content: z.string() }))
    .mutation(async ({ input, ctx }) => {
      console.log(ctx.session);
      // TODO: Why do I have to put createId here?
      const data = await ctx.db.run(
        sql`INSERT INTO ${diaries} (id, title, content, userId) VALUES (${createId()}, ${input.title
          }, ${input.content}, ${ctx.session.user.id})`,
      );

      return data.rowsAffected === 1;
    }),
  // hello: publicProcedure
  //   .input(z.object({ text: z.string() }))
  //   .query(async ({ ctx, input }) => {
  //     const total = await ctx.db.run(sql`SELECT COUNT(*) as total FROM my_secret_diary_user`)
  //     return total.rows[0]?.total?.toString()
  //   }),
  //
  // getSecretMessage: protectedProcedure.query(() => {
  //   return "you can now see this secret message!";
  // }),
});
