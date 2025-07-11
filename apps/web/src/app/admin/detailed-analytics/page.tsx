"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, BarChart3, User, Calendar, Award, Building, Clock, Settings } from "lucide-react"
import Link from "next/link"
import { QualificationManagement } from "@/components/qualification-management"
import { UserAnalytics } from "@/components/user-analytics"
import { AutoScheduling } from "@/components/auto-scheduling"

export default function DetailedAnalyticsPage() {
  const { isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState("qualifications")

  // 개발 모드에서는 권한 체크 우회
  const hasAccess = process.env.NODE_ENV === 'development' || isAdmin

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">⛔ 접근 권한 없음</CardTitle>
            <CardDescription>
              관리자만 접근할 수 있는 페이지입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/dashboard">
              <Button>대시보드로 돌아가기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* 헤더 */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  대시보드
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white korean-text">
                    세부 통계 대시보드
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300 korean-text">
                    관리자 전용 상세 분석 도구
                  </p>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
              <Settings className="h-3 w-3 mr-1" />
              관리자 모드
            </Badge>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 소개 섹션 */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white korean-text">
              고급 분석 및 관리 도구 📊
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 korean-text max-w-3xl mx-auto">
              근무자 자격 관리부터 자동 스케줄링까지, 병원 운영에 필요한 모든 분석 도구를 제공합니다.
            </p>
          </div>

          {/* 기능별 탭 */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
              <TabsTrigger 
                value="qualifications" 
                className="flex flex-col items-center space-y-2 p-4 korean-text"
              >
                <Award className="h-5 w-5" />
                <span className="text-sm">근무자 자격 관리</span>
              </TabsTrigger>
              <TabsTrigger 
                value="surgery-room" 
                className="flex flex-col items-center space-y-2 p-4 korean-text"
              >
                <Building className="h-5 w-5" />
                <span className="text-sm">수술방 분석</span>
              </TabsTrigger>
              <TabsTrigger 
                value="user-analysis" 
                className="flex flex-col items-center space-y-2 p-4 korean-text"
              >
                <User className="h-5 w-5" />
                <span className="text-sm">개별 사용자 분석</span>
              </TabsTrigger>
              <TabsTrigger 
                value="scheduling" 
                className="flex flex-col items-center space-y-2 p-4 korean-text"
              >
                <Clock className="h-5 w-5" />
                <span className="text-sm">자동 스케줄링</span>
              </TabsTrigger>
            </TabsList>

            {/* 근무자 자격 관리 탭 */}
            <TabsContent value="qualifications" className="space-y-6">
              <Card className="glass-effect border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 korean-text">
                    <Award className="h-6 w-6 text-blue-600" />
                    <span>근무자 자격 및 교육 이수 현황 관리</span>
                  </CardTitle>
                  <CardDescription className="korean-text">
                    모든 근무자의 자격증, 교육 이수 현황을 관리하고 수술방별 배치 가능 여부를 확인할 수 있습니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <QualificationManagement />
                </CardContent>
              </Card>
            </TabsContent>

            {/* 수술방 분석 탭 */}
            <TabsContent value="surgery-room" className="space-y-6">
              <Card className="glass-effect border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 korean-text">
                    <Building className="h-6 w-6 text-green-600" />
                    <span>수술방별 근무 현황 분석</span>
                  </CardTitle>
                  <CardDescription className="korean-text">
                    각 수술방의 근무 빈도, 담당자 분석 및 효율성을 평가할 수 있습니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-300 korean-text mb-2">
                        📊 현재 구현된 기능
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-400 korean-text">
                        기존 수술방 분석 기능이 이미 구현되어 있습니다. "전체 통계" 메뉴에서 확인할 수 있습니다.
                      </p>
                      <Link href="/admin/analytics" className="inline-block mt-2">
                        <Button size="sm" variant="outline" className="korean-text">
                          수술방 분석 보러가기
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 개별 사용자 분석 탭 */}
            <TabsContent value="user-analysis" className="space-y-6">
              <Card className="glass-effect border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 korean-text">
                    <User className="h-6 w-6 text-purple-600" />
                    <span>개별 근무자 상세 분석</span>
                  </CardTitle>
                  <CardDescription className="korean-text">
                    특정 근무자의 6/12/18/24개월 근무 패턴을 분석하고 성과를 평가합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserAnalytics />
                </CardContent>
              </Card>
            </TabsContent>

            {/* 자동 스케줄링 탭 */}
            <TabsContent value="scheduling" className="space-y-6">
              <Card className="glass-effect border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 korean-text">
                    <Clock className="h-6 w-6 text-red-600" />
                    <span>AI 기반 자동 듀티 스케줄링</span>
                  </CardTitle>
                  <CardDescription className="korean-text">
                    모든 근무자가 균형있게 다양한 듀티를 배정받을 수 있도록 AI가 최적의 스케줄을 생성합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AutoScheduling />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* 개발 로드맵 */}
          <Card className="glass-effect border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="korean-text">🚀 개발 로드맵</CardTitle>
              <CardDescription className="korean-text">
                세부 통계 대시보드 기능들의 순차적 개발 계획
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Badge className="bg-blue-600">1단계</Badge>
                  <span className="korean-text font-medium">근무자 자격 및 교육 마킹 시스템</span>
                  <Badge variant="outline" className="text-orange-600 border-orange-600">진행 예정</Badge>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">2단계</Badge>
                  <span className="korean-text">개별 사용자 분석 기능</span>
                  <Badge variant="outline">대기 중</Badge>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">3단계</Badge>
                  <span className="korean-text">AI 기반 자동 스케줄링 시스템</span>
                  <Badge variant="outline">대기 중</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 