"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  BarChart3,
  Users,
  Calendar,
  Award,
  Clock,
  Database,
  TrendingUp,
  Eye
} from "lucide-react"
import { validateDemoData, type DemoTestSuite } from "@/lib/utils/test-demo-data"

/**
 * 데모 데이터 검증 컴포넌트
 * 관리자가 브라우저에서 더미 데이터 상태를 확인할 수 있습니다.
 */
export function DemoDataValidator() {
  const [testResults, setTestResults] = useState<DemoTestSuite | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runValidation = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const results = await validateDemoData()
      setTestResults(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
      console.error('데모 데이터 검증 오류:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-600" />
    }
  }

  const getStatusColor = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'fail':
        return 'bg-red-100 text-red-800 border-red-200'
    }
  }

  const getOverallGrade = () => {
    if (!testResults) return null
    
    const percentage = (testResults.totalScore / testResults.maxScore) * 100
    
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100' }
    if (percentage >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' }
    if (percentage >= 70) return { grade: 'B+', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (percentage >= 60) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (percentage >= 50) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const overallGrade = getOverallGrade()

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white korean-text">
            🔍 데모 데이터 검증 도구
          </h2>
          <p className="text-gray-600 dark:text-gray-300 korean-text">
            생성된 더미 데이터가 모든 차트와 그래프에서 의미있게 표시되는지 자동 검증합니다.
          </p>
        </div>
        <Button onClick={runValidation} disabled={isLoading} className="korean-text">
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              검증 중...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              검증 실행
            </>
          )}
        </Button>
      </div>

      {/* 오류 표시 */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 korean-text">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 전체 결과 요약 */}
      {testResults && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between korean-text">
              <span>📊 전체 검증 결과</span>
              {overallGrade && (
                <Badge className={`${overallGrade.bg} ${overallGrade.color} text-lg px-4 py-2`}>
                  {overallGrade.grade}등급
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 점수 표시 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <div className="text-3xl font-bold text-blue-900 mb-2">
                  {testResults.totalScore}/{testResults.maxScore}
                </div>
                <div className="text-sm text-blue-600 korean-text">총점</div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <div className="text-3xl font-bold text-green-900 mb-2">
                  {((testResults.totalScore / testResults.maxScore) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-green-600 korean-text">성취도</div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                <div className="text-3xl font-bold text-purple-900 mb-2">
                  {testResults.results.filter(r => r.status === 'pass').length}/{testResults.results.length}
                </div>
                <div className="text-sm text-purple-600 korean-text">통과한 테스트</div>
              </div>
            </div>

            {/* 전체 진행률 */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="korean-text">전체 진행률</span>
                <span>{((testResults.totalScore / testResults.maxScore) * 100).toFixed(1)}%</span>
              </div>
              <Progress 
                value={(testResults.totalScore / testResults.maxScore) * 100} 
                className="h-3"
              />
            </div>

            {/* 데모 준비 상태 */}
            <div className={`p-4 rounded-lg border ${
              testResults.ready 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center space-x-3">
                {testResults.ready ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                )}
                <div>
                  <div className={`font-semibold korean-text ${
                    testResults.ready ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {testResults.ready ? '🎉 데모 준비 완료!' : '⚠️ 데모 준비 미완료'}
                  </div>
                  <div className={`text-sm korean-text ${
                    testResults.ready ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {testResults.ready 
                      ? '모든 차트와 그래프가 의미있는 데이터로 표시됩니다.'
                      : '일부 차트의 데이터가 부족할 수 있습니다.'
                    }
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 상세 테스트 결과 */}
      {testResults && (
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="results" className="korean-text">테스트 결과</TabsTrigger>
            <TabsTrigger value="recommendations" className="korean-text">권장사항</TabsTrigger>
          </TabsList>
          
          <TabsContent value="results" className="space-y-4">
            {testResults.results.map((result, index) => (
              <Card key={index} className={`border-l-4 ${
                result.status === 'pass' ? 'border-l-green-500' :
                result.status === 'warning' ? 'border-l-yellow-500' :
                'border-l-red-500'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-3 text-lg">
                      {getStatusIcon(result.status)}
                      <span className="korean-text">{result.testName}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(result.status)}>
                        {result.score}/{result.maxScore}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 korean-text mb-3">
                    {result.message}
                  </p>
                  <Progress 
                    value={(result.score / result.maxScore) * 100} 
                    className="h-2"
                  />
                  {result.data && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                      <strong className="korean-text">상세 데이터:</strong>
                      <pre className="mt-1 overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="korean-text">🚀 데모 시연 추천 순서</CardTitle>
                <CardDescription className="korean-text">
                  최상의 데모 효과를 위한 시연 순서입니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-blue-100 text-blue-800">1</Badge>
                    <div>
                      <div className="font-medium korean-text">관리자 로그인</div>
                      <div className="text-sm text-gray-600 korean-text">
                        admin@careerlog.demo 계정으로 로그인하여 관리자 권한 확인
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-blue-100 text-blue-800">2</Badge>
                    <div>
                      <div className="font-medium korean-text">전체 통계 대시보드</div>
                      <div className="text-sm text-gray-600 korean-text">
                        시스템 전반의 사용 현황과 성과 지표 확인
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-blue-100 text-blue-800">3</Badge>
                    <div>
                      <div className="font-medium korean-text">세부 통계 → 수술방 분석</div>
                      <div className="text-sm text-gray-600 korean-text">
                        수술방별 사용 현황과 효율성 분석 차트 시연
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-blue-100 text-blue-800">4</Badge>
                    <div>
                      <div className="font-medium korean-text">개별 사용자 분석</div>
                      <div className="text-sm text-gray-600 korean-text">
                        특정 사용자(김민지 등)의 6/12/18/24개월 근무 패턴 분석
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-blue-100 text-blue-800">5</Badge>
                    <div>
                      <div className="font-medium korean-text">자동 스케줄링 기능</div>
                      <div className="text-sm text-gray-600 korean-text">
                        AI 기반 듀티 스케줄링 시스템 시연
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-blue-100 text-blue-800">6</Badge>
                    <div>
                      <div className="font-medium korean-text">일반 사용자 경험</div>
                      <div className="text-sm text-gray-600 korean-text">
                        user1@careerlog.demo로 개인 대시보드 및 활동 기록 기능 시연
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 개선 권장사항 */}
            {testResults && testResults.results.some(r => r.status !== 'pass') && (
              <Card>
                <CardHeader>
                  <CardTitle className="korean-text">💡 개선 권장사항</CardTitle>
                  <CardDescription className="korean-text">
                    더 나은 데모를 위한 권장사항입니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {testResults.results
                      .filter(r => r.status !== 'pass')
                      .map((result, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                          <div>
                            <div className="font-medium korean-text">{result.testName}</div>
                            <div className="text-sm text-gray-600 korean-text">{result.message}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 브라우저 콘솔 테스트 */}
            <Card>
              <CardHeader>
                <CardTitle className="korean-text">🔧 개발자 도구</CardTitle>
                <CardDescription className="korean-text">
                  브라우저 콘솔에서 직접 테스트를 실행할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded font-mono text-sm">
                    <div className="korean-text mb-2">브라우저 콘솔에서 실행:</div>
                    <code>window.testDemoData()</code>
                  </div>
                  <div className="text-sm text-gray-600 korean-text">
                    F12를 눌러 개발자 도구를 열고 Console 탭에서 위 명령어를 실행하면 
                    더 자세한 테스트 결과를 확인할 수 있습니다.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* 첫 실행 가이드 */}
      {!testResults && !isLoading && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="text-center py-12">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white korean-text mb-2">
              데모 데이터 검증을 시작하세요
            </h3>
            <p className="text-gray-600 dark:text-gray-300 korean-text mb-6">
              '검증 실행' 버튼을 클릭하여 더미 데이터 상태를 확인하고<br />
              모든 차트와 그래프가 올바르게 표시되는지 검증합니다.
            </p>
            <Button onClick={runValidation} size="lg" className="korean-text">
              <Database className="mr-2 h-5 w-5" />
              검증 시작하기
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 