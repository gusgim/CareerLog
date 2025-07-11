"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Calendar, 
  Clock, 
  Settings, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  BarChart3,
  RefreshCw,
  PlayCircle,
  StopCircle,
  TrendingUp
} from "lucide-react"
import { api } from "@/lib/trpc/provider"
import { useToast } from "@/hooks/use-toast"

export function AutoScheduling() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'generate' | 'optimize' | 'emergency'>('generate')
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false)
  const [generatedSchedule, setGeneratedSchedule] = useState<any>(null)
  const [optimizationResult, setOptimizationResult] = useState<any>(null)

  // 스케줄 생성 폼 상태
  const [scheduleForm, setScheduleForm] = useState({
    startDate: '',
    endDate: '',
    maxConsecutiveDays: 3,
    minRestHours: 12,
    maxWeeklyHours: 40,
    preferredDistribution: true,
  })

  // 응급 상황 폼 상태
  const [emergencyForm, setEmergencyForm] = useState({
    date: '',
    operatingRoom: '',
    urgencyLevel: 'medium' as 'low' | 'medium' | 'high' | 'critical',
  })

  // Mutations
  const generateSchedule = api.admin.generateAutoSchedule.useMutation({
    onSuccess: (data) => {
      toast({
        title: "✅ 성공!",
        description: data.message,
        variant: "success",
      })
      setGeneratedSchedule(data.schedule)
      setShowGenerateDialog(false)
    },
    onError: (error) => {
      toast({
        title: "❌ 오류!",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const optimizeSchedule = api.admin.optimizeSchedule.useMutation({
    onSuccess: (data) => {
      toast({
        title: "✅ 최적화 완료!",
        description: data.message,
        variant: "success",
      })
      setOptimizationResult(data.optimization)
    },
    onError: (error) => {
      toast({
        title: "❌ 오류!",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleEmergency = api.admin.handleEmergencyScheduling.useMutation({
    onSuccess: (data) => {
      toast({
        title: "🚨 응급 대응 완료!",
        description: data.message,
        variant: "success",
      })
      setShowEmergencyDialog(false)
    },
    onError: (error) => {
      toast({
        title: "❌ 오류!",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleGenerateSchedule = () => {
    if (!scheduleForm.startDate || !scheduleForm.endDate) {
      toast({
        title: "❌ 입력 오류!",
        description: "시작 날짜와 종료 날짜를 모두 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    generateSchedule.mutate({
      startDate: scheduleForm.startDate,
      endDate: scheduleForm.endDate,
      constraints: {
        maxConsecutiveDays: scheduleForm.maxConsecutiveDays,
        minRestHours: scheduleForm.minRestHours,
        maxWeeklyHours: scheduleForm.maxWeeklyHours,
        preferredDistribution: scheduleForm.preferredDistribution,
      },
    })
  }

  const handleOptimizeSchedule = () => {
    if (!generatedSchedule) {
      toast({
        title: "❌ 오류!",
        description: "먼저 스케줄을 생성해주세요.",
        variant: "destructive",
      })
      return
    }

    optimizeSchedule.mutate({
      scheduleId: generatedSchedule.scheduleId,
      optimizationGoals: ['workload', 'qualification', 'experience'],
    })
  }

  const handleEmergencyScheduling = () => {
    if (!emergencyForm.date || !emergencyForm.operatingRoom) {
      toast({
        title: "❌ 입력 오류!",
        description: "날짜와 수술방을 모두 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    handleEmergency.mutate({
      date: emergencyForm.date,
      operatingRoom: emergencyForm.operatingRoom,
      urgencyLevel: emergencyForm.urgencyLevel,
    })
  }

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'medium': return <BarChart3 className="h-4 w-4 text-blue-600" />
      case 'low': return <CheckCircle2 className="h-4 w-4 text-gray-600" />
      default: return <AlertTriangle className="h-4 w-4 text-orange-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* 상단 탭 네비게이션 */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <Button
          variant={activeTab === 'generate' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('generate')}
          className="flex-1 korean-text"
        >
          <Calendar className="h-4 w-4 mr-2" />
          스케줄 생성
        </Button>
        <Button
          variant={activeTab === 'optimize' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('optimize')}
          className="flex-1 korean-text"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          스케줄 최적화
        </Button>
        <Button
          variant={activeTab === 'emergency' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('emergency')}
          className="flex-1 korean-text"
        >
          <Zap className="h-4 w-4 mr-2" />
          응급 대응
        </Button>
      </div>

      {/* 스케줄 생성 탭 */}
      {activeTab === 'generate' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="korean-text">주간 스케줄 자동 생성</CardTitle>
                  <CardDescription className="korean-text">
                    AI 알고리즘을 사용하여 최적화된 주간 근무 스케줄을 생성합니다.
                  </CardDescription>
                </div>
                <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
                  <DialogTrigger asChild>
                    <Button className="korean-text">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      새 스케줄 생성
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="korean-text">스케줄 생성 설정</DialogTitle>
                      <DialogDescription className="korean-text">
                        스케줄 생성에 필요한 매개변수를 설정하세요.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="startDate" className="korean-text">시작 날짜</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={scheduleForm.startDate}
                            onChange={(e) => setScheduleForm(prev => ({ ...prev, startDate: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="endDate" className="korean-text">종료 날짜</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={scheduleForm.endDate}
                            onChange={(e) => setScheduleForm(prev => ({ ...prev, endDate: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="maxConsecutive" className="korean-text">최대 연속 근무일</Label>
                          <Input
                            id="maxConsecutive"
                            type="number"
                            min="1"
                            max="7"
                            value={scheduleForm.maxConsecutiveDays}
                            onChange={(e) => setScheduleForm(prev => ({ ...prev, maxConsecutiveDays: parseInt(e.target.value) || 3 }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="minRest" className="korean-text">최소 휴식 시간</Label>
                          <Input
                            id="minRest"
                            type="number"
                            min="8"
                            max="24"
                            value={scheduleForm.minRestHours}
                            onChange={(e) => setScheduleForm(prev => ({ ...prev, minRestHours: parseInt(e.target.value) || 12 }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="maxWeekly" className="korean-text">주간 최대 시간</Label>
                          <Input
                            id="maxWeekly"
                            type="number"
                            min="20"
                            max="60"
                            value={scheduleForm.maxWeeklyHours}
                            onChange={(e) => setScheduleForm(prev => ({ ...prev, maxWeeklyHours: parseInt(e.target.value) || 40 }))}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="distribution"
                          checked={scheduleForm.preferredDistribution}
                          onCheckedChange={(checked) => setScheduleForm(prev => ({ ...prev, preferredDistribution: checked }))}
                        />
                        <Label htmlFor="distribution" className="korean-text">균등 분배 우선</Label>
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowGenerateDialog(false)}
                          className="korean-text"
                        >
                          취소
                        </Button>
                        <Button
                          onClick={handleGenerateSchedule}
                          disabled={generateSchedule.isPending}
                          className="korean-text"
                        >
                          {generateSchedule.isPending ? '생성 중...' : '스케줄 생성'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {generatedSchedule ? (
                <div className="space-y-6">
                  {/* 스케줄 정보 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{generatedSchedule.analysis.totalScheduledShifts}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 korean-text">총 스케줄</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{generatedSchedule.analysis.distributionScore}%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 korean-text">분배 점수</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{generatedSchedule.analysis.qualificationMatchScore}%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 korean-text">자격 매치</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{generatedSchedule.analysis.workloadBalanceScore}%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 korean-text">업무 균형</div>
                    </div>
                  </div>

                  {/* AI 제안 사항 */}
                  <div>
                    <h4 className="font-semibold korean-text mb-3">AI 분석 및 제안</h4>
                    <div className="space-y-2">
                      {generatedSchedule.analysis.suggestions.map((suggestion: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm korean-text">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 샘플 스케줄 테이블 */}
                  <div>
                    <h4 className="font-semibold korean-text mb-3">생성된 스케줄 (첫째 날 예시)</h4>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="korean-text">근무자</TableHead>
                            <TableHead className="korean-text">수술방</TableHead>
                            <TableHead className="korean-text">듀티</TableHead>
                            <TableHead className="korean-text">근무 시간</TableHead>
                            <TableHead className="korean-text">자격 매치</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {generatedSchedule.schedules[0]?.shifts.map((shift: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium korean-text">{shift.userName}</TableCell>
                              <TableCell>{shift.operatingRoom}</TableCell>
                              <TableCell className="korean-text">{shift.dutyType}</TableCell>
                              <TableCell>{shift.startTime} - {shift.endTime}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Progress value={shift.qualificationMatch} className="h-2 w-16" />
                                  <span className="text-sm">{shift.qualificationMatch}%</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 korean-text mb-2">
                    아직 생성된 스케줄이 없습니다
                  </h3>
                  <p className="text-sm text-gray-500 korean-text">
                    위의 "새 스케줄 생성" 버튼을 클릭하여 자동 스케줄을 생성해보세요.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 스케줄 최적화 탭 */}
      {activeTab === 'optimize' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="korean-text">스케줄 최적화</CardTitle>
                <CardDescription className="korean-text">
                  기존 스케줄을 분석하여 더 나은 배치를 제안합니다.
                </CardDescription>
              </div>
              <Button onClick={handleOptimizeSchedule} disabled={!generatedSchedule || optimizeSchedule.isPending} className="korean-text">
                <RefreshCw className="h-4 w-4 mr-2" />
                {optimizeSchedule.isPending ? '최적화 중...' : '스케줄 최적화'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {optimizationResult ? (
              <div className="space-y-6">
                {/* 최적화 결과 요약 */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{optimizationResult.stats.beforeScore}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 korean-text">최적화 전</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{optimizationResult.stats.afterScore}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 korean-text">최적화 후</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">+{optimizationResult.stats.improvementPercentage}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 korean-text">개선 정도</div>
                  </div>
                </div>

                {/* 개선 항목 */}
                <div>
                  <h4 className="font-semibold korean-text mb-3">개선 항목</h4>
                  <div className="space-y-3">
                    {optimizationResult.improvements.map((improvement: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                        {getImpactIcon(improvement.impact)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium korean-text">{improvement.type}</span>
                            <Badge variant="outline" className={`text-xs ${
                              improvement.impact === 'high' ? 'border-green-600 text-green-600' :
                              improvement.impact === 'medium' ? 'border-blue-600 text-blue-600' :
                              'border-gray-600 text-gray-600'
                            }`}>
                              {improvement.impact === 'high' ? '높음' : improvement.impact === 'medium' ? '보통' : '낮음'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 korean-text">
                            {improvement.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 korean-text mb-2">
                  최적화 결과가 없습니다
                </h3>
                <p className="text-sm text-gray-500 korean-text">
                  먼저 스케줄을 생성한 후 최적화를 실행해보세요.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 응급 상황 대응 탭 */}
      {activeTab === 'emergency' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="korean-text">응급 상황 대응</CardTitle>
                <CardDescription className="korean-text">
                  갑작스러운 결원이나 응급 상황 시 대체 인력을 자동으로 배정합니다.
                </CardDescription>
              </div>
              <Dialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="korean-text">
                    <Zap className="h-4 w-4 mr-2" />
                    응급 상황 신고
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="korean-text">응급 상황 처리</DialogTitle>
                    <DialogDescription className="korean-text">
                      응급 상황 정보를 입력하여 대체 인력을 찾아보세요.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="emergencyDate" className="korean-text">날짜</Label>
                      <Input
                        id="emergencyDate"
                        type="date"
                        value={emergencyForm.date}
                        onChange={(e) => setEmergencyForm(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyRoom" className="korean-text">수술방</Label>
                      <Select
                        value={emergencyForm.operatingRoom}
                        onValueChange={(value) => setEmergencyForm(prev => ({ ...prev, operatingRoom: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="수술방을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OR1">수술실 1호 (심장외과)</SelectItem>
                          <SelectItem value="OR2">수술실 2호 (신경외과)</SelectItem>
                          <SelectItem value="OR3">수술실 3호 (일반외과)</SelectItem>
                          <SelectItem value="RR1">회복실 A</SelectItem>
                          <SelectItem value="RR2">회복실 B</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="urgencyLevel" className="korean-text">긴급도</Label>
                      <Select
                        value={emergencyForm.urgencyLevel}
                        onValueChange={(value: any) => setEmergencyForm(prev => ({ ...prev, urgencyLevel: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">낮음</SelectItem>
                          <SelectItem value="medium">보통</SelectItem>
                          <SelectItem value="high">높음</SelectItem>
                          <SelectItem value="critical">긴급</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowEmergencyDialog(false)}
                        className="korean-text"
                      >
                        취소
                      </Button>
                      <Button
                        onClick={handleEmergencyScheduling}
                        disabled={handleEmergency.isPending}
                        variant="destructive"
                        className="korean-text"
                      >
                        {handleEmergency.isPending ? '처리 중...' : '응급 처리'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                <h4 className="font-semibold text-red-800 dark:text-red-300 korean-text mb-2 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  응급 상황 대응 프로세스
                </h4>
                <ol className="text-sm text-red-700 dark:text-red-400 korean-text space-y-1 ml-6">
                  <li>1. 결원 발생 즉시 시스템에 신고</li>
                  <li>2. AI가 가용 인력과 자격 요건 자동 매칭</li>
                  <li>3. 최적의 대체 인력 추천 및 즉시 연락</li>
                  <li>4. 자동 스케줄 업데이트 및 관련자 알림</li>
                </ol>
              </div>

              <div className="text-center py-8">
                <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 korean-text mb-2">
                  대기 중...
                </h3>
                <p className="text-sm text-gray-500 korean-text">
                  응급 상황 발생 시 위의 "응급 상황 신고" 버튼을 클릭하세요.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 