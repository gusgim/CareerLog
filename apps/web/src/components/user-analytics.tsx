"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { User, Calendar, TrendingUp, BarChart3, Clock, Target, Award, AlertTriangle } from "lucide-react"
import { api } from "@/lib/trpc/provider"

export function UserAnalytics() {
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [selectedPeriod, setSelectedPeriod] = useState<'6' | '12' | '18' | '24'>('12')

  // API 쿼리
  const { data: users } = api.admin.getUsersForAnalysis.useQuery(
    undefined,
    { retry: false }
  )

  const { data: analytics, isLoading } = api.admin.getUserAnalytics.useQuery(
    { userId: selectedUserId, period: `${selectedPeriod}months` as "6months" | "12months" | "18months" | "24months" },
    { 
      enabled: !!selectedUserId,
      retry: false 
    }
  )

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strength':
        return <Award className="h-5 w-5 text-green-600" />
      case 'opportunity':
        return <Target className="h-5 w-5 text-blue-600" />
      case 'workload':
        return <BarChart3 className="h-5 w-5 text-purple-600" />
      default:
        return <AlertTriangle className="h-5 w-5 text-orange-600" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'strength':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700'
      case 'opportunity':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700'
      case 'workload':
        return 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700'
      default:
        return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* 사용자 및 기간 선택 */}
      <Card>
        <CardHeader>
          <CardTitle className="korean-text">분석 대상 선택</CardTitle>
          <CardDescription className="korean-text">
            분석할 근무자와 분석 기간을 선택하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium korean-text mb-2 block">근무자 선택</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="분석할 근무자를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span className="korean-text">
                          {user.full_name} ({user.department || '부서미정'}, {user.role || '직책미정'})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium korean-text mb-2 block">분석 기간</label>
              <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">최근 6개월</SelectItem>
                  <SelectItem value="12">최근 12개월</SelectItem>
                  <SelectItem value="18">최근 18개월</SelectItem>
                  <SelectItem value="24">최근 24개월</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 분석 결과 */}
      {selectedUserId && analytics && (
        <div className="space-y-6">
          {/* 사용자 정보 요약 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 korean-text">
                <User className="h-6 w-6 text-blue-600" />
                <span>{analytics.userInfo.fullName} 근무 분석</span>
              </CardTitle>
              <CardDescription className="korean-text">
                {analytics.period.startDate} ~ {analytics.period.endDate} ({analytics.period.months}개월)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{analytics.performance.totalShifts}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 korean-text">총 근무 횟수</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{analytics.performance.totalHours}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 korean-text">총 근무 시간</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{analytics.performance.avgShiftsPerMonth}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 korean-text">월평균 근무 횟수</div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{analytics.performance.attendanceRate}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 korean-text">출근율</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 듀티별 근무 현황 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 korean-text">
                  <Clock className="h-5 w-5 text-green-600" />
                  <span>듀티별 근무 현황</span>
                </CardTitle>
                <CardDescription className="korean-text">
                  가장 많이 담당한 듀티 순서대로 정렬
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.dutyStats.map((duty, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium korean-text">{duty.dutyType}</span>
                        <div className="text-right">
                          <span className="text-sm font-bold">{duty.count}회</span>
                          <span className="text-xs text-gray-500 ml-2">({duty.percentage}%)</span>
                        </div>
                      </div>
                      <Progress value={duty.percentage} className="h-2" />
                      <div className="text-xs text-gray-600 dark:text-gray-400 korean-text">
                        평균 {duty.avgHoursPerShift}시간/회
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 수술방별 배정 현황 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 korean-text">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span>수술방별 배정 현황</span>
                </CardTitle>
                <CardDescription className="korean-text">
                  가장 많이 배정된 수술방 순서대로 정렬
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.operatingRoomStats.map((room, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium korean-text">{room.room}</span>
                        <div className="text-right">
                          <span className="text-sm font-bold">{room.count}회</span>
                          <span className="text-xs text-gray-500 ml-2">({room.percentage}%)</span>
                        </div>
                      </div>
                      <Progress value={room.percentage} className="h-2" />
                      <div className="text-xs text-gray-600 dark:text-gray-400 korean-text">
                        최근 근무: {room.lastWorkDate}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 월별 근무 트렌드 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 korean-text">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span>월별 근무 트렌드</span>
              </CardTitle>
              <CardDescription className="korean-text">
                최근 {analytics.period.months}개월간 월별 근무 패턴
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="korean-text">월</TableHead>
                      <TableHead className="text-center korean-text">근무 횟수</TableHead>
                      <TableHead className="text-center korean-text">총 근무 시간</TableHead>
                      <TableHead className="text-center korean-text">평균 시간/회</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.monthlyTrends.map((trend, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{trend.month}</TableCell>
                        <TableCell className="text-center">{trend.totalShifts}회</TableCell>
                        <TableCell className="text-center">{trend.totalHours}시간</TableCell>
                        <TableCell className="text-center">
                          {trend.totalShifts > 0 ? (trend.totalHours / trend.totalShifts).toFixed(1) : 0}시간
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* AI 인사이트 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 korean-text">
                <Target className="h-5 w-5 text-orange-600" />
                <span>AI 분석 인사이트</span>
              </CardTitle>
              <CardDescription className="korean-text">
                근무 패턴을 바탕으로 한 맞춤형 분석 결과
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {analytics.insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
                  >
                    <div className="flex items-start space-x-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <h4 className="font-semibold korean-text mb-1">{insight.title}</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 korean-text">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 사용자 미선택 상태 */}
      {!selectedUserId && (
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 korean-text mb-2">
              근무자를 선택하세요
            </h3>
            <p className="text-sm text-gray-500 korean-text">
              위에서 분석할 근무자를 선택하면 상세한 근무 분석 결과를 확인할 수 있습니다.
            </p>
          </CardContent>
        </Card>
      )}

      {/* 로딩 상태 */}
      {selectedUserId && isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 korean-text mb-2">
              분석 중...
            </h3>
            <p className="text-sm text-gray-500 korean-text">
              근무 데이터를 분석하고 있습니다. 잠시만 기다려주세요.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 