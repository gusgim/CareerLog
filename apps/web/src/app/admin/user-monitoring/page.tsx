"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Users, 
  Activity,
  Search, 
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  MapPin,
  Smartphone,
  Monitor,
  Globe,
  TrendingUp,
  TrendingDown,
  BarChart3,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import Link from "next/link"

interface UserActivity {
  id: string
  user_id: string
  user_email: string
  user_name: string
  action: string
  timestamp: string
  ip_address: string
  user_agent: string
  device_type: 'desktop' | 'mobile' | 'tablet'
  location?: string
  session_duration?: number
  pages_visited?: number
  risk_level: 'low' | 'medium' | 'high'
  metadata?: Record<string, any>
}

interface UserStats {
  user_id: string
  user_email: string
  user_name: string
  last_login: string
  total_sessions: number
  total_logs_created: number
  avg_session_duration: number
  devices_used: string[]
  locations_accessed: string[]
  risk_score: number
}

// 모의 사용자 활동 데이터
const mockUserActivities: UserActivity[] = [
  {
    id: "1",
    user_id: "user_123",
    user_email: "doctor.kim@hospital.com",
    user_name: "김의사",
    action: "login",
    timestamp: new Date().toISOString(),
    ip_address: "192.168.1.100",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    device_type: "desktop",
    location: "서울, 대한민국",
    session_duration: 2400, // 40분
    pages_visited: 12,
    risk_level: "low"
  },
  {
    id: "2",
    user_id: "user_456",
    user_email: "nurse.lee@hospital.com", 
    user_name: "이간호사",
    action: "create_log",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    ip_address: "10.0.0.45",
    user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
    device_type: "mobile",
    location: "부산, 대한민국",
    risk_level: "low",
    metadata: {
      log_category: "clinical",
      log_duration: 8
    }
  },
  {
    id: "3",
    user_id: "user_789",
    user_email: "admin@hospital.com",
    user_name: "관리자",
    action: "multiple_failed_login",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    ip_address: "203.0.113.1",
    user_agent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
    device_type: "desktop",
    location: "미국, 캘리포니아",
    risk_level: "high",
    metadata: {
      failed_attempts: 5,
      suspicious_ip: true
    }
  },
  {
    id: "4",
    user_id: "user_456",
    user_email: "nurse.lee@hospital.com",
    user_name: "이간호사", 
    action: "bulk_delete",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    ip_address: "10.0.0.45",
    user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
    device_type: "mobile",
    location: "부산, 대한민국",
    risk_level: "medium",
    metadata: {
      deleted_count: 15,
      action_type: "bulk_operation"
    }
  }
]

// 모의 사용자 통계 데이터
const mockUserStats: UserStats[] = [
  {
    user_id: "user_123",
    user_email: "doctor.kim@hospital.com",
    user_name: "김의사",
    last_login: new Date().toISOString(),
    total_sessions: 45,
    total_logs_created: 128,
    avg_session_duration: 1800, // 30분
    devices_used: ["Desktop", "Mobile"],
    locations_accessed: ["서울, 대한민국"],
    risk_score: 15
  },
  {
    user_id: "user_456",
    user_email: "nurse.lee@hospital.com",
    user_name: "이간호사",
    last_login: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    total_sessions: 67,
    total_logs_created: 234,
    avg_session_duration: 2100,
    devices_used: ["Mobile", "Tablet"],
    locations_accessed: ["부산, 대한민국"],
    risk_score: 35
  },
  {
    user_id: "user_789",
    user_email: "admin@hospital.com",
    user_name: "관리자",
    last_login: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    total_sessions: 89,
    total_logs_created: 45,
    avg_session_duration: 3600,
    devices_used: ["Desktop"],
    locations_accessed: ["서울, 대한민국", "미국, 캘리포니아"],
    risk_score: 75
  }
]

export default function UserMonitoringPage() {
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  
  const [activities, setActivities] = useState<UserActivity[]>(mockUserActivities)
  const [userStats, setUserStats] = useState<UserStats[]>(mockUserStats)
  const [filteredActivities, setFilteredActivities] = useState<UserActivity[]>(mockUserActivities)
  const [selectedUser, setSelectedUser] = useState<string>("all")
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedActivity, setSelectedActivity] = useState<UserActivity | null>(null)
  const [isAutoRefresh, setIsAutoRefresh] = useState(true)

  // 관리자 권한 확인
  useEffect(() => {
    if (!isAdmin) {
      toast({
        title: "접근 권한 없음",
        description: "관리자만 접근할 수 있습니다.",
        variant: "destructive",
      })
      router.push("/dashboard")
    }
  }, [isAdmin, router, toast])

  // 자동 새로고침
  useEffect(() => {
    if (!isAutoRefresh) return

    const interval = setInterval(() => {
      // 실제 환경에서는 API에서 새 활동을 가져옴
      console.log("🔄 사용자 활동 자동 새로고침")
    }, 30000) // 30초마다

    return () => clearInterval(interval)
  }, [isAutoRefresh])

  // 활동 필터링
  useEffect(() => {
    let filtered = activities

    if (selectedUser !== "all") {
      filtered = filtered.filter(activity => activity.user_id === selectedUser)
    }

    if (selectedRiskLevel !== "all") {
      filtered = filtered.filter(activity => activity.risk_level === selectedRiskLevel)
    }

    if (searchQuery) {
      filtered = filtered.filter(activity =>
        activity.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.ip_address.includes(searchQuery)
      )
    }

    setFilteredActivities(filtered)
  }, [activities, selectedUser, selectedRiskLevel, searchQuery])

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />
      case "tablet":
        return <Smartphone className="h-4 w-4" />
      case "desktop":
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const getRiskBadge = (riskLevel: string) => {
    const variants = {
      low: { variant: "default" as const, color: "text-green-600" },
      medium: { variant: "secondary" as const, color: "text-yellow-600" },
      high: { variant: "destructive" as const, color: "text-red-600" }
    }

    const config = variants[riskLevel as keyof typeof variants] || variants.low

    return (
      <Badge variant={config.variant}>
        {riskLevel === 'low' ? '낮음' : riskLevel === 'medium' ? '보통' : '높음'}
      </Badge>
    )
  }

  const getActionBadge = (action: string) => {
    const actionMap: Record<string, { label: string, variant: any }> = {
      login: { label: "로그인", variant: "default" },
      logout: { label: "로그아웃", variant: "secondary" },
      create_log: { label: "활동 생성", variant: "default" },
      update_log: { label: "활동 수정", variant: "secondary" },
      delete_log: { label: "활동 삭제", variant: "destructive" },
      bulk_delete: { label: "일괄 삭제", variant: "destructive" },
      multiple_failed_login: { label: "로그인 실패", variant: "destructive" },
      password_change: { label: "비밀번호 변경", variant: "secondary" },
      profile_update: { label: "프로필 수정", variant: "secondary" }
    }

    const config = actionMap[action] || { label: action, variant: "outline" }

    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    )
  }

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}초`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분`
    return `${Math.floor(seconds / 3600)}시간 ${Math.floor((seconds % 3600) / 60)}분`
  }

  const getRiskScoreColor = (score: number): string => {
    if (score < 30) return "text-green-600"
    if (score < 70) return "text-yellow-600"
    return "text-red-600"
  }

  const handleRefresh = () => {
    // 실제 환경에서는 API 호출
    toast({
      title: "새로고침 완료",
      description: "최신 사용자 활동을 불러왔습니다.",
    })
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/analytics">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                관리자 대시보드
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold korean-text">사용자 활동 모니터링</h1>
              <p className="text-gray-600 korean-text">실시간 사용자 활동과 보안 위험을 모니터링합니다</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={isAutoRefresh ? "bg-green-50 border-green-200" : ""}
            >
              <Activity className={`h-4 w-4 mr-2 ${isAutoRefresh ? 'animate-pulse' : ''}`} />
              {isAutoRefresh ? "실시간 모니터링" : "일시정지"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              새로고침
            </Button>
          </div>
        </div>

        {/* 사용자 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {userStats.map((stat) => (
            <Card key={stat.user_id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg korean-text">{stat.user_name}</CardTitle>
                  <div className={`text-2xl font-bold ${getRiskScoreColor(stat.risk_score)}`}>
                    {stat.risk_score}
                  </div>
                </div>
                <CardDescription className="korean-text">{stat.user_email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 korean-text">마지막 접속</span>
                    <div className="font-medium">
                      {format(new Date(stat.last_login), "MM-dd HH:mm", { locale: ko })}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 korean-text">총 세션</span>
                    <div className="font-medium">{stat.total_sessions}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 korean-text">활동 수</span>
                    <div className="font-medium">{stat.total_logs_created}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 korean-text">평균 세션</span>
                    <div className="font-medium">{formatDuration(stat.avg_session_duration)}</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-500 korean-text">사용 기기</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {stat.devices_used.map((device) => (
                        <Badge key={device} variant="outline" className="text-xs">
                          {device}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 korean-text">접속 위치</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {stat.locations_accessed.map((location) => (
                        <Badge key={location} variant="outline" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {location}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 필터 및 검색 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span className="korean-text">필터</span>
                </div>
                
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="사용자 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 사용자</SelectItem>
                    {userStats.map((stat) => (
                      <SelectItem key={stat.user_id} value={stat.user_id}>
                        {stat.user_name} ({stat.user_email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedRiskLevel} onValueChange={setSelectedRiskLevel}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="위험도" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="low">낮음</SelectItem>
                    <SelectItem value="medium">보통</SelectItem>
                    <SelectItem value="high">높음</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="사용자, 활동, IP로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80"
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 활동 테이블 */}
        <Card>
          <CardHeader>
            <CardTitle className="korean-text">
              사용자 활동 ({filteredActivities.length}개)
            </CardTitle>
            <CardDescription className="korean-text">
              시간순으로 정렬된 사용자 활동 기록
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="korean-text">시간</TableHead>
                    <TableHead className="korean-text">사용자</TableHead>
                    <TableHead className="korean-text">활동</TableHead>
                    <TableHead className="korean-text">기기/위치</TableHead>
                    <TableHead className="korean-text">IP 주소</TableHead>
                    <TableHead className="korean-text">위험도</TableHead>
                    <TableHead className="korean-text">상세</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.map((activity) => (
                    <TableRow key={activity.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="font-mono text-sm">
                          {format(new Date(activity.timestamp), "MM-dd HH:mm:ss", { locale: ko })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium korean-text">{activity.user_name}</div>
                          <div className="text-sm text-gray-500">{activity.user_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getActionBadge(activity.action)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            {getDeviceIcon(activity.device_type)}
                            <span className="text-sm capitalize">{activity.device_type}</span>
                          </div>
                          {activity.location && (
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <MapPin className="h-3 w-3" />
                              <span>{activity.location}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">{activity.ip_address}</div>
                      </TableCell>
                      <TableCell>
                        {getRiskBadge(activity.risk_level)}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedActivity(activity)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle className="korean-text">활동 상세정보</DialogTitle>
                              <DialogDescription>
                                {format(new Date(activity.timestamp), "yyyy년 M월 d일 HH:mm:ss", { locale: ko })}
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedActivity && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium korean-text">사용자</label>
                                    <div className="mt-1">
                                      <div className="font-medium korean-text">{selectedActivity.user_name}</div>
                                      <div className="text-sm text-gray-600">{selectedActivity.user_email}</div>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium korean-text">활동</label>
                                    <div className="mt-1">
                                      {getActionBadge(selectedActivity.action)}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium korean-text">IP 주소</label>
                                    <div className="mt-1 font-mono text-sm">{selectedActivity.ip_address}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium korean-text">위험도</label>
                                    <div className="mt-1">
                                      {getRiskBadge(selectedActivity.risk_level)}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium korean-text">기기 유형</label>
                                    <div className="mt-1 flex items-center space-x-2">
                                      {getDeviceIcon(selectedActivity.device_type)}
                                      <span className="capitalize">{selectedActivity.device_type}</span>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium korean-text">위치</label>
                                    <div className="mt-1 text-sm text-gray-600">
                                      {selectedActivity.location || 'N/A'}
                                    </div>
                                  </div>
                                </div>

                                <Separator />

                                <div>
                                  <label className="text-sm font-medium korean-text">User Agent</label>
                                  <div className="mt-1 p-3 bg-gray-50 rounded text-sm font-mono break-all">
                                    {selectedActivity.user_agent}
                                  </div>
                                </div>

                                {selectedActivity.session_duration && (
                                  <div>
                                    <label className="text-sm font-medium korean-text">세션 정보</label>
                                    <div className="mt-1 grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="text-gray-500">세션 시간: </span>
                                        <span className="font-medium">{formatDuration(selectedActivity.session_duration)}</span>
                                      </div>
                                      {selectedActivity.pages_visited && (
                                        <div>
                                          <span className="text-gray-500">방문 페이지: </span>
                                          <span className="font-medium">{selectedActivity.pages_visited}개</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {selectedActivity.metadata && (
                                  <div>
                                    <label className="text-sm font-medium korean-text">추가 정보</label>
                                    <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
                                      <pre className="whitespace-pre-wrap">
                                        {JSON.stringify(selectedActivity.metadata, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 