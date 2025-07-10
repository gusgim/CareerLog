"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { httpBatchLink } from "@trpc/client"
import { createTRPCReact } from "@trpc/react-query"
import { useState } from "react"
import SuperJSON from "superjson"

import { type AppRouter } from "@/server/api/root"

export const api = createTRPCReact<AppRouter>()

export function TrpcProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    api.createClient({
      transformer: SuperJSON,
      links: [
        httpBatchLink({
          url: `/api/trpc`,
          // You can pass any HTTP headers you wish here
          async headers() {
            const headers: Record<string, string> = {}
            
            console.log('🔍 tRPC 헤더 생성 시작')
            
            // 개발 모드: 로컬 스토리지에서 개발 모드 세션 확인
            if (typeof window !== 'undefined') {
              const devSession = localStorage.getItem('dev-user-session')
              console.log('🔍 localStorage에서 dev-user-session:', devSession ? '있음' : '없음')
              
              if (devSession) {
                try {
                  console.log('🔓 Base64 인코딩 시도...')
                  console.log('원본 세션 데이터:', devSession)
                  
                  // Base64 인코딩으로 한국어 문자 문제 해결
                  const encodedSession = btoa(encodeURIComponent(devSession))
                  headers['x-dev-session'] = encodedSession
                  
                  console.log('✅ 인코딩 성공, 헤더 설정됨')
                  console.log('인코딩된 헤더 값:', encodedSession)
                } catch (error) {
                  console.error('❌ 개발 모드 세션 인코딩 오류:', error)
                }
              } else {
                console.log('❌ localStorage에 dev-user-session이 없습니다.')
              }
            }
            
            console.log('📋 최종 헤더:', headers)
            return headers
          },
        }),
      ],
    })
  )

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </api.Provider>
  )
} 