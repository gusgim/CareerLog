"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft, Mail, Settings } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const { resetPassword } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const checkSupabaseConfig = async () => {
    try {
      console.log('🔍 Supabase 구성 확인 시작...')
      
      const supabase = createClient()
      
      // 1. 환경 변수 확인
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      // 2. 사용자 존재 여부 확인 (간접적으로)
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
      
      // 3. 현재 세션 확인
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      const info = {
        environment: {
          url: supabaseUrl,
          hasKey: !!supabaseKey,
          keyPrefix: supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'undefined',
          currentOrigin: window.location.origin
        },
        auth: {
          sessionError: sessionError?.message || null,
          hasSession: !!session,
          listUsersError: listError?.message || null,
          userCount: users?.length || 'N/A'
        },
        timestamp: new Date().toISOString()
      }
      
      console.log('📊 Supabase 구성 정보:', info)
      setDebugInfo(info)
      
      return info
    } catch (error) {
      console.error('❌ Supabase 구성 확인 실패:', error)
      const errorInfo = {
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        timestamp: new Date().toISOString()
      }
      setDebugInfo(errorInfo)
      return errorInfo
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast({
        title: "이메일 필수",
        description: "이메일 주소를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await resetPassword(email)

      if (error) {
        toast({
          title: "❌ 비밀번호 재설정 실패",
          description: error,
          variant: "destructive",
          duration: 8000,
        })
      } else {
        setEmailSent(true)
        toast({
          title: "📧 이메일 발송 완료!",
          description: "비밀번호 재설정 링크를 이메일로 보내드렸습니다.",
          variant: "success",
          duration: 5000,
        })
      }
    } catch (error) {
      toast({
        title: "❌ 시스템 오류",
        description: "비밀번호 재설정 요청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
        duration: 5000,
      })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* 배경 이미지 */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/login-bg.jpg')`,
        }}
      ></div>
      {/* 다크 오버레이 (가독성을 위해) */}
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50"></div>
      
      {/* 테마 토글 버튼 */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* 로고 및 헤더 */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
            <span className="text-2xl font-bold text-white">🏥</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white korean-text">
              CareerLog
            </h1>
            <p className="text-white/90 korean-text">
              비밀번호 재설정
            </p>
          </div>
        </div>

        {/* 비밀번호 재설정 폼 */}
        <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold korean-text">
              {emailSent ? "이메일 발송 완료" : "비밀번호를 잊으셨나요?"}
            </CardTitle>
            <CardDescription className="korean-text">
              {emailSent 
                ? "이메일을 확인하여 비밀번호를 재설정하세요" 
                : "가입하신 이메일 주소를 입력해주세요"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="space-y-6 text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300 korean-text">
                    <strong>{email}</strong>로 비밀번호 재설정 링크를 보내드렸습니다.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 korean-text">
                    이메일을 받지 못하셨다면 스팸함을 확인해주세요.
                  </p>
                </div>
                <div className="space-y-3">
                  <Button
                    onClick={() => setEmailSent(false)}
                    variant="outline"
                    className="w-full korean-text"
                  >
                    다른 이메일로 재시도
                  </Button>
                  <Link href="/">
                    <Button
                      variant="default"
                      className="w-full korean-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      로그인 페이지로 돌아가기
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="korean-text font-medium">
                    이메일 주소
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="gisugim0407@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 text-base"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold korean-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      이메일 발송 중...
                    </>
                  ) : (
                    "비밀번호 재설정 이메일 보내기"
                  )}
                </Button>

                {/* 로그인 페이지로 돌아가기 */}
                <div className="text-center">
                  <Link
                    href="/"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 transition-colors korean-text"
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    로그인 페이지로 돌아가기
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* 도움말 */}
        <div className="text-center space-y-2">
          <p className="text-sm text-white/70 korean-text">
            💡 이메일이 도착하지 않으면 스팸함을 확인해주세요
          </p>
          <p className="text-sm text-white/70 korean-text">
            🔒 링크는 24시간 동안 유효합니다
          </p>
        </div>

        {/* 디버깅 섹션 */}
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowDebug(!showDebug)
              if (!showDebug) checkSupabaseConfig()
            }}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 korean-text"
          >
            <Settings className="mr-2 h-4 w-4" />
            {showDebug ? '디버깅 정보 숨기기' : '문제 해결 정보 확인'}
          </Button>
        </div>

        {showDebug && debugInfo && (
          <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg korean-text">🔍 시스템 진단 정보</CardTitle>
              <CardDescription className="korean-text">
                이메일이 발송되지 않는 문제를 해결하기 위한 진단 정보입니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                {debugInfo.environment && (
                  <div>
                    <h4 className="font-semibold korean-text mb-2">🌍 환경 설정</h4>
                    <div className="bg-gray-100 p-3 rounded space-y-1">
                      <p><strong>URL:</strong> {debugInfo.environment.url || '❌ 설정되지 않음'}</p>
                      <p><strong>API Key:</strong> {debugInfo.environment.hasKey ? '✅ 설정됨' : '❌ 설정되지 않음'}</p>
                      <p><strong>현재 도메인:</strong> {debugInfo.environment.currentOrigin}</p>
                    </div>
                  </div>
                )}
                
                {debugInfo.auth && (
                  <div>
                    <h4 className="font-semibold korean-text mb-2">🔐 인증 상태</h4>
                    <div className="bg-gray-100 p-3 rounded space-y-1">
                      <p><strong>세션 오류:</strong> {debugInfo.auth.sessionError || '✅ 정상'}</p>
                      <p><strong>사용자 목록 오류:</strong> {debugInfo.auth.listUsersError || '✅ 정상'}</p>
                      <p><strong>등록 사용자 수:</strong> {debugInfo.auth.userCount}</p>
                    </div>
                  </div>
                )}

                {debugInfo.error && (
                  <div>
                    <h4 className="font-semibold korean-text mb-2 text-red-600">❌ 오류 정보</h4>
                    <div className="bg-red-50 p-3 rounded">
                      <p className="text-red-800">{debugInfo.error}</p>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t">
                  <h4 className="font-semibold korean-text mb-2">📝 해결 방법</h4>
                  <ul className="space-y-1 text-gray-600 korean-text">
                    <li>• Supabase 프로젝트의 Authentication → Settings 확인</li>
                    <li>• Site URL이 현재 도메인과 일치하는지 확인</li>
                    <li>• Redirect URLs에 비밀번호 재설정 페이지 추가</li>
                    <li>• 이메일 템플릿이 활성화되어 있는지 확인</li>
                    <li>• 사용자가 실제로 가입되어 있는지 확인</li>
                  </ul>
                </div>

                <div className="text-xs text-gray-500">
                  <p>진단 시간: {debugInfo.timestamp}</p>
                  <p>브라우저 콘솔에서 더 자세한 로그를 확인할 수 있습니다.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 