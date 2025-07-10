"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { QuickLogForm } from "@/components/quick-log-form"
import { LogCard } from "@/components/log-card"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import { PlusCircle, LogOut, User, Calendar, BarChart3, FileText, Loader2, Shield, Settings, UserPlus, Crown, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/trpc/provider"
import { format } from "date-fns"
import Link from "next/link"

export default function DashboardPage() {
  const { user, signOut, isAdmin } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [showQuickLog, setShowQuickLog] = useState(false)
  const [editingLog, setEditingLog] = useState<any>(null)
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // 오늘 날짜 범위
  const today = format(new Date(), "yyyy-MM-dd")
  const weekStart = format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")

  // 대시보드 통계 쿼리
  const { data: todayStats, refetch: refetchTodayStats } = api.log.getStats.useQuery(
    { dateFrom: today, dateTo: today },
    { 
      enabled: !!user,
      retry: false,
      refetchOnWindowFocus: false
    }
  )

  const { data: weekStats, refetch: refetchWeekStats } = api.log.getStats.useQuery(
    { dateFrom: weekStart, dateTo: today },
    { 
      enabled: !!user,
      retry: false,
      refetchOnWindowFocus: false
    }
  )

  // 최근 활동 쿼리
  const { data: recentLogs, isLoading: isLoadingLogs, refetch: refetchLogs } = api.log.getAll.useQuery(
    { limit: 5, offset: 0 },
    { 
      enabled: !!user,
      retry: false,
      refetchOnWindowFocus: false
    }
  )

  const handleSignOut = async () => {
    await signOut()
    toast({
      title: "✅ 로그아웃 완료!",
      description: "안전하게 로그아웃되었습니다. 메인 화면으로 이동합니다.",
      variant: "success",
      duration: 2000,
    })
    
    // 토스트 메시지를 보여준 후 루트 페이지로 리다이렉트
    setTimeout(() => {
      router.push("/")
    }, 2000)
  }

  const handleLogSuccess = () => {
    // 편집 모드인지 확인해서 적절한 메시지 표시
    if (editingLog) {
      toast({
        title: "✅ 활동수정 완료!",
        description: "활동이 성공적으로 수정되어 대시보드가 업데이트되었습니다.",
        variant: "success",
        duration: 6000
      })
    } else {
      toast({
        title: "✅ 활동등록 완료!",
        description: "새로운 활동이 성공적으로 등록되어 대시보드가 업데이트되었습니다.",
        variant: "success",
        duration: 6000
      })
    }
  }

  const handleLogEdit = (log: any) => {
    setEditingLog(log)
    setShowQuickLog(true)
  }

  const handleLogDelete = (logId: string) => {
    setDeletingLogId(logId)
    setShowDeleteDialog(true)
  }

  // tRPC 삭제 mutation
  const deleteLogMutation = api.log.delete.useMutation({
    onSuccess: async () => {
      // 삭제 다이얼로그 닫기
      setShowDeleteDialog(false)
      setDeletingLogId(null)
      
      // 캐시 무효화
      await Promise.all([
        refetchLogs(),
        refetchTodayStats(),
        refetchWeekStats(),
      ])
      
      toast({
        title: "✅ 활동삭제 완료!",
        description: "활동이 성공적으로 삭제되었습니다.",
        variant: "success",
        duration: 4000
      })
    },
    onError: (error) => {
      toast({
        title: "❌ 삭제 실패!",
        description: error.message || "활동 삭제에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
        duration: 5000
      })
    },
  })

  const confirmDelete = () => {
    if (deletingLogId) {
      deleteLogMutation.mutate({ id: parseInt(deletingLogId) })
    }
  }

  const handleQuickLogClose = (open: boolean) => {
    setShowQuickLog(open)
    if (!open) {
      setEditingLog(null)
    }
  }

  // 통계 계산
  const todayCount = todayStats?.totalLogs || 0
  const weekCount = weekStats?.totalLogs || 0
  const reportCount = 0
  const performanceScore = weekCount > 0 ? Math.round((weekCount / 7) * 10) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* 헤더 */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <span className="text-lg font-bold text-white">🏥</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white korean-text">
                CareerLog
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/calendar">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  캘린더 보기
                </Button>
              </Link>
              
              {/* 관리자 메뉴 */}
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200 hover:from-red-100 hover:to-pink-100 text-red-700">
                      <Shield className="h-4 w-4 mr-2" />
                      관리자
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="korean-text">관리자 메뉴</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin/users" className="w-full cursor-pointer">
                        <Users className="h-4 w-4 mr-2" />
                        <span className="korean-text">사용자 관리</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/create-admin" className="w-full cursor-pointer">
                        <UserPlus className="h-4 w-4 mr-2" />
                        <span className="korean-text">관리자 계정 생성</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/system-settings" className="w-full cursor-pointer">
                        <Settings className="h-4 w-4 mr-2" />
                        <span className="korean-text">시스템 설정</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/analytics" className="w-full cursor-pointer">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        <span className="korean-text">전체 통계</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/setup-admin" className="w-full cursor-pointer">
                        <Crown className="h-4 w-4 mr-2 text-purple-600" />
                        <span className="korean-text text-purple-600">초기 관리자 설정</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              <ThemeToggle />
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <User className="h-4 w-4" />
                <span className="korean-text">
                  {user?.user_metadata?.full_name || user?.email}
                  {isAdmin && <span className="ml-1 text-red-500">👑</span>}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="korean-text"
              >
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 웰컴 섹션 */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white korean-text">
              안녕하세요, {user?.user_metadata?.full_name || "님"}! 👋
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 korean-text">
              오늘도 소중한 활동을 기록해보세요.
            </p>
          </div>

          {/* 빠른 작업 버튼 */}
          <div className="flex justify-center">
            <Button
              size="lg"
              className="h-14 px-8 text-lg font-semibold korean-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              onClick={() => setShowQuickLog(true)}
            >
              <PlusCircle className="mr-3 h-6 w-6" />
              빠른 로그 작성
            </Button>
          </div>

          {/* 대시보드 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 오늘의 활동 */}
            <Card className="glass-effect border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium korean-text">
                  오늘의 활동
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayCount}</div>
                <p className="text-xs text-muted-foreground korean-text">
                  기록된 활동 수
                </p>
              </CardContent>
            </Card>

            {/* 이번 주 활동 */}
            <Card className="glass-effect border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium korean-text">
                  이번 주 활동
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{weekCount}</div>
                <p className="text-xs text-muted-foreground korean-text">
                  총 활동 수
                </p>
              </CardContent>
            </Card>

            {/* 생성된 보고서 */}
            <Card className="glass-effect border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium korean-text">
                  생성된 보고서
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportCount}</div>
                <p className="text-xs text-muted-foreground korean-text">
                  PDF 보고서 수
                </p>
              </CardContent>
            </Card>

            {/* 성과 점수 */}
            <Card className="glass-effect border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium korean-text">
                  성과 점수
                </CardTitle>
                <div className="text-2xl">📈</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceScore}</div>
                <p className="text-xs text-muted-foreground korean-text">
                  주간 평균 활동 점수
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 최근 활동 */}
          <Card className="glass-effect border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="korean-text">최근 활동</CardTitle>
              <CardDescription className="korean-text">
                최근에 기록한 활동들을 확인해보세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLogs ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                  <p className="text-gray-600 dark:text-gray-300 korean-text mt-4">
                    활동을 불러오는 중...
                  </p>
                </div>
              ) : recentLogs && recentLogs.length > 0 ? (
                <div className="space-y-4">
                  {recentLogs.map((log) => (
                    <LogCard
                      key={log.id}
                      log={log}
                      onEdit={handleLogEdit}
                      onDelete={handleLogDelete}
                    />
                  ))}
                  <div className="text-center pt-4">
                    <Link href="/calendar">
                      <Button variant="outline" className="korean-text">
                        <Calendar className="mr-2 h-4 w-4" />
                        모든 활동 보기
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white korean-text mb-2">
                    아직 기록된 활동이 없습니다
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 korean-text mb-6">
                    첫 번째 활동을 기록해보세요!
                  </p>
                  <Button
                    onClick={() => setShowQuickLog(true)}
                    className="korean-text"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    활동 기록하기
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 빠른 로그 폼 */}
      <QuickLogForm 
        open={showQuickLog} 
        onOpenChange={handleQuickLogClose}
        onSuccess={handleLogSuccess}
        editLog={editingLog}
      />

      {/* 삭제 확인 다이얼로그 */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        isLoading={deleteLogMutation.isLoading}
      />
    </div>
  )
} 