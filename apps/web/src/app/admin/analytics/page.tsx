"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/trpc/provider"
import { 
  ArrowLeft, 
  Users, 
  Activity, 
  FileText, 
  TrendingUp, 
  BarChart3, 
  PieChart,
  Calendar,
  Shield
} from "lucide-react"
import Link from "next/link"


export default function AnalyticsPage() {
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // 권한 확인 - 관리자만 접근 가능
  useEffect(() => {
    if (!user || !isAdmin) {
      router.push("/dashboard")
      return
    }
  }, [user, isAdmin, router])

  // 시스템 통계 조회
  const { 
    data: statsData, 
    isLoading: isLoadingStats 
  } = api.admin.getSystemStats.useQuery(
    undefined,
    { 
      enabled: !!user && isAdmin,
      retry: false,
      refetchOnWindowFocus: false
    }
  )

  // 관리자가 아닌 경우 로딩 상태 표시
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 animate-spin" />
          <span className="korean-text">권한을 확인하는 중...</span>
        </div>
      </div>
    )
  }

  if (isLoadingStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 animate-spin" />
          <span className="korean-text">통계 데이터를 불러오는 중...</span>
        </div>
      </div>
    )
  }

  const stats = statsData || {
    totalUsers: 0,
    activeUsers: 0,
    totalLogs: 0,
    reportsGenerated: 0,
    dailyActiveUsers: [],
    categoryStats: [],
    monthlyGrowth: { userGrowth: 0, activityGrowth: 0, reportGrowth: 0 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto pt-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="korean-text">대시보드로 돌아가기</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white korean-text">
                전체 통계
              </h1>
              <p className="text-gray-600 dark:text-gray-300 korean-text">
                시스템의 전반적인 사용 현황과 성과를 확인하세요
              </p>
            </div>
          </div>
        </div>

        {/* 주요 지표 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 korean-text">전체 사용자</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-blue-600 korean-text mt-1">
                    월 성장률: +{stats.monthlyGrowth.userGrowth}%
                  </p>
                </div>
                <div className="p-3 bg-blue-200 rounded-full">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 korean-text">활성 사용자</p>
                  <p className="text-3xl font-bold text-green-900">{stats.activeUsers.toLocaleString()}</p>
                  <p className="text-xs text-green-600 korean-text mt-1">
                    활성화율: {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                  </p>
                </div>
                <div className="p-3 bg-green-200 rounded-full">
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 korean-text">전체 활동</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.totalLogs.toLocaleString()}</p>
                  <p className="text-xs text-purple-600 korean-text mt-1">
                    월 증가율: +{stats.monthlyGrowth.activityGrowth}%
                  </p>
                </div>
                <div className="p-3 bg-purple-200 rounded-full">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 korean-text">생성된 보고서</p>
                  <p className="text-3xl font-bold text-orange-900">{stats.reportsGenerated.toLocaleString()}</p>
                  <p className="text-xs text-orange-600 korean-text mt-1">
                    월 증가율: +{stats.monthlyGrowth.reportGrowth}%
                  </p>
                </div>
                <div className="p-3 bg-orange-200 rounded-full">
                  <FileText className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 일별 활성 사용자 추이 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 korean-text">
                <Calendar className="h-5 w-5" />
                <span>일별 활성 사용자</span>
              </CardTitle>
              <CardDescription className="korean-text">
                최근 7일간 일일 활성 사용자 수 추이
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.dailyActiveUsers.map((day, index) => (
                  <div key={day.date} className="flex items-center space-x-4">
                    <div className="w-16 text-sm text-gray-600 korean-text">
                      {new Date(day.date).toLocaleDateString('ko-KR', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="flex-1">
                      <Progress 
                        value={(day.count / Math.max(...stats.dailyActiveUsers.map(d => d.count))) * 100} 
                        className="h-3"
                      />
                    </div>
                    <div className="w-12 text-sm font-medium text-right">
                      {day.count}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 카테고리별 활동 분포 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 korean-text">
                <PieChart className="h-5 w-5" />
                <span>카테고리별 활동 분포</span>
              </CardTitle>
              <CardDescription className="korean-text">
                활동 유형별 비율 및 건수
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.categoryStats.map((category, index) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium korean-text">{category.category}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{category.count}건</span>
                        <span className="text-sm font-medium">{category.percentage}%</span>
                      </div>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 성장 지표 */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 korean-text">
              <TrendingUp className="h-5 w-5" />
              <span>월별 성장 지표</span>
            </CardTitle>
            <CardDescription className="korean-text">
              전월 대비 주요 지표 성장률
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <div className="text-2xl font-bold text-blue-900 mb-2">
                  +{stats.monthlyGrowth.userGrowth}%
                </div>
                <div className="text-sm text-blue-600 korean-text">사용자 증가율</div>
                <div className="mt-2">
                  <Progress value={Math.min(stats.monthlyGrowth.userGrowth, 100)} className="h-2" />
                </div>
              </div>

              <div className="text-center p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-900 mb-2">
                  +{stats.monthlyGrowth.activityGrowth}%
                </div>
                <div className="text-sm text-green-600 korean-text">활동 증가율</div>
                <div className="mt-2">
                  <Progress value={Math.min(stats.monthlyGrowth.activityGrowth, 100)} className="h-2" />
                </div>
              </div>

              <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                <div className="text-2xl font-bold text-purple-900 mb-2">
                  +{stats.monthlyGrowth.reportGrowth}%
                </div>
                <div className="text-sm text-purple-600 korean-text">보고서 증가율</div>
                <div className="mt-2">
                  <Progress value={Math.min(stats.monthlyGrowth.reportGrowth, 100)} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 시스템 관리 기능 */}
        <Card className="border-0 shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="korean-text">🛠️ 고급 시스템 관리</CardTitle>
            <CardDescription className="korean-text">
              시스템 모니터링, 백업, 보안 관리 기능에 빠르게 접근하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 시스템 로그 */}
              <Link href="/admin/system-logs">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-200 rounded-full">
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg korean-text text-blue-900">시스템 로그</h3>
                        <p className="text-sm text-blue-600 korean-text">실시간 시스템 모니터링</p>
                        <p className="text-xs text-blue-500 korean-text mt-1">
                          오류 추적 • 성능 모니터링 • 로그 분석
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* 백업 및 복원 */}
              <Link href="/admin/backup">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-green-200 rounded-full">
                        <Shield className="h-8 w-8 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg korean-text text-green-900">백업 및 복원</h3>
                        <p className="text-sm text-green-600 korean-text">데이터 보호 및 관리</p>
                        <p className="text-xs text-green-500 korean-text mt-1">
                          자동 백업 • 데이터 복원 • 안전한 저장
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* 사용자 활동 모니터링 */}
              <Link href="/admin/user-monitoring">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-purple-200 rounded-full">
                        <Activity className="h-8 w-8 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg korean-text text-purple-900">사용자 모니터링</h3>
                        <p className="text-sm text-purple-600 korean-text">활동 추적 및 보안 관리</p>
                        <p className="text-xs text-purple-500 korean-text mt-1">
                          로그인 기록 • 이상 감지 • 위험 분석
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* 관리 기능 요약 */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 korean-text mb-2">🔐 보안 상태 요약</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="korean-text">시스템 정상 운영 중</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="korean-text">최근 백업: 2시간 전</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="korean-text">활성 사용자: {stats.activeUsers}명</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* 인사이트 및 요약 */}
        <Card className="border-0 shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="korean-text">📊 주요 인사이트</CardTitle>
            <CardDescription className="korean-text">
              현재 시스템 상태에 대한 요약 및 권장사항
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg korean-text">🎯 성과 하이라이트</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="korean-text">
                    • 전체 {stats.totalUsers}명의 사용자가 {stats.totalLogs}개의 활동을 기록했습니다
                  </li>
                  <li className="korean-text">
                    • 활성 사용자 비율이 {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%로 
                    {(stats.totalUsers > 0 && stats.activeUsers / stats.totalUsers > 0.7) ? ' 매우 우수합니다' : ' 개선이 필요합니다'}
                  </li>
                  <li className="korean-text">
                    • 시스템이 안정적으로 운영되고 있습니다
                  </li>
                  <li className="korean-text">
                    • 세부 통계 대시보드를 통해 운영 효율성을 개선할 수 있습니다
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg korean-text">💡 개선 권장사항</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="korean-text">
                    • 세부 통계 대시보드에서 근무 패턴을 분석하여 업무 효율성을 높이세요
                  </li>
                  <li className="korean-text">
                    • 사용자 참여도 향상을 위한 리마인더 시스템 도입을 고려해보세요
                  </li>
                  <li className="korean-text">
                    • 근무 빈도가 높은 직원들의 피로도 관리에 주의하세요
                  </li>
                  <li className="korean-text">
                    • 모바일 앱 사용성 개선으로 더 많은 활동 기록을 유도할 수 있습니다
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 