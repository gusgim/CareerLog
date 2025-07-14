"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { BarChart3, Users, Calendar, TrendingUp, Award, Loader2, AlertCircle } from "lucide-react"
import { api } from "@/lib/trpc/provider"

interface SurgeryRoomAnalyticsProps {
  className?: string
}

interface WorkerData {
  rank: number
  userId: string
  fullName: string
  department: string
  workCount: number
  percentage: number
  lastWorkDate: string
}

interface AnalyticsData {
  operatingRoom: string
  period: {
    from: string
    to: string
  }
  topWorkers: WorkerData[]
  totalWorkCount: number
  uniqueWorkers: number
}

export function SurgeryRoomAnalytics({ className }: SurgeryRoomAnalyticsProps) {
  const [selectedRoom, setSelectedRoom] = useState<string>("")
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)

  // 수술방 목록 조회
  const { data: operatingRooms, isLoading: roomsLoading } = api.admin.getAllOperatingRooms.useQuery()

  // 수술방별 근무 빈도 분석
  const { 
    data: frequencyData, 
    isLoading: analyticsLoading, 
    error: analyticsError,
    refetch: refetchAnalytics 
  } = api.admin.getSurgeryRoomWorkFrequency.useQuery(
    { roomId: selectedRoom ? parseInt(selectedRoom) : undefined },
    { 
      enabled: !!selectedRoom,
      onSuccess: (data) => {
        setAnalyticsData(data)
      }
    }
  )

  const handleRoomSelect = (room: string) => {
    setSelectedRoom(room)
    setAnalyticsData(null)
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case 2: return "bg-gray-100 text-gray-800 border-gray-300"
      case 3: return "bg-orange-100 text-orange-800 border-orange-300"
      default: return "bg-blue-100 text-blue-800 border-blue-300"
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return "🥇"
      case 2: return "🥈"
      case 3: return "🥉"
      default: return "🏅"
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
          <BarChart3 className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold korean-text">수술방 근무 빈도 분석</h2>
          <p className="text-gray-600 korean-text">
            최근 12개월간 수술방별 근무자 Top 5 조회
          </p>
        </div>
      </div>

      {/* 수술방 선택 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 korean-text">
            <Users className="h-5 w-5" />
            <span>수술방 선택</span>
          </CardTitle>
          <CardDescription className="korean-text">
            분석할 수술방을 선택해주세요. 최근 12개월간의 데이터를 기준으로 분석합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Select value={selectedRoom} onValueChange={handleRoomSelect}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="수술방을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomsLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2 korean-text">로딩 중...</span>
                      </div>
                    ) : operatingRooms && operatingRooms.length > 0 ? (
                      operatingRooms.map((room) => (
                        <SelectItem key={room.room} value={room.room}>
                          <div className="flex items-center justify-between w-full">
                            <span className="korean-text">{room.room}</span>
                            <Badge variant="secondary" className="ml-2">
                              {room.count}건
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="flex items-center justify-center py-4 text-gray-500 korean-text">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        수술방 데이터가 없습니다
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {selectedRoom && (
                <Button 
                  onClick={() => refetchAnalytics()}
                  disabled={analyticsLoading}
                  variant="outline"
                  className="korean-text"
                >
                  {analyticsLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      분석 중...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      분석 새로고침
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 분석 결과 */}
      {selectedRoom && (
        <>
          {analyticsLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-lg korean-text">분석 데이터를 가져오는 중...</span>
              </CardContent>
            </Card>
          ) : analyticsError ? (
            <Card className="border-red-200">
              <CardContent className="flex items-center justify-center py-8">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-lg font-semibold text-red-800 korean-text">분석 오류</p>
                  <p className="text-red-600 korean-text">
                    {analyticsError.message || "데이터를 불러올 수 없습니다."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : frequencyData && analyticsData ? (
            <div className="space-y-6">
              {/* 분석 요약 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 korean-text">
                    <Calendar className="h-5 w-5" />
                    <span>분석 요약</span>
                  </CardTitle>
                  <CardDescription className="korean-text">
                    {analyticsData.period.from} ~ {analyticsData.period.to}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {analyticsData.totalWorkCount}
                      </div>
                      <div className="text-sm text-gray-600 korean-text">총 근무 건수</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {analyticsData.uniqueWorkers}
                      </div>
                      <div className="text-sm text-gray-600 korean-text">총 근무자 수</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {analyticsData.topWorkers.length}
                      </div>
                      <div className="text-sm text-gray-600 korean-text">Top 순위</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top 5 근무자 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 korean-text">
                    <Award className="h-5 w-5" />
                    <span>{analyticsData.operatingRoom} Top 5 근무자</span>
                  </CardTitle>
                  <CardDescription className="korean-text">
                    최근 12개월간 가장 많이 근무한 상위 5명입니다
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsData.topWorkers.length > 0 ? (
                    <div className="space-y-4">
                      {analyticsData.topWorkers.map((worker, index) => (
                        <div key={worker.userId}>
                          <div className="flex items-center justify-between p-4 rounded-lg border bg-gray-50/50">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-gray-200">
                                <span className="text-xl">{getRankIcon(worker.rank)}</span>
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-semibold korean-text">{worker.fullName}</h3>
                                  <Badge className={getRankColor(worker.rank)}>
                                    {worker.rank}위
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 korean-text">
                                  {worker.department} • 마지막 근무: {worker.lastWorkDate}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-600">
                                {worker.workCount}건
                              </div>
                              <div className="text-sm text-gray-600">
                                {worker.percentage}%
                              </div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <Progress 
                              value={worker.percentage} 
                              className="h-2"
                            />
                          </div>
                          {index < analyticsData.topWorkers.length - 1 && (
                            <Separator className="mt-4" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 korean-text">
                        선택한 수술방에 대한 근무 데이터가 없습니다.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 추가 인사이트 */}
              {analyticsData.topWorkers.length > 0 && (
                <Card className="bg-blue-50/50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-800 korean-text">📊 분석 인사이트</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start space-x-2">
                        <span className="text-blue-600">•</span>
                        <span className="korean-text">
                          <strong>{analyticsData.topWorkers[0].fullName}</strong>님이 
                          총 <strong>{analyticsData.topWorkers[0].workCount}건</strong>으로 
                          가장 많은 근무를 했습니다 ({analyticsData.topWorkers[0].percentage}%)
                        </span>
                      </div>
                      {analyticsData.topWorkers.length >= 2 && (
                        <div className="flex items-start space-x-2">
                          <span className="text-blue-600">•</span>
                          <span className="korean-text">
                            상위 2명의 근무 비율 차이는{" "}
                            <strong>
                              {(analyticsData.topWorkers[0].percentage - analyticsData.topWorkers[1].percentage).toFixed(1)}%
                            </strong>입니다
                          </span>
                        </div>
                      )}
                      <div className="flex items-start space-x-2">
                        <span className="text-blue-600">•</span>
                        <span className="korean-text">
                          해당 수술방에서 총 <strong>{analyticsData.uniqueWorkers}명</strong>이 근무했으며,
                          평균 근무 횟수는{" "}
                          <strong>
                            {(analyticsData.totalWorkCount / analyticsData.uniqueWorkers).toFixed(1)}건
                          </strong>입니다
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : null}
        </>
      )}
    </div>
  )
} 