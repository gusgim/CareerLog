"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Users, BarChart3, User, Calendar, Award, Building, Clock } from "lucide-react"
import Link from "next/link"
import { UserAnalytics } from "@/components/user-analytics"
import { SurgeryRoomAnalytics } from "@/components/surgery-room-analytics"
import { QualificationManagement } from "@/components/qualification-management"
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
      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 페이지 제목 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  ← 대시보드
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white korean-text">
                    세부 통계 대시보드
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300 korean-text">
                    관리자 전용 상세 분석 도구
                  </p>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
              관리자 모드
            </Badge>
          </div>

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
                  <SurgeryRoomAnalytics />
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


        </div>
      </main>
    </div>
  )
} 