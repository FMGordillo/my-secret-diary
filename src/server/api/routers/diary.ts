import { createId } from "@paralleldrive/cuid2";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { diaries } from "~/server/db/schema";

export const diaryRouter = createTRPCRouter({
  getDiary: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(diaries)
      .where(eq(diaries.userId, ctx.session.user.id))
      .orderBy(desc(diaries.createdAt));
  }),
  deleteDiary: protectedProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    return ctx.db
      .delete(diaries)
      .where(eq(diaries.id, input))
  }),
  createDiary: protectedProcedure
    .input(z.object({ title: z.string().optional(), content: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db
        .insert(diaries)
        .values({
          ...input,
          id: createId(),
          title: !!input.title ? input.title : undefined,
          userId: ctx.session.user.id,
          createdAt: new Date(),
        })
        .returning()
        .get();
    }),
});
