"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"

function ResetPasswordContent() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isValidLink, setIsValidLink] = useState<boolean | null>(null)
  const [passwordReset, setPasswordReset] = useState(false)
  const { updatePassword } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // URL에서 access_token 확인하여 링크 유효성 검사
    const accessToken = searchParams.get("access_token")
    const refreshToken = searchParams.get("refresh_token")
    
    if (accessToken && refreshToken) {
      setIsValidLink(true)
    } else {
      setIsValidLink(false)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password.trim()) {
      toast({
        title: "비밀번호 필수",
        description: "새 비밀번호를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "비밀번호 오류",
        description: "비밀번호는 6자 이상이어야 합니다.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await updatePassword(password)

      if (error) {
        toast({
          title: "❌ 비밀번호 변경 실패",
          description: error,
          variant: "destructive",
          duration: 5000,
        })
      } else {
        setPasswordReset(true)
        toast({
          title: "✅ 비밀번호 변경 완료!",
          description: "새 비밀번호로 로그인할 수 있습니다.",
          variant: "success",
          duration: 5000,
        })
      }
    } catch (error) {
      toast({
        title: "❌ 시스템 오류",
        description: "비밀번호 변경 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
        duration: 5000,
      })
    }

    setLoading(false)
  }

  // 로딩 상태
  if (isValidLink === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/login-bg.jpg')`,
          }}
        ></div>
        <div className="absolute inset-0 bg-black/30 dark:bg-black/50"></div>
        
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl relative z-10">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-sm text-gray-600 korean-text">링크 확인 중...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 유효하지 않은 링크
  if (!isValidLink) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/login-bg.jpg')`,
          }}
        ></div>
        <div className="absolute inset-0 bg-black/30 dark:bg-black/50"></div>
        
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <span className="text-2xl font-bold text-white">🏥</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white korean-text">CareerLog</h1>
            </div>
          </div>

          <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl">
            <CardHeader className="text-center space-y-1 pb-6">
              <CardTitle className="text-2xl font-semibold korean-text text-red-600">
                잘못된 링크
              </CardTitle>
              <CardDescription className="korean-text">
                비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300 korean-text">
                  링크가 만료되었거나 이미 사용된 링크일 수 있습니다.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 korean-text">
                  새로운 비밀번호 재설정을 요청해주세요.
                </p>
              </div>
              <div className="space-y-3">
                <Link href="/auth/forgot-password">
                  <Button
                    variant="default"
                    className="w-full korean-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    새로운 재설정 요청
                  </Button>
                </Link>
                <Link href="/">
                  <Button
                    variant="outline"
                    className="w-full korean-text"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    로그인 페이지로 돌아가기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/login-bg.jpg')`,
        }}
      ></div>
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50"></div>
      
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
            <span className="text-2xl font-bold text-white">🏥</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white korean-text">CareerLog</h1>
            <p className="text-white/90 korean-text">새 비밀번호 설정</p>
          </div>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold korean-text">
              {passwordReset ? "비밀번호 변경 완료" : "새 비밀번호 설정"}
            </CardTitle>
            <CardDescription className="korean-text">
              {passwordReset 
                ? "새 비밀번호로 로그인할 수 있습니다" 
                : "새로운 비밀번호를 입력해주세요"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {passwordReset ? (
              <div className="space-y-6 text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300 korean-text">
                    비밀번호가 성공적으로 변경되었습니다!
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 korean-text">
                    이제 새 비밀번호로 로그인하실 수 있습니다.
                  </p>
                </div>
                <Link href="/">
                  <Button
                    variant="default"
                    className="w-full korean-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    로그인 페이지로 이동
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="korean-text font-medium">
                    새 비밀번호
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="새 비밀번호를 입력하세요 (6자 이상)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="korean-text font-medium">
                    비밀번호 확인
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="비밀번호를 다시 입력하세요"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                      비밀번호 변경 중...
                    </>
                  ) : (
                    "비밀번호 변경"
                  )}
                </Button>

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

        {!passwordReset && (
          <div className="text-center space-y-2">
            <p className="text-sm text-white/70 korean-text">
              🔐 비밀번호는 6자 이상으로 설정해주세요
            </p>
            <p className="text-sm text-white/70 korean-text">
              🔒 안전한 비밀번호를 사용하시기 바랍니다
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
} 