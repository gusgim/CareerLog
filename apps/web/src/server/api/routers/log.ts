import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { TRPCError } from "@trpc/server"

const createLogSchema = z.object({
  log_date: z.string().date("올바른 날짜를 입력해주세요"),
  category: z.string().min(1, "카테고리를 선택해주세요"),
  subcategory: z.string().optional(),
  details: z.string().min(1, "활동 내용을 입력해주세요"),
  tags: z.array(z.string()).default([]),
  attachments: z.array(z.object({
    url: z.string(),
    path: z.string(),
    name: z.string(),
    size: z.number(),
    type: z.string()
  })).default([]),
  duration_hours: z.number().positive().optional(),
  metadata: z.record(z.any()).default({}),
})

const updateLogSchema = createLogSchema.partial().extend({
  id: z.number(),
})

const updateDateSchema = z.object({
  id: z.number(),
  log_date: z.string().date(),
})

const getLogsSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  category: z.string().optional(),
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
  search: z.string().optional(),
})

// 개발 모드용 메모리 저장소
interface MockLog {
  id: number
  user_id: string
  log_date: string
  category: string
  subcategory?: string
  details: string
  tags: string[]
  attachments: any[]
  duration_hours?: number
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  status: string
}

const devModeStorage: MockLog[] = [
  {
    id: 1,
    user_id: 'dev-user',
    log_date: '2025-01-08',
    category: 'clinical',
    subcategory: '일반근무',
    details: '내과 외래 근무 - 환자 20명 진료 보조',
    tags: ['외래', '내과'],
    attachments: [],
    duration_hours: 8,
    metadata: { duty_type: 'Day', department: '내과' },
    created_at: '2025-01-08T09:00:00Z',
    updated_at: '2025-01-08T09:00:00Z',
    status: 'active'
  },
  {
    id: 2,
    user_id: 'dev-user',
    log_date: '2025-01-07',
    category: 'education',
    subcategory: '원내교육',
    details: '감염관리 교육 이수',
    tags: ['교육', '감염관리'],
    attachments: [],
    duration_hours: 2,
    metadata: { education_type: '원내교육', institution: '병원 교육센터' },
    created_at: '2025-01-07T14:00:00Z',
    updated_at: '2025-01-07T14:00:00Z',
    status: 'active'
  },
  {
    id: 3,
    user_id: 'dev-user',
    log_date: '2025-01-06',
    category: 'performance',
    subcategory: 'research',
    details: '환자 안전 개선 연구 프로젝트 참여',
    tags: ['연구', '환자안전'],
    attachments: [],
    duration_hours: 4,
    metadata: { subcategory: 'research', role: 'team_member' },
    created_at: '2025-01-06T10:00:00Z',
    updated_at: '2025-01-06T10:00:00Z',
    status: 'active'
  }
]

// 데이터베이스 연결 확인 헬퍼
const checkDatabaseConnection = (supabaseUrl: string) => {
  if (supabaseUrl.includes('demo')) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Supabase 환경 변수가 설정되지 않았습니다. 실제 데이터베이스에 연결하려면 .env.local 파일을 설정해주세요.",
    })
  }
}

export const logRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createLogSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // 환경 변수 확인
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
        
        // 개발 모드에서는 메모리 저장소에 실제로 저장
        if (supabaseUrl.includes('demo') || supabaseUrl.includes('placeholder')) {
          const newLog: MockLog = {
            id: Date.now(),
            user_id: ctx.user.id,
            ...input,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: 'active'
          }
          
          // 메모리 저장소에 추가
          devModeStorage.push(newLog)
          
          console.log(`✅ 개발 모드: 새 활동 저장됨 - ${newLog.details}`)
          console.log(`📊 현재 저장된 활동 수: ${devModeStorage.length}개`)
          
          return newLog
        }

        checkDatabaseConnection(supabaseUrl)

        const { data: log, error } = await ctx.supabase
          .from("logs")
          .insert({
            user_id: ctx.user.id,
            ...input,
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `데이터베이스 오류: ${error.message}`,
          })
        }

        return log
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "활동 기록 중 예상치 못한 오류가 발생했습니다.",
        })
      }
    }),

  getAll: protectedProcedure
    .input(getLogsSchema)
    .query(async ({ ctx, input }) => {
      try {
        // 환경 변수 확인
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
        
        // 개발 모드에서는 메모리 저장소에서 데이터 조회
        if (supabaseUrl.includes('demo') || supabaseUrl.includes('placeholder')) {
          // 현재 사용자의 로그만 필터링 (개발 모드에서는 모든 로그가 dev-user로 저장됨)
          let filteredLogs = devModeStorage.filter(log => log.status === 'active')
          
          // 날짜 순으로 정렬 (최신순)
          filteredLogs.sort((a, b) => {
            if (a.log_date !== b.log_date) {
              return new Date(b.log_date).getTime() - new Date(a.log_date).getTime()
            }
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          })
          
          // 필터 적용
          if (input.category) {
            filteredLogs = filteredLogs.filter(log => log.category === input.category)
          }
          
          if (input.dateFrom) {
            filteredLogs = filteredLogs.filter(log => log.log_date >= input.dateFrom!)
          }
          
          if (input.dateTo) {
            filteredLogs = filteredLogs.filter(log => log.log_date <= input.dateTo!)
          }
          
          if (input.search) {
            filteredLogs = filteredLogs.filter(log => 
              log.details.includes(input.search!) || 
              log.tags.some(tag => tag.includes(input.search!))
            )
          }
          
          console.log(`📊 개발 모드: ${filteredLogs.length}개의 활동 조회됨`)
          
          return filteredLogs.slice(input.offset, input.offset + input.limit)
        }

        checkDatabaseConnection(supabaseUrl)

        let query = ctx.supabase
          .from("logs")
          .select("*")
          .eq("user_id", ctx.user.id)
          .eq("status", "active")
          .order("log_date", { ascending: false })
          .order("created_at", { ascending: false })

        // 카테고리 필터
        if (input.category) {
          query = query.eq("category", input.category)
        }

        // 날짜 범위 필터
        if (input.dateFrom) {
          query = query.gte("log_date", input.dateFrom)
        }
        if (input.dateTo) {
          query = query.lte("log_date", input.dateTo)
        }

        // 검색 필터
        if (input.search) {
          query = query.or(`details.ilike.%${input.search}%,tags.cs.{${input.search}}`)
        }

        const { data: logs, error } = await query
          .range(input.offset, input.offset + input.limit - 1)

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `데이터 조회 오류: ${error.message}`,
          })
        }

        return logs || []
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "활동 데이터를 불러오는 중 오류가 발생했습니다.",
        })
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
        
        // 개발 모드에서는 메모리 저장소에서 조회
        if (supabaseUrl.includes('demo') || supabaseUrl.includes('placeholder')) {
          const log = devModeStorage.find(log => log.id === input.id && log.status === 'active')
          
          if (!log) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "요청한 활동을 찾을 수 없습니다.",
            })
          }
          
          console.log(`🔍 개발 모드: 활동 조회 - ${log.details}`)
          return log
        }

        checkDatabaseConnection(supabaseUrl)

        const { data: log, error } = await ctx.supabase
          .from("logs")
          .select("*")
          .eq("id", input.id)
          .eq("user_id", ctx.user.id)
          .single()

        if (error) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "요청한 활동을 찾을 수 없습니다.",
          })
        }

        return log
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "활동 데이터를 불러오는 중 오류가 발생했습니다.",
        })
      }
    }),

  update: protectedProcedure
    .input(updateLogSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
        
        // 개발 모드에서는 메모리 저장소에서 업데이트
        if (supabaseUrl.includes('demo') || supabaseUrl.includes('placeholder')) {
          const { id, ...updateData } = input
          const logIndex = devModeStorage.findIndex(log => log.id === id && log.status === 'active')
          
          if (logIndex === -1) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "수정할 활동을 찾을 수 없습니다.",
            })
          }
          
          // 업데이트 적용
          const updatedLog = {
            ...devModeStorage[logIndex],
            ...updateData,
            updated_at: new Date().toISOString(),
          }
          
          devModeStorage[logIndex] = updatedLog
          
          console.log(`✏️ 개발 모드: 활동 수정됨 - ${updatedLog.details}`)
          return updatedLog
        }

        checkDatabaseConnection(supabaseUrl)

        const { id, ...updateData } = input

        const { data: log, error } = await ctx.supabase
          .from("logs")
          .update(updateData)
          .eq("id", id)
          .eq("user_id", ctx.user.id)
          .select()
          .single()

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `활동 수정 오류: ${error.message}`,
          })
        }

        return log
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "활동 수정 중 오류가 발생했습니다.",
        })
      }
    }),

  updateDate: protectedProcedure
    .input(updateDateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
        
        // 개발 모드에서는 메모리 저장소에서 날짜 업데이트
        if (supabaseUrl.includes('demo') || supabaseUrl.includes('placeholder')) {
          const logIndex = devModeStorage.findIndex(log => log.id === input.id && log.status === 'active')
          
          if (logIndex === -1) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "날짜를 변경할 활동을 찾을 수 없습니다.",
            })
          }
          
          // 날짜 업데이트
          devModeStorage[logIndex].log_date = input.log_date
          devModeStorage[logIndex].updated_at = new Date().toISOString()
          
          console.log(`🗓️ 개발 모드: 활동 날짜 변경됨 - ID: ${input.id}, 새 날짜: ${input.log_date}`)
          return { success: true }
        }

        checkDatabaseConnection(supabaseUrl)

        const { id, log_date } = input

        const { error } = await ctx.supabase
          .from("logs")
          .update({ log_date })
          .eq("id", id)
          .eq("user_id", ctx.user.id)

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `활동 날짜 변경 오류: ${error.message}`,
          })
        }

        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "활동 날짜 변경 중 오류가 발생했습니다.",
        })
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
        
        // 개발 모드에서는 메모리 저장소에서 삭제 처리 (soft delete)
        if (supabaseUrl.includes('demo') || supabaseUrl.includes('placeholder')) {
          const logIndex = devModeStorage.findIndex(log => log.id === input.id && log.status === 'active')
          
          if (logIndex === -1) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "삭제할 활동을 찾을 수 없습니다.",
            })
          }
          
          // Soft delete 처리
          devModeStorage[logIndex].status = 'deleted'
          devModeStorage[logIndex].updated_at = new Date().toISOString()
          
          console.log(`🗑️ 개발 모드: 활동 삭제됨 - ${devModeStorage[logIndex].details}`)
          return { success: true }
        }

        checkDatabaseConnection(supabaseUrl)

        const { error } = await ctx.supabase
          .from("logs")
          .update({ status: "deleted" })
          .eq("id", input.id)
          .eq("user_id", ctx.user.id)

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `활동 삭제 오류: ${error.message}`,
          })
        }

        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "활동 삭제 중 오류가 발생했습니다.",
        })
      }
    }),

  getStats: protectedProcedure
    .input(z.object({
      dateFrom: z.string().date().optional(),
      dateTo: z.string().date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
        
        // 개발 모드에서는 메모리 저장소에서 통계 계산
        if (supabaseUrl.includes('demo') || supabaseUrl.includes('placeholder')) {
          // 활성 상태인 로그만 필터링
          let filteredLogs = devModeStorage.filter(log => log.status === 'active')
          
          // 날짜 필터 적용
          if (input.dateFrom) {
            filteredLogs = filteredLogs.filter(log => log.log_date >= input.dateFrom!)
          }
          
          if (input.dateTo) {
            filteredLogs = filteredLogs.filter(log => log.log_date <= input.dateTo!)
          }
          
          // 카테고리별 통계 계산
          const categoryStats = filteredLogs.reduce((acc, log) => {
            acc[log.category] = (acc[log.category] || 0) + 1
            return acc
          }, {} as Record<string, number>)
          
          console.log(`📈 개발 모드: 통계 계산 완료 - 총 ${filteredLogs.length}개 활동`)
          
          return {
            totalLogs: filteredLogs.length,
            categoryStats,
            logs: filteredLogs,
          }
        }

        checkDatabaseConnection(supabaseUrl)

        let query = ctx.supabase
          .from("logs")
          .select("category, log_date")
          .eq("user_id", ctx.user.id)
          .eq("status", "active")

        if (input.dateFrom) {
          query = query.gte("log_date", input.dateFrom)
        }
        if (input.dateTo) {
          query = query.lte("log_date", input.dateTo)
        }

        const { data: logs, error } = await query

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `통계 조회 오류: ${error.message}`,
          })
        }

        // 카테고리별 통계 계산
        const categoryStats = logs?.reduce((acc, log) => {
          acc[log.category] = (acc[log.category] || 0) + 1
          return acc
        }, {} as Record<string, number>) || {}

        return {
          totalLogs: logs?.length || 0,
          categoryStats,
          logs: logs || [],
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "통계 데이터를 불러오는 중 오류가 발생했습니다.",
        })
      }
    }),
}) 