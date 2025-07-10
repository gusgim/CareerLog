import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"

const profileSchema = z.object({
  full_name: z.string().min(1, "이름을 입력해주세요"),
  department: z.string().optional(),
  role: z.string().optional(),
  hospital: z.string().optional(),
  phone: z.string().optional(),
})

export const profileRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const { data: profile } = await ctx.supabase
      .from("profiles")
      .select("*")
      .eq("id", ctx.user.id)
      .single()

    return profile
  }),

  create: protectedProcedure
    .input(profileSchema)
    .mutation(async ({ ctx, input }) => {
      const { data: profile, error } = await ctx.supabase
        .from("profiles")
        .insert({
          id: ctx.user.id,
          ...input,
        })
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return profile
    }),

  update: protectedProcedure
    .input(profileSchema.partial())
    .mutation(async ({ ctx, input }) => {
      const { data: profile, error } = await ctx.supabase
        .from("profiles")
        .update(input)
        .eq("id", ctx.user.id)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return profile
    }),
}) 