"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Mail, RefreshCw, CheckCircle, ArrowLeft, Loader2 } from "lucide-react"
import { Suspense } from "react"

function VerifyEmailContent() {
  const [email, setEmail] = useState("")
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // URL에서 이메일 파라미터 가져오기
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  useEffect(() => {
    // 쿨다운 타이머
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        title: "이메일 주소 필요",
        description: "이메일 주소를 확인할 수 없습니다.",
        variant: "destructive",
      })
      return
    }

    setResending(true)
    
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) {
        toast({
          title: "재발송 실패",
          description: error.message || "이메일 재발송에 실패했습니다.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "이메일 재발송 완료! 📧",
          description: "새로운 인증 이메일을 발송했습니다. 이메일을 확인해주세요.",
          variant: "success",
        })
        setCooldown(60) // 60초 쿨다운
      }
    } catch (error) {
      toast({
        title: "재발송 오류",
        description: "예상치 못한 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setResending(false)
    }
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
            <Mail className="text-2xl font-bold text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white korean-text">
              이메일 인증
            </h1>
            <p className="text-white/90 korean-text">
              가입을 완료하려면 이메일을 확인해주세요
            </p>
          </div>
        </div>

        {/* 인증 안내 카드 */}
        <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-1 pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-semibold korean-text">
              가입 신청 완료!
            </CardTitle>
            <CardDescription className="korean-text">
              인증 이메일을 발송했습니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700 korean-text">
                  <strong>{email || "입력하신 이메일"}</strong>로<br />
                  인증 링크를 발송했습니다.
                </p>
              </div>

              <div className="space-y-2 text-sm text-gray-600 korean-text">
                <p>📧 이메일을 확인하고 인증 링크를 클릭해주세요.</p>
                <p>🔍 스팸 폴더도 확인해보세요.</p>
                <p>⏱️ 인증 링크는 24시간 동안 유효합니다.</p>
              </div>
            </div>

            {/* 재발송 버튼 */}
            <div className="space-y-4">
              <Button
                onClick={handleResendEmail}
                variant="outline"
                className="w-full h-12 korean-text"
                disabled={resending || cooldown > 0}
              >
                {resending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    재발송 중...
                  </>
                ) : cooldown > 0 ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {cooldown}초 후 재발송 가능
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    인증 이메일 재발송
                  </>
                )}
              </Button>

              <div className="text-center">
                <Link href="/" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 korean-text">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  로그인 페이지로 돌아가기
                </Link>
              </div>
            </div>

            {/* 도움말 */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-700 korean-text mb-2">이메일이 오지 않나요?</h4>
              <ul className="text-sm text-gray-600 space-y-1 korean-text">
                <li>• 스팸/정크 메일함을 확인해보세요</li>
                <li>• 이메일 주소가 정확한지 확인해보세요</li>
                <li>• 위의 "재발송" 버튼을 눌러보세요</li>
                <li>• 문제가 지속되면 관리자에게 문의하세요</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">페이지를 로딩하는 중...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
} 