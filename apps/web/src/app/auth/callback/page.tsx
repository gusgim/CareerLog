"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react"
import Link from "next/link"

type VerificationStatus = "loading" | "success" | "error" | "already_verified"

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<VerificationStatus>("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = createClient()
        
        // URL에서 인증 관련 파라미터 확인
        const code = searchParams.get("code")
        const error = searchParams.get("error")
        const errorDescription = searchParams.get("error_description")

        if (error) {
          setStatus("error")
          setMessage(errorDescription || "인증 처리 중 오류가 발생했습니다.")
          return
        }

        if (code) {
          // 인증 코드를 사용하여 세션 교환
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            setStatus("error")
            setMessage(exchangeError.message || "인증 처리 중 오류가 발생했습니다.")
            return
          }

          if (data?.user) {
            // 이메일 인증 상태 확인
            if (data.user.email_confirmed_at) {
              setStatus("success")
              setMessage("이메일 인증이 완료되었습니다!")
              
              toast({
                title: "인증 성공! 🎉",
                description: "이메일 인증이 완료되어 로그인되었습니다.",
                variant: "success",
              })

              // 3초 후 대시보드로 이동
              setTimeout(() => {
                router.push("/dashboard")
              }, 3000)
            } else {
              setStatus("error")
              setMessage("이메일 인증이 아직 완료되지 않았습니다.")
            }
          } else {
            setStatus("error")
            setMessage("사용자 정보를 찾을 수 없습니다.")
          }
        } else {
          // 인증 코드가 없는 경우
          setStatus("error")
          setMessage("잘못된 인증 링크입니다.")
        }
      } catch (error) {
        console.error("Auth callback error:", error)
        setStatus("error")
        setMessage("예상치 못한 오류가 발생했습니다.")
      }
    }

    handleAuthCallback()
  }, [searchParams, router, toast])

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
      case "success":
        return <CheckCircle className="h-12 w-12 text-green-600" />
      case "error":
      case "already_verified":
        return <XCircle className="h-12 w-12 text-red-600" />
      default:
        return <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
    }
  }

  const getStatusTitle = () => {
    switch (status) {
      case "loading":
        return "인증 처리 중..."
      case "success":
        return "인증 완료!"
      case "error":
        return "인증 실패"
      case "already_verified":
        return "이미 인증됨"
      default:
        return "처리 중..."
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "text-green-600"
      case "error":
      case "already_verified":
        return "text-red-600"
      default:
        return "text-blue-600"
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
            <span className="text-2xl font-bold text-white">🏥</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white korean-text">
              CareeLog
            </h1>
            <p className="text-white/90 korean-text">
              이메일 인증 처리 중
            </p>
          </div>
        </div>

        {/* 인증 상태 카드 */}
        <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-1 pb-6">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className={`text-2xl font-semibold korean-text ${getStatusColor()}`}>
              {getStatusTitle()}
            </CardTitle>
            <CardDescription className="korean-text">
              {message || "잠시만 기다려주세요..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {status === "success" && (
              <div className="text-center space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700 korean-text">
                    🎉 환영합니다! CareeLog 회원가입이 완료되었습니다.<br />
                    곧 대시보드로 이동합니다.
                  </p>
                </div>
                
                <Button 
                  onClick={() => router.push("/dashboard")}
                  className="w-full h-12 korean-text bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  대시보드로 이동
                </Button>
              </div>
            )}

            {status === "error" && (
              <div className="text-center space-y-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-700 korean-text">
                    ❌ {message}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Link href="/auth/verify-email">
                    <Button variant="outline" className="w-full h-12 korean-text">
                      인증 이메일 재발송
                    </Button>
                  </Link>
                  
                  <Link href="/">
                    <Button variant="ghost" className="w-full h-12 korean-text">
                      로그인 페이지로 돌아가기
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {status === "loading" && (
              <div className="text-center space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700 korean-text">
                    이메일 인증을 처리하고 있습니다.<br />
                    잠시만 기다려주세요...
                  </p>
                </div>
                
                <div className="animate-pulse space-y-2">
                  <div className="h-2 bg-blue-200 rounded"></div>
                  <div className="h-2 bg-blue-200 rounded w-3/4"></div>
                  <div className="h-2 bg-blue-200 rounded w-1/2"></div>
                </div>
              </div>
            )}

            {/* 도움말 */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-700 korean-text mb-2">문제가 발생했나요?</h4>
              <ul className="text-sm text-gray-600 space-y-1 korean-text">
                <li>• 인증 링크는 24시간 동안만 유효합니다</li>
                <li>• 링크를 이미 사용했다면 새 링크를 요청하세요</li>
                <li>• 브라우저의 쿠키가 활성화되어 있는지 확인하세요</li>
                <li>• 문제가 지속되면 관리자에게 문의하세요</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 