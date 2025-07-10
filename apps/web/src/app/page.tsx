"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isLoginInProgress, setIsLoginInProgress] = useState(false)
  const { signIn, user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // 로그인된 사용자는 대시보드로 리다이렉트 (로그인 진행 중이 아닐 때만)
  useEffect(() => {
    if (isLoginInProgress || !user) return
    router.push("/dashboard")
  }, [user, router, isLoginInProgress])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setIsLoginInProgress(true) // 로그인 진행 상태 시작

    try {
      const { error } = await signIn(email, password)

      if (error) {
        toast({
          title: "❌ 로그인 실패",
          description: error || "이메일 또는 비밀번호를 확인해주세요.",
          variant: "destructive",
          duration: 5000,
        })
        setLoading(false)
        setIsLoginInProgress(false)
      } else {
        toast({
          title: "✅ 로그인 성공!",
          description: "CareeLog에 오신 것을 환영합니다! 잠시 후 대시보드로 이동합니다.",
          variant: "success",
          duration: 4000,
        })
        
        setTimeout(() => {
          setIsLoginInProgress(false)
          router.push("/dashboard")
        }, 3000)
        
        setTimeout(() => {
          setLoading(false)
        }, 2900)
      }
    } catch (error) {
      toast({
        title: "❌ 로그인 오류",
        description: "시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
        duration: 5000,
      })
      setLoading(false)
      setIsLoginInProgress(false)
    }
  }

  // 로그인 화면
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
              CareeLog
            </h1>
            <p className="text-white/90 korean-text">
              소중한 생명을 구하는 의료진들을 위한 커리어관리 플랫폼
            </p>
          </div>
        </div>

        {/* 로그인 폼 */}
        <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold korean-text">
              로그인
            </CardTitle>
            <CardDescription className="korean-text">
              이메일과 비밀번호를 입력해주세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="korean-text font-medium">
                  이메일
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="korean-text font-medium">
                  비밀번호
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                    로그인 중...
                  </>
                ) : (
                  "로그인"
                )}
              </Button>
            </form>

            {/* 회원가입 링크 */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300 korean-text">
                아직 계정이 없으신가요?{" "}
                <Link
                  href="/auth/signup"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  회원가입
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 기능 소개 */}
        <div className="grid grid-cols-1 gap-3 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <span className="text-lg">⚡</span>
            <span className="korean-text">30초 만에 빠른 활동 기록</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <span className="text-lg">📊</span>
            <span className="korean-text">전문적인 성과 보고서 생성</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <span className="text-lg">🔒</span>
            <span className="korean-text">안전한 개인 데이터 보호</span>
          </div>
        </div>

        {/* 초기 관리자 설정 링크 */}
        <div className="text-center">
          <Link href="/setup-admin">
            <Button
              variant="outline"
              size="sm"
              className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100 text-purple-700 hover:text-purple-800 transition-all duration-200"
            >
              <span className="text-lg mr-2">👑</span>
              <span className="korean-text text-sm">시스템 첫 관리자 설정</span>
            </Button>
          </Link>
          <p className="mt-2 text-xs text-white/70 korean-text">
            처음 사용하시는 경우 관리자 계정을 먼저 생성하세요
          </p>
        </div>
      </div>
    </div>
  )
} 