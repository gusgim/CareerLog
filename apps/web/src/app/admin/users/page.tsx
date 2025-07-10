"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/trpc/provider"
import { ArrowLeft, Search, Trash2, UserCheck, UserX, Shield, Users, Activity, Clock } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import Link from "next/link"

export default function UsersManagementPage() {
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  // 권한 확인 - 관리자만 접근 가능
  useEffect(() => {
    if (!user || !isAdmin) {
      router.push("/dashboard")
      return
    }
  }, [user, isAdmin, router])

  // 사용자 목록 조회
  const { 
    data: usersData, 
    isLoading: isLoadingUsers, 
    refetch: refetchUsers 
  } = api.admin.getAllUsers.useQuery(
    { 
      limit: 10, 
      offset: page * 10, 
      search: search || undefined 
    },
    { 
      enabled: !!user && isAdmin,
      retry: false,
      refetchOnWindowFocus: false
    }
  )

  // 사용자 삭제 mutation
  const deleteUserMutation = api.admin.deleteUser.useMutation({
    onSuccess: () => {
      toast({
        title: "✅ 사용자 삭제 완료",
        description: "사용자가 성공적으로 삭제되었습니다.",
        variant: "success",
        duration: 3000,
      })
      refetchUsers()
      setSelectedUser(null)
    },
    onError: (error) => {
      toast({
        title: "❌ 삭제 실패",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      })
    },
  })

  const handleDeleteUser = async (userId: string) => {
    await deleteUserMutation.mutateAsync({ userId })
  }

  const handleSearch = () => {
    setPage(0)
    refetchUsers()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // 관리자가 아닌 경우 로딩 상태 표시
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 animate-spin" />
          <span className="korean-text">권한을 확인하는 중...</span>
        </div>
      </div>
    )
  }

  const users = usersData?.users || []
  const totalCount = usersData?.totalCount || 0
  const hasMore = usersData?.hasMore || false

  // 통계 계산
  const totalUsers = totalCount
  const adminUsers = users.filter(u => u.role === 'admin').length
  const activeUsers = users.filter(u => u.last_sign_in_at && 
    new Date(u.last_sign_in_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto pt-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="korean-text">대시보드로 돌아가기</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white korean-text">
                사용자 관리
              </h1>
              <p className="text-gray-600 dark:text-gray-300 korean-text">
                시스템의 모든 사용자를 관리하고 모니터링하세요
              </p>
            </div>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 korean-text">전체 사용자</p>
                  <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 korean-text">활성 사용자</p>
                  <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 korean-text">관리자</p>
                  <p className="text-2xl font-bold text-gray-900">{adminUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 korean-text">활동률</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 검색 및 필터 */}
        <Card className="mb-6 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="이름 또는 이메일로 검색..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-12 korean-text"
                  />
                </div>
              </div>
              <Button 
                onClick={handleSearch}
                className="h-12 px-6 korean-text"
              >
                검색
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 사용자 테이블 */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="korean-text">사용자 목록</CardTitle>
            <CardDescription className="korean-text">
              전체 사용자 정보와 활동 현황을 확인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <div className="flex items-center justify-center py-12">
                <Shield className="h-6 w-6 animate-spin mr-2" />
                <span className="korean-text">사용자 정보를 불러오는 중...</span>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="korean-text">사용자</TableHead>
                      <TableHead className="korean-text">역할</TableHead>
                      <TableHead className="korean-text">가입일</TableHead>
                      <TableHead className="korean-text">최근 접속</TableHead>
                      <TableHead className="korean-text">활동 수</TableHead>
                      <TableHead className="korean-text">마지막 활동</TableHead>
                      <TableHead className="korean-text">상태</TableHead>
                      <TableHead className="korean-text">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32">
                          <div className="flex flex-col items-center justify-center space-y-3 text-gray-500">
                            <Users className="h-12 w-12 text-gray-300" />
                            <div className="text-center">
                              <p className="font-medium korean-text">
                                {search ? '검색 결과가 없습니다' : '등록된 사용자가 없습니다'}
                              </p>
                              <p className="text-sm korean-text">
                                {search 
                                  ? '다른 검색어로 다시 시도해보세요' 
                                  : '첫 번째 사용자가 회원가입할 때까지 기다려주세요'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium korean-text">
                                {user.user_metadata?.full_name || '이름 없음'}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.user_metadata?.role === 'admin' ? 'destructive' : 'secondary'}
                            >
                              {user.user_metadata?.role === 'admin' ? (
                                <span className="korean-text">👑 관리자</span>
                              ) : (
                                <span className="korean-text">👤 사용자</span>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="korean-text">
                            {format(new Date(user.created_at), 'yyyy.MM.dd', { locale: ko })}
                          </TableCell>
                          <TableCell>
                            {user.last_sign_in_at ? (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-sm korean-text">
                                  {format(new Date(user.last_sign_in_at), 'MM.dd HH:mm', { locale: ko })}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400 korean-text">접속 기록 없음</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="korean-text">
                              {user.activity_count || 0}개
                            </Badge>
                          </TableCell>
                          <TableCell className="korean-text">
                            {user.last_activity_date ? 
                              format(new Date(user.last_activity_date), 'MM.dd', { locale: ko }) : 
                              '활동 없음'}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.email_confirmed_at ? 'secondary' : 'destructive'}
                              className="korean-text"
                            >
                              {user.email_confirmed_at ? '✅ 인증됨' : '❌ 미인증'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.user_metadata?.role !== 'admin' && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="korean-text">사용자 삭제</AlertDialogTitle>
                                    <AlertDialogDescription className="korean-text">
                                      정말로 "{user.user_metadata?.full_name || user.email}" 사용자를 삭제하시겠습니까? 
                                      이 작업은 되돌릴 수 없으며, 모든 관련 데이터가 함께 삭제됩니다.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="korean-text">취소</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteUser(user.id)}
                                      className="bg-red-600 hover:bg-red-700 korean-text"
                                    >
                                      삭제
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* 페이지네이션 */}
            {!isLoadingUsers && totalCount > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600 korean-text">
                  전체 {totalCount}명 중 {page * 10 + 1}-{Math.min((page + 1) * 10, totalCount)}명 표시
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="korean-text"
                  >
                    이전
                  </Button>
                  <span className="text-sm font-medium px-3 py-1 bg-gray-100 rounded korean-text">
                    {page + 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={!hasMore}
                    className="korean-text"
                  >
                    다음
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 