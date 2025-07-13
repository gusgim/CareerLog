/**
 * CareerLog 데모 데이터 자동 테스트 유틸리티
 * 
 * 이 파일은 생성된 더미 데이터가 모든 차트와 그래프에서
 * 의미있는 데이터로 표시되는지 자동으로 검증합니다.
 */

import { createClient } from '@/lib/supabase/client'

type SupabaseClient = ReturnType<typeof createClient>

interface TestResult {
  testName: string
  status: 'pass' | 'fail' | 'warning'
  score: number
  maxScore: number
  message: string
  data?: any
}

export interface DemoTestSuite {
  totalScore: number
  maxScore: number
  results: TestResult[]
  overall: 'excellent' | 'good' | 'fair' | 'poor'
  ready: boolean
}

/**
 * 데모 데이터 종합 검증 실행
 */
export async function validateDemoData(): Promise<DemoTestSuite> {
  const supabase = createClient()
  const results: TestResult[] = []
  
  console.log('🔍 CareerLog 데모 데이터 검증 시작...')
  
  try {
    // 1. 기본 데이터 검증
    results.push(await testBasicData(supabase))
    
    // 2. 대시보드 통계 검증
    results.push(await testDashboardStats(supabase))
    
    // 3. 관리자 통계 검증
    results.push(await testAdminStats(supabase))
    
    // 4. 수술방 분석 검증
    results.push(await testSurgeryRoomAnalytics(supabase))
    
    // 5. 자격 관리 검증
    results.push(await testQualificationManagement(supabase))
    
    // 6. 스케줄링 검증
    results.push(await testSchedulingSystem(supabase))
    
    // 7. 차트 데이터 충분성 검증
    results.push(await testChartDataSufficiency(supabase))
    
    // 8. 데이터 품질 검증
    results.push(await testDataQuality(supabase))
    
  } catch (error) {
    console.error('❌ 데이터 검증 중 오류:', error)
    results.push({
      testName: 'Database Connection',
      status: 'fail',
      score: 0,
      maxScore: 10,
      message: `데이터베이스 연결 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    })
  }
  
  // 결과 계산
  const totalScore = results.reduce((sum, result) => sum + result.score, 0)
  const maxScore = results.reduce((sum, result) => sum + result.maxScore, 0)
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0
  
  let overall: DemoTestSuite['overall']
  let ready = false
  
  if (percentage >= 90) {
    overall = 'excellent'
    ready = true
  } else if (percentage >= 75) {
    overall = 'good'
    ready = true
  } else if (percentage >= 60) {
    overall = 'fair'
    ready = false
  } else {
    overall = 'poor'
    ready = false
  }
  
  const suite: DemoTestSuite = {
    totalScore,
    maxScore,
    results,
    overall,
    ready
  }
  
  // 결과 출력
  console.log('\n📊 데모 데이터 검증 결과:')
  console.log(`🏆 총점: ${totalScore}/${maxScore} (${percentage.toFixed(1)}%)`)
  console.log(`🎯 상태: ${overall.toUpperCase()}`)
  console.log(`✅ 데모 준비: ${ready ? '완료' : '미완료'}`)
  
  results.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌'
    console.log(`${icon} ${result.testName}: ${result.score}/${result.maxScore} - ${result.message}`)
  })
  
  return suite
}

/**
 * 기본 데이터 검증
 */
async function testBasicData(supabase: SupabaseClient): Promise<TestResult> {
  try {
    const [usersResult, logsResult, schedulesResult, roomsResult] = await Promise.all([
      supabase.from('profiles').select('id, is_admin').limit(1000),
      supabase.from('logs').select('id').limit(1),
      supabase.from('duty_schedules').select('id').limit(1),
      supabase.from('operating_rooms').select('id').limit(1)
    ])
    
    const userCount = usersResult.count || 0
    const hasLogs = (logsResult.data?.length || 0) > 0
    const hasSchedules = (schedulesResult.data?.length || 0) > 0
    const hasRooms = (roomsResult.data?.length || 0) > 0
    
    let score = 0
    let issues: string[] = []
    
    if (userCount >= 78) score += 5
    else issues.push(`사용자 수 부족 (${userCount}/78)`)
    
    if (hasLogs) score += 3
    else issues.push('활동 로그 없음')
    
    if (hasSchedules) score += 3
    else issues.push('근무 스케줄 없음')
    
    if (hasRooms) score += 2
    else issues.push('수술방 데이터 없음')
    
    const adminCount = usersResult.data?.filter(u => u.is_admin).length || 0
    if (adminCount >= 1) score += 2
    else issues.push('관리자 계정 없음')
    
    return {
      testName: '기본 데이터',
      status: score >= 12 ? 'pass' : score >= 8 ? 'warning' : 'fail',
      score,
      maxScore: 15,
      message: issues.length === 0 ? '모든 기본 데이터 준비 완료' : `이슈: ${issues.join(', ')}`,
      data: { userCount, hasLogs, hasSchedules, hasRooms, adminCount }
    }
  } catch (error) {
    return {
      testName: '기본 데이터',
      status: 'fail',
      score: 0,
      maxScore: 15,
      message: `검증 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    }
  }
}

/**
 * 대시보드 통계 검증
 */
async function testDashboardStats(supabase: SupabaseClient): Promise<TestResult> {
  try {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const [recentLogs, categoriesResult] = await Promise.all([
      supabase
        .from('logs')
        .select('id, category, log_date')
        .gte('log_date', weekAgo.toISOString().split('T')[0])
        .limit(1000),
      supabase
        .from('logs')
        .select('category')
        .limit(10000)
    ])
    
    const recentCount = recentLogs.data?.length || 0
    const categories = Array.from(new Set(categoriesResult.data?.map(l => l.category) || []))
    
    let score = 0
    let issues: string[] = []
    
    if (recentCount >= 100) score += 5
    else if (recentCount >= 50) score += 3
    else issues.push(`최근 활동 부족 (${recentCount}건)`)
    
    if (categories.length >= 4) score += 5
    else if (categories.length >= 3) score += 3
    else issues.push(`카테고리 부족 (${categories.length}개)`)
    
    return {
      testName: '대시보드 통계',
      status: score >= 8 ? 'pass' : score >= 5 ? 'warning' : 'fail',
      score,
      maxScore: 10,
      message: issues.length === 0 ? '대시보드 통계 데이터 충분' : `이슈: ${issues.join(', ')}`,
      data: { recentCount, categories: categories.length }
    }
  } catch (error) {
    return {
      testName: '대시보드 통계',
      status: 'fail',
      score: 0,
      maxScore: 10,
      message: `검증 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    }
  }
}

/**
 * 관리자 통계 검증
 */
async function testAdminStats(supabase: SupabaseClient): Promise<TestResult> {
  try {
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    
    const [usersResult, activeUsersResult] = await Promise.all([
      supabase.from('profiles').select('id').eq('is_admin', false),
      supabase
        .from('logs')
        .select('user_id')
        .gte('log_date', monthAgo.toISOString().split('T')[0])
    ])
    
    const totalUsers = usersResult.data?.length || 0
    const activeUserIds = new Set(activeUsersResult.data?.map(l => l.user_id) || [])
    const activeUsers = activeUserIds.size
    const activityRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
    
    let score = 0
    let issues: string[] = []
    
    if (totalUsers >= 70) score += 5
    else issues.push(`총 사용자 부족 (${totalUsers}명)`)
    
    if (activityRate >= 80) score += 5
    else if (activityRate >= 60) score += 3
    else issues.push(`활성화율 낮음 (${activityRate.toFixed(1)}%)`)
    
    return {
      testName: '관리자 통계',
      status: score >= 8 ? 'pass' : score >= 5 ? 'warning' : 'fail',
      score,
      maxScore: 10,
      message: issues.length === 0 ? '관리자 통계 데이터 충분' : `이슈: ${issues.join(', ')}`,
      data: { totalUsers, activeUsers, activityRate }
    }
  } catch (error) {
    return {
      testName: '관리자 통계',
      status: 'fail',
      score: 0,
      maxScore: 10,
      message: `검증 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    }
  }
}

/**
 * 수술방 분석 검증
 */
async function testSurgeryRoomAnalytics(supabase: SupabaseClient): Promise<TestResult> {
  try {
    const [roomsResult, schedulesResult] = await Promise.all([
      supabase.from('operating_rooms').select('id, room_name'),
      supabase.from('duty_schedules').select('operating_room_id, user_id')
    ])
    
    const rooms = roomsResult.data || []
    const schedules = schedulesResult.data || []
    
    const roomUsage = rooms.map(room => {
      const roomSchedules = schedules.filter(s => s.operating_room_id === room.id)
      return {
        roomId: room.id,
        scheduleCount: roomSchedules.length,
        uniqueUsers: new Set(roomSchedules.map(s => s.user_id)).size
      }
    })
    
    let score = 0
    let issues: string[] = []
    
    if (rooms.length >= 10) score += 3
    else issues.push(`수술방 수 부족 (${rooms.length}개)`)
    
    const wellUsedRooms = roomUsage.filter(r => r.scheduleCount >= 100).length
    if (wellUsedRooms >= 8) score += 4
    else if (wellUsedRooms >= 5) score += 2
    else issues.push(`충분히 사용된 수술방 부족 (${wellUsedRooms}개)`)
    
    const avgUsersPerRoom = roomUsage.reduce((sum, r) => sum + r.uniqueUsers, 0) / rooms.length
    if (avgUsersPerRoom >= 10) score += 3
    else if (avgUsersPerRoom >= 5) score += 2
    else issues.push(`수술방당 사용자 수 부족 (평균 ${avgUsersPerRoom.toFixed(1)}명)`)
    
    return {
      testName: '수술방 분석',
      status: score >= 8 ? 'pass' : score >= 5 ? 'warning' : 'fail',
      score,
      maxScore: 10,
      message: issues.length === 0 ? '수술방 분석 데이터 충분' : `이슈: ${issues.join(', ')}`,
      data: { roomCount: rooms.length, wellUsedRooms, avgUsersPerRoom }
    }
  } catch (error) {
    return {
      testName: '수술방 분석',
      status: 'fail',
      score: 0,
      maxScore: 10,
      message: `검증 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    }
  }
}

/**
 * 자격 관리 검증
 */
async function testQualificationManagement(supabase: SupabaseClient): Promise<TestResult> {
  try {
    const [qualificationsResult, staffQualsResult, profilesResult] = await Promise.all([
      supabase.from('qualifications').select('id, name_ko, is_mandatory'),
      supabase.from('staff_qualifications').select('user_id, qualification_id, status'),
      supabase.from('profiles').select('id').eq('is_admin', false)
    ])
    
    const qualifications = qualificationsResult.data || []
    const staffQuals = staffQualsResult.data || []
    const users = profilesResult.data || []
    
    const activeStaffQuals = staffQuals.filter(sq => sq.status === 'active')
    const avgQualsPerUser = activeStaffQuals.length / Math.max(users.length, 1)
    
    let score = 0
    let issues: string[] = []
    
    if (qualifications.length >= 10) score += 3
    else issues.push(`자격 유형 부족 (${qualifications.length}개)`)
    
    if (activeStaffQuals.length >= 300) score += 4
    else if (activeStaffQuals.length >= 200) score += 2
    else issues.push(`자격증 데이터 부족 (${activeStaffQuals.length}건)`)
    
    if (avgQualsPerUser >= 3) score += 3
    else if (avgQualsPerUser >= 2) score += 2
    else issues.push(`사용자당 자격증 부족 (평균 ${avgQualsPerUser.toFixed(1)}개)`)
    
    return {
      testName: '자격 관리',
      status: score >= 8 ? 'pass' : score >= 5 ? 'warning' : 'fail',
      score,
      maxScore: 10,
      message: issues.length === 0 ? '자격 관리 데이터 충분' : `이슈: ${issues.join(', ')}`,
      data: { qualifications: qualifications.length, staffQualifications: activeStaffQuals.length, avgQualsPerUser }
    }
  } catch (error) {
    return {
      testName: '자격 관리',
      status: 'fail',
      score: 0,
      maxScore: 10,
      message: `검증 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    }
  }
}

/**
 * 스케줄링 시스템 검증
 */
async function testSchedulingSystem(supabase: SupabaseClient): Promise<TestResult> {
  try {
    const [dutyTypesResult, schedulesResult] = await Promise.all([
      supabase.from('duty_types').select('id, name_ko'),
      supabase.from('duty_schedules').select('duty_type_id, user_id, duty_date')
    ])
    
    const dutyTypes = dutyTypesResult.data || []
    const schedules = schedulesResult.data || []
    
    const dutyTypeUsage = dutyTypes.map(dt => ({
      id: dt.id,
      name: dt.name_ko,
      scheduleCount: schedules.filter(s => s.duty_type_id === dt.id).length
    }))
    
    const uniqueDates = new Set(schedules.map(s => s.duty_date)).size
    const uniqueUsers = new Set(schedules.map(s => s.user_id)).size
    
    let score = 0
    let issues: string[] = []
    
    if (schedules.length >= 30000) score += 5
    else if (schedules.length >= 20000) score += 3
    else if (schedules.length >= 10000) score += 2
    else issues.push(`스케줄 데이터 부족 (${schedules.length}건)`)
    
    if (dutyTypes.length >= 6) score += 2
    else issues.push(`듀티 타입 부족 (${dutyTypes.length}개)`)
    
    if (uniqueDates >= 600) score += 2
    else if (uniqueDates >= 400) score += 1
    else issues.push(`스케줄 날짜 범위 부족 (${uniqueDates}일)`)
    
    if (uniqueUsers >= 70) score += 1
    else issues.push(`스케줄된 사용자 부족 (${uniqueUsers}명)`)
    
    return {
      testName: '스케줄링 시스템',
      status: score >= 8 ? 'pass' : score >= 5 ? 'warning' : 'fail',
      score,
      maxScore: 10,
      message: issues.length === 0 ? '스케줄링 데이터 충분' : `이슈: ${issues.join(', ')}`,
      data: { totalSchedules: schedules.length, dutyTypes: dutyTypes.length, uniqueDates, uniqueUsers }
    }
  } catch (error) {
    return {
      testName: '스케줄링 시스템',
      status: 'fail',
      score: 0,
      maxScore: 10,
      message: `검증 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    }
  }
}

/**
 * 차트 데이터 충분성 검증
 */
async function testChartDataSufficiency(supabase: SupabaseClient): Promise<TestResult> {
  try {
    const [logsResult] = await Promise.all([
      supabase.from('logs').select('id, category, log_date, user_id').limit(50000)
    ])
    
    const logs = logsResult.data || []
    
    // 카테고리 분포 체크
    const categories = Array.from(new Set(logs.map(l => l.category)))
    const categoryDistribution = categories.map(cat => ({
      category: cat,
      count: logs.filter(l => l.category === cat).length
    }))
    
    // 월별 분포 체크
    const monthlyDistribution = logs.reduce((acc, log) => {
      const month = log.log_date.substring(0, 7) // YYYY-MM
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // 사용자별 분포 체크
    const userDistribution = logs.reduce((acc, log) => {
      acc[log.user_id] = (acc[log.user_id] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    let score = 0
    let issues: string[] = []
    
    // 카테고리 다양성 (각 카테고리 최소 500건)
    const wellPopulatedCategories = categoryDistribution.filter(c => c.count >= 500).length
    if (wellPopulatedCategories >= 3) score += 5
    else if (wellPopulatedCategories >= 2) score += 3
    else issues.push(`카테고리별 데이터 부족 (${wellPopulatedCategories}개 카테고리만 충분)`)
    
    // 월별 데이터 (최소 12개월)
    const monthsWithData = Object.keys(monthlyDistribution).length
    if (monthsWithData >= 12) score += 3
    else if (monthsWithData >= 6) score += 2
    else issues.push(`월별 데이터 부족 (${monthsWithData}개월)`)
    
    // 사용자별 데이터 (최소 50명이 10건 이상)
    const activeUsers = Object.values(userDistribution).filter(count => count >= 10).length
    if (activeUsers >= 50) score += 2
    else if (activeUsers >= 30) score += 1
    else issues.push(`활성 사용자 부족 (${activeUsers}명)`)
    
    return {
      testName: '차트 데이터 충분성',
      status: score >= 8 ? 'pass' : score >= 5 ? 'warning' : 'fail',
      score,
      maxScore: 10,
      message: issues.length === 0 ? '모든 차트에 충분한 데이터' : `이슈: ${issues.join(', ')}`,
      data: { 
        totalLogs: logs.length, 
        categories: categories.length, 
        wellPopulatedCategories, 
        monthsWithData, 
        activeUsers 
      }
    }
  } catch (error) {
    return {
      testName: '차트 데이터 충분성',
      status: 'fail',
      score: 0,
      maxScore: 10,
      message: `검증 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    }
  }
}

/**
 * 데이터 품질 검증
 */
async function testDataQuality(supabase: SupabaseClient): Promise<TestResult> {
  try {
    const [logsResult] = await Promise.all([
      supabase.from('logs').select('id, details, tags, duration_hours').limit(10000)
    ])
    
    const logs = logsResult.data || []
    
    let score = 15 // 시작점
    let issues: string[] = []
    
    // 빈 세부사항 체크
    const emptyDetails = logs.filter(l => !l.details || l.details.trim().length === 0).length
    if (emptyDetails > logs.length * 0.05) { // 5% 이상이면 문제
      score -= 3
      issues.push(`빈 세부사항 (${emptyDetails}건)`)
    }
    
    // 빈 태그 체크
    const emptyTags = logs.filter(l => !l.tags || l.tags.length === 0).length
    if (emptyTags > logs.length * 0.1) { // 10% 이상이면 문제
      score -= 2
      issues.push(`빈 태그 (${emptyTags}건)`)
    }
    
    // 비정상적인 근무 시간 체크
    const invalidDurations = logs.filter(l => 
      l.duration_hours !== null && (l.duration_hours < 0 || l.duration_hours > 24)
    ).length
    if (invalidDurations > 0) {
      score -= 5
      issues.push(`비정상적인 근무시간 (${invalidDurations}건)`)
    }
    
    // 너무 짧은 세부사항 체크
    const shortDetails = logs.filter(l => 
      l.details && l.details.trim().length < 10
    ).length
    if (shortDetails > logs.length * 0.1) {
      score -= 2
      issues.push(`너무 짧은 세부사항 (${shortDetails}건)`)
    }
    
    return {
      testName: '데이터 품질',
      status: score >= 12 ? 'pass' : score >= 8 ? 'warning' : 'fail',
      score: Math.max(0, score),
      maxScore: 15,
      message: issues.length === 0 ? '데이터 품질 우수' : `품질 이슈: ${issues.join(', ')}`,
      data: { totalLogs: logs.length, emptyDetails, emptyTags, invalidDurations, shortDetails }
    }
  } catch (error) {
    return {
      testName: '데이터 품질',
      status: 'fail',
      score: 0,
      maxScore: 15,
      message: `검증 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    }
  }
}

/**
 * 브라우저 콘솔에서 직접 실행할 수 있는 간단한 테스트 함수
 */
export async function quickTest(): Promise<void> {
  console.log('🚀 CareerLog 데모 데이터 빠른 테스트 시작...')
  
  try {
    const result = await validateDemoData()
    
    console.log('\n🎯 테스트 결과 요약:')
    console.log(`📊 점수: ${result.totalScore}/${result.maxScore} (${((result.totalScore / result.maxScore) * 100).toFixed(1)}%)`)
    console.log(`🏆 등급: ${result.overall.toUpperCase()}`)
    console.log(`✅ 데모 준비: ${result.ready ? '완료' : '미완료'}`)
    
    if (result.ready) {
      console.log('\n🎉 축하합니다! 모든 차트와 그래프가 의미있는 데이터로 표시될 준비가 되었습니다.')
      console.log('\n📋 추천 데모 시나리오:')
      console.log('1. admin@careerlog.demo로 관리자 로그인')
      console.log('2. 전체 통계 대시보드 확인')
      console.log('3. 세부 통계 → 수술방 분석')
      console.log('4. 개별 사용자 분석')
      console.log('5. user1@careerlog.demo로 일반 사용자 경험')
    } else {
      console.log('\n⚠️ 일부 기능의 데이터가 부족할 수 있습니다.')
      console.log('더미 데이터를 다시 생성하는 것을 고려해보세요.')
    }
    
  } catch (error) {
    console.error('❌ 테스트 실행 실패:', error)
  }
}

// 개발 환경에서 글로벌 접근 가능하도록 설정
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).quickTest = quickTest;
} 