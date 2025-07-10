import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"

export const categoryRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const { data: categories } = await ctx.supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: true })

    return categories || []
  }),

  getByName: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data: category } = await ctx.supabase
        .from("categories")
        .select("*")
        .eq("name", input.name)
        .single()

      return category
    }),
}) 