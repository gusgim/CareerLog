"use client"

import { useState } from "react"
import { CalendarView } from "@/components/calendar-view"
import { LogCard } from "@/components/log-card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import { api } from "@/lib/trpc/provider"
import { Calendar, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function CalendarPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedLog, setSelectedLog] = useState<any>(null)
  const [isLogDetailOpen, setIsLogDetailOpen] = useState(false)

  // 실제 로그 데이터 쿼리
  const { data: logs, isLoading, error, refetch } = api.log.getAll.useQuery(
    { limit: 100, offset: 0 },
    { 
      enabled: !!user,
      retry: false,
      refetchOnWindowFocus: false
    }
  )

  const handleLogClick = (log: any) => {
    setSelectedLog(log)
    setIsLogDetailOpen(true)
  }

  const handleLogEdit = (log: any) => {
    toast({
      title: "편집 기능 준비 중",
      description: "곧 편집 기능이 추가될 예정입니다.",
    })
  }

  const handleLogDelete = (logId: string) => {
    toast({
      title: "삭제 기능 준비 중",
      description: "곧 삭제 기능이 추가될 예정입니다.",
    })
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white korean-text mb-2">
            데이터를 불러올 수 없습니다
          </h2>
          <p className="text-gray-600 dark:text-gray-300 korean-text mb-6">
            Supabase 연결을 확인해주세요.
          </p>
          <Button onClick={() => refetch()} className="korean-text">
            다시 시도
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                대시보드로 돌아가기
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold korean-text text-gray-900 dark:text-white">캘린더 보기</h1>
                <p className="text-gray-600 dark:text-gray-300 korean-text">활동 내역을 캘린더 형태로 확인해보세요</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>

        {/* 캘린더 뷰 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 h-[800px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-300 korean-text">
                  활동 데이터를 불러오는 중...
                </p>
              </div>
            </div>
          ) : (
            <CalendarView 
              logs={logs || []} 
              onLogClick={handleLogClick}
            />
          )}
        </div>

        {/* 로그 상세 보기 다이얼로그 */}
        <Dialog open={isLogDetailOpen} onOpenChange={setIsLogDetailOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="korean-text">활동 상세 정보</DialogTitle>
            </DialogHeader>
            {selectedLog && (
              <div className="mt-4">
                <LogCard
                  log={selectedLog}
                  onEdit={handleLogEdit}
                  onDelete={handleLogDelete}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 