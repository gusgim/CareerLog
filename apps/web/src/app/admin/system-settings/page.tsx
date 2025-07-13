"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/trpc/provider"
import { 
  ArrowLeft, 
  Settings, 
  Save, 
  RefreshCw, 
  Shield, 
  Database,
  FileText,
  Bell,
  Users,
  HardDrive
} from "lucide-react"
import Link from "next/link"

export default function SystemSettingsPage() {
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  
  // 설정 상태
  const [siteName, setSiteName] = useState("")
  const [siteDescription, setSiteDescription] = useState("")
  const [allowUserRegistration, setAllowUserRegistration] = useState(true)
  const [requireEmailVerification, setRequireEmailVerification] = useState(true)
  const [maxLogsPerUser, setMaxLogsPerUser] = useState(1000)
  const [maxFileUploadSize, setMaxFileUploadSize] = useState(10)
  const [enableNotifications, setEnableNotifications] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  // 권한 확인 - 관리자만 접근 가능
  useEffect(() => {
    if (!user || !isAdmin) {
      router.push("/dashboard")
      return
    }
  }, [user, isAdmin, router])

  // 시스템 설정 조회
  const { 
    data: settingsData, 
    isLoading: isLoadingSettings,
    refetch: refetchSettings
  } = api.admin.getSystemSettings.useQuery(
    undefined,
    { 
      enabled: !!user && isAdmin,
      retry: false,
      refetchOnWindowFocus: false
    }
  )

  // 설정 업데이트 mutation
  const updateSettingsMutation = api.admin.updateSystemSettings.useMutation({
    onSuccess: (data) => {
      toast({
        title: "✅ 설정 저장 완료",
        description: data.message || "시스템 설정이 성공적으로 업데이트되었습니다.",
        variant: "success",
        duration: 3000,
      })
      refetchSettings()
    },
    onError: (error) => {
      toast({
        title: "❌ 설정 저장 실패",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      })
    },
  })

  // 설정 데이터 로드 시 폼 업데이트
  useEffect(() => {
    if (settingsData) {
      setSiteName(settingsData.siteName || "")
      setSiteDescription(settingsData.siteDescription || "")
      setAllowUserRegistration(settingsData.allowUserRegistration ?? true)
      setRequireEmailVerification(settingsData.requireEmailVerification ?? true)
      setMaxLogsPerUser(settingsData.maxLogsPerUser || 1000)
      setMaxFileUploadSize(settingsData.maxFileUploadSize || 10)
      setEnableNotifications(settingsData.enableNotifications ?? true)
      setMaintenanceMode(settingsData.maintenanceMode ?? false)
    }
  }, [settingsData])

  const handleSaveSettings = async () => {
    try {
      await updateSettingsMutation.mutateAsync({
        siteName,
        siteDescription,
        allowUserRegistration,
        requireEmailVerification,
        maxLogsPerUser,
        maxFileUploadSize,
        enableNotifications,
        maintenanceMode,
      })
    } catch (error) {
      // 에러는 mutation의 onError에서 처리됨
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

  if (isLoadingSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Settings className="h-6 w-6 animate-spin" />
          <span className="korean-text">설정을 불러오는 중...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto pt-8">
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
                시스템 설정
              </h1>
              <p className="text-gray-600 dark:text-gray-300 korean-text">
                CareerLog 시스템의 전반적인 설정을 관리하세요
              </p>
            </div>
          </div>
          <Button 
            onClick={handleSaveSettings}
            disabled={updateSettingsMutation.isLoading}
            className="bg-blue-600 hover:bg-blue-700 korean-text"
          >
            {updateSettingsMutation.isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                설정 저장
              </>
            )}
          </Button>
        </div>

        <div className="space-y-8">
          {/* 기본 사이트 설정 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 korean-text">
                <Settings className="h-5 w-5" />
                <span>기본 사이트 설정</span>
              </CardTitle>
              <CardDescription className="korean-text">
                사이트의 기본 정보와 브랜딩을 설정합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName" className="korean-text">사이트 이름</Label>
                  <Input
                    id="siteName"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="CareerLog"
                    className="korean-text"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="korean-text">시스템 버전</Label>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">v{settingsData?.systemVersion || "2.1.0"}</Badge>
                    <span className="text-sm text-gray-500 korean-text">현재 버전</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription" className="korean-text">사이트 설명</Label>
                <Textarea
                  id="siteDescription"
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  placeholder="의료진을 위한 커리어 관리 플랫폼"
                  className="korean-text"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* 사용자 관리 설정 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 korean-text">
                <Users className="h-5 w-5" />
                <span>사용자 관리 설정</span>
              </CardTitle>
              <CardDescription className="korean-text">
                사용자 등록 및 인증 관련 설정을 관리합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="korean-text">사용자 회원가입 허용</Label>
                  <p className="text-sm text-gray-500 korean-text">
                    새로운 사용자의 회원가입을 허용할지 설정합니다
                  </p>
                </div>
                <Switch
                  checked={allowUserRegistration}
                  onCheckedChange={setAllowUserRegistration}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="korean-text">이메일 인증 필수</Label>
                  <p className="text-sm text-gray-500 korean-text">
                    회원가입 시 이메일 인증을 필수로 할지 설정합니다
                  </p>
                </div>
                <Switch
                  checked={requireEmailVerification}
                  onCheckedChange={setRequireEmailVerification}
                />
              </div>
            </CardContent>
          </Card>

          {/* 시스템 제한 설정 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 korean-text">
                <Database className="h-5 w-5" />
                <span>시스템 제한 설정</span>
              </CardTitle>
              <CardDescription className="korean-text">
                시스템 리소스 사용량과 제한을 설정합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxLogsPerUser" className="korean-text">
                    사용자당 최대 활동 수
                  </Label>
                  <Input
                    id="maxLogsPerUser"
                    type="number"
                    value={maxLogsPerUser}
                    onChange={(e) => setMaxLogsPerUser(parseInt(e.target.value) || 0)}
                    placeholder="1000"
                    min="1"
                    max="10000"
                  />
                  <p className="text-xs text-gray-500 korean-text">
                    한 사용자가 기록할 수 있는 최대 활동 수입니다
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxFileUploadSize" className="korean-text">
                    최대 파일 업로드 크기 (MB)
                  </Label>
                  <Input
                    id="maxFileUploadSize"
                    type="number"
                    value={maxFileUploadSize}
                    onChange={(e) => setMaxFileUploadSize(parseInt(e.target.value) || 0)}
                    placeholder="10"
                    min="1"
                    max="100"
                  />
                  <p className="text-xs text-gray-500 korean-text">
                    첨부 파일의 최대 크기를 제한합니다
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 기능 설정 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 korean-text">
                <Bell className="h-5 w-5" />
                <span>기능 설정</span>
              </CardTitle>
              <CardDescription className="korean-text">
                시스템의 다양한 기능을 활성화하거나 비활성화합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="korean-text">알림 기능 활성화</Label>
                  <p className="text-sm text-gray-500 korean-text">
                    사용자에게 시스템 알림을 전송할지 설정합니다
                  </p>
                </div>
                <Switch
                  checked={enableNotifications}
                  onCheckedChange={setEnableNotifications}
                />
              </div>
            </CardContent>
          </Card>

          {/* 시스템 상태 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 korean-text">
                <HardDrive className="h-5 w-5" />
                <span>시스템 상태</span>
              </CardTitle>
              <CardDescription className="korean-text">
                현재 시스템의 상태와 리소스 사용량을 확인합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600 korean-text mb-1">마지막 백업</div>
                  <div className="text-lg font-semibold text-blue-900">
                    {settingsData?.lastBackup ? 
                      new Date(settingsData.lastBackup).toLocaleDateString('ko-KR') : 
                      '데이터 없음'
                    }
                  </div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600 korean-text mb-1">스토리지 사용량</div>
                  <div className="text-lg font-semibold text-green-900">
                    {settingsData?.storageUsed || 0} MB / {settingsData?.storageLimit || 5000} MB
                  </div>
                  <div className="text-xs text-green-600 korean-text">
                    ({Math.round(((settingsData?.storageUsed || 0) / (settingsData?.storageLimit || 5000)) * 100)}% 사용)
                  </div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-purple-600 korean-text mb-1">시스템 상태</div>
                  <div className="text-lg font-semibold text-purple-900">
                    {maintenanceMode ? '🔧 점검 중' : '✅ 정상'}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="korean-text">점검 모드</Label>
                  <p className="text-sm text-gray-500 korean-text">
                    시스템을 점검 모드로 전환합니다 (관리자만 접근 가능)
                  </p>
                </div>
                <Switch
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
              </div>
            </CardContent>
          </Card>

          {/* 개발 도구 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 korean-text">
                <FileText className="h-5 w-5" />
                <span>개발 도구</span>
              </CardTitle>
              <CardDescription className="korean-text">
                개발 및 데모를 위한 유틸리티 도구들입니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/admin/demo-validation">
                  <Card className="border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                          <Database className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-blue-900 korean-text">데모 데이터 검증</div>
                          <div className="text-sm text-blue-600 korean-text">
                            더미 데이터 상태 확인 및 차트 준비성 검증
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                
                <Card className="border border-gray-200 bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                        <HardDrive className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-500 korean-text">데이터 백업 도구</div>
                        <div className="text-sm text-gray-400 korean-text">
                          곧 출시 예정
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800 korean-text mb-1">
                      💡 데모 데이터 검증 도구
                    </h4>
                    <p className="text-sm text-blue-700 korean-text">
                      생성된 더미 데이터가 모든 차트와 그래프에서 의미있게 표시되는지 자동으로 검증합니다. 
                      데모 시연 전에 실행하여 준비 상태를 확인하세요.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 주의사항 */}
          <Card className="border-0 shadow-lg border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-800 korean-text mb-2">
                    설정 변경 시 주의사항
                  </h3>
                  <ul className="text-sm text-orange-700 korean-text space-y-1">
                    <li>• 설정 변경은 즉시 반영되며, 모든 사용자에게 영향을 줍니다</li>
                    <li>• 점검 모드 활성화 시 일반 사용자는 시스템에 접근할 수 없습니다</li>
                    <li>• 파일 업로드 크기 제한을 낮추면 기존 파일은 영향받지 않습니다</li>
                    <li>• 중요한 설정 변경 전에는 반드시 백업을 수행하세요</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 