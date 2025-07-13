"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { Calendar, BarChart3, Shield, Settings, Users, FileText, Crown, LogOut, User, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export function Header() {
  const { user, signOut, isAdmin, loading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      // 로그아웃 성공 알림
      toast({
        title: "👋 로그아웃이 완료되었습니다",
        description: "안전하게 로그아웃되었습니다. 메인 화면으로 이동합니다.",
        variant: "success",
        duration: 3000,
      })
      
      setTimeout(() => {
        router.push("/")
      }, 2500)
    } catch (error) {
      // 로그아웃 실패 알림
      toast({
        title: "⚠️ 로그아웃 중 오류가 발생했습니다",
        description: "다시 시도해주세요. 문제가 지속되면 브라우저를 새로고침해주세요.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  // 로딩이 완료되었고 사용자가 없을 때만 헤더를 숨김
  if (!loading && !user) {
    return null
  }

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50 dark:border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <span className="text-lg font-bold text-white">🏥</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white korean-text">
                CareerLog
              </h1>
            </Link>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* 로딩 중일 때는 스켈레톤 UI 표시 */}
            {loading ? (
              <div className="flex items-center space-x-3">
                <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            ) : (
              <>
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
                        <Link href="/admin/analytics" className="w-full cursor-pointer">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          <span className="korean-text">전체 통계</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/detailed-analytics" className="w-full cursor-pointer">
                          <FileText className="h-4 w-4 mr-2" />
                          <span className="korean-text">세부 통계 대시보드</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/system-settings" className="w-full cursor-pointer">
                          <Settings className="h-4 w-4 mr-2" />
                          <span className="korean-text">시스템 설정</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin/create-admin" className="w-full cursor-pointer">
                          <Crown className="h-4 w-4 mr-2" />
                          <span className="korean-text">관리자 생성</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <ThemeToggle />

                {/* 사용자 메뉴 */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span className="korean-text max-w-20 truncate">
                        {user?.user_metadata?.full_name || "사용자"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="korean-text">
                      {user?.user_metadata?.full_name || user?.email || "사용자"}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      <span className="korean-text">로그아웃</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 