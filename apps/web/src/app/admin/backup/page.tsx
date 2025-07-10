"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Download, 
  Upload, 
  Database,
  RefreshCw,
  Trash2,
  Calendar,
  Users,
  FileArchive,
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import Link from "next/link"

interface BackupInfo {
  id: string
  filename: string
  created_at: string
  size: number
  type: 'auto' | 'manual'
  status: 'completed' | 'failed' | 'in_progress'
  tables_included: string[]
  description?: string
  download_url?: string
}

// 모의 백업 데이터
const mockBackups: BackupInfo[] = [
  {
    id: "1",
    filename: "careerlog_backup_2025-01-08_14-30-00.sql",
    created_at: new Date().toISOString(),
    size: 2048576, // 2MB
    type: "manual",
    status: "completed",
    tables_included: ["logs", "profiles", "auth.users"],
    description: "정기 수동 백업 - 모든 사용자 데이터 포함"
  },
  {
    id: "2", 
    filename: "careerlog_backup_2025-01-07_02-00-00.sql",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    size: 1895432,
    type: "auto",
    status: "completed",
    tables_included: ["logs", "profiles"],
    description: "자동 일일 백업"
  },
  {
    id: "3",
    filename: "careerlog_backup_2025-01-06_02-00-00.sql", 
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    size: 1567890,
    type: "auto",
    status: "completed",
    tables_included: ["logs", "profiles"],
    description: "자동 일일 백업"
  },
  {
    id: "4",
    filename: "careerlog_backup_2025-01-05_14-15-30.sql",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    size: 987654,
    type: "manual",
    status: "failed",
    tables_included: ["logs"],
    description: "부분 백업 시도 - 실패"
  }
]

export default function BackupPage() {
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  
  const [backups, setBackups] = useState<BackupInfo[]>(mockBackups)
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<BackupInfo | null>(null)
  const [backupDescription, setBackupDescription] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: { variant: "default" as const, color: "text-green-600", icon: CheckCircle },
      failed: { variant: "destructive" as const, color: "text-red-600", icon: AlertTriangle },
      in_progress: { variant: "secondary" as const, color: "text-blue-600", icon: Clock }
    }

    const config = variants[status as keyof typeof variants] || variants.completed
    const Icon = config.icon

    return (
      <div className="flex items-center space-x-2">
        <Icon className={`h-4 w-4 ${config.color}`} />
        <Badge variant={config.variant}>
          {status === 'completed' ? '완료' : status === 'failed' ? '실패' : '진행중'}
        </Badge>
      </div>
    )
  }

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true)
    
    // 실제 환경에서는 API 호출
    setTimeout(() => {
      const newBackup: BackupInfo = {
        id: Date.now().toString(),
        filename: `careerlog_backup_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.sql`,
        created_at: new Date().toISOString(),
        size: Math.floor(Math.random() * 3000000) + 1000000, // 1-4MB 랜덤
        type: "manual",
        status: "completed",
        tables_included: ["logs", "profiles", "auth.users"],
        description: backupDescription || "수동 백업"
      }
      
      setBackups(prev => [newBackup, ...prev])
      setBackupDescription("")
      setIsCreatingBackup(false)
      
      toast({
        title: "백업 생성 완료! 💾",
        description: "데이터베이스 백업이 성공적으로 생성되었습니다.",
        variant: "success",
      })
    }, 3000)
  }

  const handleDownloadBackup = (backup: BackupInfo) => {
    // 실제 환경에서는 서버에서 파일 다운로드
    const link = document.createElement('a')
    link.href = `data:text/plain;charset=utf-8,${encodeURIComponent('-- CareerLog Database Backup\\n-- Generated: ' + backup.created_at + '\\n-- This is a mock backup file.')}`
    link.download = backup.filename
    link.click()
    
    toast({
      title: "백업 다운로드 시작",
      description: `${backup.filename} 파일을 다운로드합니다.`,
    })
  }

  const handleRestoreBackup = async (backup: BackupInfo) => {
    setIsRestoring(true)
    setSelectedBackup(backup)
    
    // 실제 환경에서는 복원 API 호출
    setTimeout(() => {
      setIsRestoring(false)
      setSelectedBackup(null)
      
      toast({
        title: "데이터 복원 완료! 🔄",
        description: `${backup.filename}에서 데이터가 성공적으로 복원되었습니다.`,
        variant: "success",
      })
    }, 5000)
  }

  const handleDeleteBackup = (backupId: string) => {
    setBackups(prev => prev.filter(b => b.id !== backupId))
    toast({
      title: "백업 삭제 완료",
      description: "백업 파일이 삭제되었습니다.",
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      toast({
        title: "파일 선택됨",
        description: `${file.name} 파일이 선택되었습니다.`,
      })
    }
  }

  const handleUploadRestore = async () => {
    if (!uploadedFile) return
    
    setIsRestoring(true)
    
    // 실제 환경에서는 파일 업로드 후 복원 API 호출
    setTimeout(() => {
      setIsRestoring(false)
      setUploadedFile(null)
      
      toast({
        title: "업로드 복원 완료! 📁",
        description: `${uploadedFile.name}에서 데이터가 복원되었습니다.`,
        variant: "success",
      })
    }, 4000)
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
              <h1 className="text-3xl font-bold korean-text">백업 및 복원</h1>
              <p className="text-gray-600 korean-text">데이터베이스 백업을 생성하고 관리합니다</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isCreatingBackup && (
              <div className="flex items-center space-x-2 text-blue-600">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm korean-text">백업 생성 중...</span>
              </div>
            )}
            {isRestoring && (
              <div className="flex items-center space-x-2 text-green-600">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm korean-text">복원 진행 중...</span>
              </div>
            )}
          </div>
        </div>

        {/* 백업 생성 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 korean-text">
                <Database className="h-5 w-5" />
                <span>새 백업 생성</span>
              </CardTitle>
              <CardDescription className="korean-text">
                현재 데이터베이스의 백업을 생성합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="description" className="korean-text">백업 설명 (선택사항)</Label>
                <Textarea
                  id="description"
                  placeholder="이 백업에 대한 설명을 입력하세요..."
                  value={backupDescription}
                  onChange={(e) => setBackupDescription(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={handleCreateBackup}
                disabled={isCreatingBackup}
                className="w-full korean-text"
              >
                {isCreatingBackup ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    백업 생성 중...
                  </>
                ) : (
                  <>
                    <HardDrive className="mr-2 h-4 w-4" />
                    백업 생성
                  </>
                )}
              </Button>
              
              <div className="text-xs text-gray-500 korean-text">
                • 모든 사용자 데이터와 활동 로그가 포함됩니다<br />
                • 백업 생성에는 몇 분이 소요될 수 있습니다<br />
                • 생성된 백업은 자동으로 암호화됩니다
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 korean-text">
                <Upload className="h-5 w-5" />
                <span>백업 파일 업로드</span>
              </CardTitle>
              <CardDescription className="korean-text">
                백업 파일을 업로드하여 데이터를 복원합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="backup-file" className="korean-text">백업 파일 선택</Label>
                <Input
                  id="backup-file"
                  type="file"
                  accept=".sql,.backup,.zip"
                  onChange={handleFileUpload}
                  className="mt-1"
                />
              </div>
              
              {uploadedFile && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileArchive className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium korean-text">{uploadedFile.name}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    크기: {formatFileSize(uploadedFile.size)}
                  </div>
                </div>
              )}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive"
                    disabled={!uploadedFile || isRestoring}
                    className="w-full korean-text"
                  >
                    {isRestoring ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        복원 중...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        업로드 및 복원
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="korean-text">데이터 복원 확인</AlertDialogTitle>
                    <AlertDialogDescription className="korean-text">
                      ⚠️ 주의: 현재 데이터베이스의 모든 데이터가 백업 파일의 데이터로 대체됩니다.
                      이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="korean-text">취소</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleUploadRestore}
                      className="bg-red-600 hover:bg-red-700 korean-text"
                    >
                      복원 실행
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <div className="text-xs text-gray-500 korean-text">
                • .sql, .backup, .zip 파일만 지원됩니다<br />
                • 복원 시 현재 데이터가 모두 삭제됩니다<br />
                • 복원 전 반드시 현재 데이터를 백업하세요
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 백업 목록 */}
        <Card>
          <CardHeader>
            <CardTitle className="korean-text">백업 이력 ({backups.length}개)</CardTitle>
            <CardDescription className="korean-text">
              생성된 백업 파일들을 관리합니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="korean-text">파일명</TableHead>
                    <TableHead className="korean-text">생성일시</TableHead>
                    <TableHead className="korean-text">크기</TableHead>
                    <TableHead className="korean-text">유형</TableHead>
                    <TableHead className="korean-text">상태</TableHead>
                    <TableHead className="korean-text">포함 테이블</TableHead>
                    <TableHead className="korean-text">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((backup) => (
                    <TableRow key={backup.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{backup.filename}</div>
                          {backup.description && (
                            <div className="text-xs text-gray-500 korean-text">{backup.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(backup.created_at), "yyyy-MM-dd", { locale: ko })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(backup.created_at), "HH:mm:ss", { locale: ko })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatFileSize(backup.size)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={backup.type === 'auto' ? 'secondary' : 'default'}>
                          {backup.type === 'auto' ? '자동' : '수동'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(backup.status)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {backup.tables_included.map((table) => (
                            <Badge key={table} variant="outline" className="text-xs">
                              {table}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {backup.status === 'completed' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadBackup(backup)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="korean-text">백업 복원 확인</AlertDialogTitle>
                                    <AlertDialogDescription className="korean-text">
                                      이 백업으로 데이터를 복원하시겠습니까?<br />
                                      현재 데이터는 모두 삭제되고 {format(new Date(backup.created_at), "yyyy년 M월 d일", { locale: ko })} 상태로 되돌아갑니다.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="korean-text">취소</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleRestoreBackup(backup)}
                                      className="bg-blue-600 hover:bg-blue-700 korean-text"
                                    >
                                      복원 실행
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="korean-text">백업 삭제</AlertDialogTitle>
                                <AlertDialogDescription className="korean-text">
                                  이 백업 파일을 삭제하시겠습니까? 삭제된 백업은 복구할 수 없습니다.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="korean-text">취소</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteBackup(backup.id)}
                                  className="bg-red-600 hover:bg-red-700 korean-text"
                                >
                                  삭제
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
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