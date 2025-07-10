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
  RefreshCw, 
  Download, 
  Search, 
  Filter,
  AlertTriangle,
  Info,
  XCircle,
  CheckCircle,
  Clock,
  Eye,
  Trash2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import Link from "next/link"

interface SystemLog {
  id: string
  timestamp: string
  level: 'error' | 'warn' | 'info' | 'debug'
  message: string
  source: string
  user_id?: string
  user_email?: string
  metadata?: Record<string, any>
  stack_trace?: string
}

// 모의 시스템 로그 데이터
const mockSystemLogs: SystemLog[] = [
  {
    id: "1",
    timestamp: new Date().toISOString(),
    level: "error",
    message: "Database connection failed",
    source: "database",
    metadata: {
      error_code: "CONNECTION_TIMEOUT",
      retry_count: 3,
      endpoint: "postgresql://localhost:5432"
    },
    stack_trace: "Error: Connection timeout\n    at Database.connect (/app/db.js:45)\n    at async main (/app/index.js:12)"
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    level: "warn",
    message: "User login attempt with invalid credentials",
    source: "auth",
    user_email: "unknown@example.com",
    metadata: {
      ip_address: "192.168.1.100",
      user_agent: "Mozilla/5.0...",
      attempt_count: 2
    }
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    level: "info",
    message: "New user registration completed",
    source: "auth",
    user_id: "user_123",
    user_email: "newuser@hospital.com",
    metadata: {
      ip_address: "10.0.0.45",
      signup_method: "email"
    }
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    level: "debug",
    message: "Cache hit for user profile data",
    source: "cache",
    user_id: "user_456",
    metadata: {
      cache_key: "profile:user_456",
      hit_ratio: 0.87
    }
  },
  {
    id: "5",
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    level: "error",
    message: "Failed to send verification email",
    source: "email",
    user_email: "test@example.com",
    metadata: {
      smtp_error: "Invalid recipient",
      email_provider: "sendgrid"
    }
  }
]

export default function SystemLogsPage() {
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  
  const [logs, setLogs] = useState<SystemLog[]>(mockSystemLogs)
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>(mockSystemLogs)
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null)
  const [isAutoRefresh, setIsAutoRefresh] = useState(false)

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
      // 실제 환경에서는 API에서 새 로그를 가져옴
      console.log("🔄 로그 자동 새로고침")
    }, 30000) // 30초마다

    return () => clearInterval(interval)
  }, [isAutoRefresh])

  // 로그 필터링
  useEffect(() => {
    let filtered = logs

    if (selectedLevel !== "all") {
      filtered = filtered.filter(log => log.level === selectedLevel)
    }

    if (searchQuery) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredLogs(filtered)
  }, [logs, selectedLevel, searchQuery])

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warn":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      case "debug":
        return <CheckCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getLevelBadge = (level: string) => {
    const variants = {
      error: "destructive",
      warn: "secondary",
      info: "default", 
      debug: "outline"
    } as const

    return (
      <Badge variant={variants[level as keyof typeof variants] || "outline"}>
        {level.toUpperCase()}
      </Badge>
    )
  }

  const handleRefresh = () => {
    // 실제 환경에서는 API 호출
    toast({
      title: "새로고침 완료",
      description: "최신 로그를 불러왔습니다.",
    })
  }

  const handleExport = () => {
    const csvContent = [
      "Timestamp,Level,Source,Message,User",
      ...filteredLogs.map(log => 
        `"${log.timestamp}","${log.level}","${log.source}","${log.message}","${log.user_email || 'N/A'}"`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `system-logs-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "로그 내보내기 완료",
      description: "CSV 파일로 다운로드되었습니다.",
    })
  }

  const handleClearLogs = () => {
    setLogs([])
    toast({
      title: "로그 정리 완료",
      description: "모든 로그가 삭제되었습니다.",
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
              <h1 className="text-3xl font-bold korean-text">시스템 로그</h1>
              <p className="text-gray-600 korean-text">시스템 활동과 오류를 모니터링합니다</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={isAutoRefresh ? "bg-green-50 border-green-200" : ""}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isAutoRefresh ? 'animate-spin' : ''}`} />
              {isAutoRefresh ? "자동 새로고침 중" : "자동 새로고침"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              새로고침
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              CSV 내보내기
            </Button>
            <Button variant="destructive" size="sm" onClick={handleClearLogs}>
              <Trash2 className="h-4 w-4 mr-2" />
              로그 정리
            </Button>
          </div>
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
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="로그 레벨" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="error">ERROR</SelectItem>
                    <SelectItem value="warn">WARN</SelectItem>
                    <SelectItem value="info">INFO</SelectItem>
                    <SelectItem value="debug">DEBUG</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="메시지, 소스, 사용자로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80"
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 로그 테이블 */}
        <Card>
          <CardHeader>
            <CardTitle className="korean-text">
              시스템 로그 ({filteredLogs.length}개)
            </CardTitle>
            <CardDescription className="korean-text">
              시간순으로 정렬된 시스템 활동 기록
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[600px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="korean-text">시간</TableHead>
                    <TableHead className="korean-text">레벨</TableHead>
                    <TableHead className="korean-text">소스</TableHead>
                    <TableHead className="korean-text">메시지</TableHead>
                    <TableHead className="korean-text">사용자</TableHead>
                    <TableHead className="korean-text">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="font-mono text-sm">
                          {format(new Date(log.timestamp), "MM-dd HH:mm:ss", { locale: ko })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getLevelIcon(log.level)}
                          {getLevelBadge(log.level)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.source}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md truncate korean-text">
                          {log.message}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {log.user_email || 'System'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedLog(log)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle className="korean-text">로그 상세정보</DialogTitle>
                              <DialogDescription>
                                {format(new Date(log.timestamp), "yyyy년 M월 d일 HH:mm:ss", { locale: ko })}
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedLog && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium korean-text">레벨</label>
                                    <div className="mt-1">
                                      {getLevelBadge(selectedLog.level)}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium korean-text">소스</label>
                                    <div className="mt-1">
                                      <Badge variant="outline">{selectedLog.source}</Badge>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium korean-text">사용자 ID</label>
                                    <div className="mt-1 text-sm text-gray-600">
                                      {selectedLog.user_id || 'N/A'}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium korean-text">사용자 이메일</label>
                                    <div className="mt-1 text-sm text-gray-600">
                                      {selectedLog.user_email || 'N/A'}
                                    </div>
                                  </div>
                                </div>

                                <Separator />

                                <div>
                                  <label className="text-sm font-medium korean-text">메시지</label>
                                  <div className="mt-1 p-3 bg-gray-50 rounded text-sm korean-text">
                                    {selectedLog.message}
                                  </div>
                                </div>

                                {selectedLog.metadata && (
                                  <div>
                                    <label className="text-sm font-medium korean-text">메타데이터</label>
                                    <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
                                      <pre className="whitespace-pre-wrap">
                                        {JSON.stringify(selectedLog.metadata, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                )}

                                {selectedLog.stack_trace && (
                                  <div>
                                    <label className="text-sm font-medium korean-text">스택 트레이스</label>
                                    <div className="mt-1 p-3 bg-red-50 rounded text-sm font-mono">
                                      <pre className="whitespace-pre-wrap text-red-800">
                                        {selectedLog.stack_trace}
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