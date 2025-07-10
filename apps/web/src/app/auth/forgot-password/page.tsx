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
import { Loader2, ArrowLeft, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { resetPassword } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

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
          duration: 5000,
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
      </div>
    </div>
  )
} 