import { createTRPCRouter } from "@/server/api/trpc"
import { categoryRouter } from "@/server/api/routers/category"
import { logRouter } from "@/server/api/routers/log"
import { profileRouter } from "@/server/api/routers/profile"
import { adminRouter } from "@/server/api/routers/admin"

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  category: categoryRouter,
  log: logRouter,
  profile: profileRouter,
  admin: adminRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter 