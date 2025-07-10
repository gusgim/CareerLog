import { initTRPC, TRPCError } from "@trpc/server"
import superjson from "superjson"
import { ZodError } from "zod"

import { createClient } from "@/lib/supabase/server"

/**
 * This is the context that is passed to all tRPC procedures
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const supabase = createClient()

  return {
    supabase,
    ...opts,
  }
}

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

/**
 * 3. ROUTER & PROCEDURE HELPERS
 *
 * These are helper functions that allow you to create new routers and procedures more easily.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 */
export const createTRPCRouter = t.router

/**
 * Public (unauthenticated) procedure
 */
export const publicProcedure = t.procedure

/**
 * Protected (authenticated) procedure
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const supabase = ctx.supabase
  let user = null

  try {
    // 실제 Supabase 인증 시도
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    user = supabaseUser
  } catch (error) {
    // 개발 모드: 요청 헤더에서 개발 모드 세션 확인
    const devSession = ctx.headers.get('x-dev-session')
    
    if (devSession) {
      try {
        const decodedSession = decodeURIComponent(Buffer.from(devSession, 'base64').toString())
        const mockUser = JSON.parse(decodedSession)
        user = mockUser
      } catch (e) {
        // 디코딩 실패 시 무시
      }
    }
  }

  if (!user) {
    // 개발 모드: 기본 사용자 생성
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
    if (supabaseUrl.includes('demo') || supabaseUrl.includes('placeholder')) {
      user = {
        id: 'dev-user-default',
        email: 'dev@example.com',
        user_metadata: { full_name: '개발자' }
      }
    } else {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to access this resource",
      })
    }
  }

  return next({
    ctx: {
      ...ctx,
      user,
    },
  })
}) 