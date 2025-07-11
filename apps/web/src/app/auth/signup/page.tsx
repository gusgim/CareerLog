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
import { Loader2 } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 입력 값 검증
    if (!fullName.trim()) {
      toast({
        title: "⚠️ 이름을 입력해주세요",
        description: "회원가입을 위해 이름은 필수 정보입니다.",
        variant: "destructive",
        duration: 4000,
      })
      return
    }

    if (!email.trim()) {
      toast({
        title: "⚠️ 이메일을 입력해주세요",
        description: "로그인에 사용할 이메일 주소를 입력해주세요.",
        variant: "destructive",
        duration: 4000,
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "🔐 비밀번호가 일치하지 않습니다",
        description: "비밀번호와 비밀번호 확인이 같은지 다시 확인해주세요.",
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "🔒 비밀번호가 너무 짧습니다",
        description: "보안을 위해 비밀번호는 최소 6자 이상 입력해주세요.",
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await signUp(email, password, { full_name: fullName })

      if (error) {
        // 회원가입 실패 알림
        toast({
          title: "🚫 회원가입에 실패했습니다",
          description: error.includes("already") 
            ? "이미 사용 중인 이메일입니다. 다른 이메일을 시도하거나 로그인해주세요."
            : error || "입력 정보를 확인하고 다시 시도해주세요.",
          variant: "destructive",
          duration: 6000,
        })
        setLoading(false)
      } else {
        // 회원가입 성공 알림
        toast({
          title: "🎉 회원가입 신청이 완료되었습니다!",
          description: "이메일로 발송된 인증 링크를 클릭하여 계정을 활성화해주세요.",
          variant: "success",
          duration: 4000,
        })
        
        // 이메일 인증 페이지로 리다이렉트
        setTimeout(() => {
          router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
        }, 3000)
      }
    } catch (err) {
      // 시스템 오류 알림
      toast({
        title: "⚠️ 시스템 오류가 발생했습니다",
        description: "네트워크 연결을 확인하고 잠시 후 다시 시도해주세요. 문제가 지속되면 관리자에게 문의하세요.",
        variant: "destructive",
        duration: 7000,
      })
      setLoading(false)
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
              CareerLog
            </h1>
            <p className="text-white/90 korean-text">
              소중한 생명을 구하는 의료진들을 위한 커리어관리 플랫폼
            </p>
          </div>
        </div>

        {/* 회원가입 폼 */}
        <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold korean-text">
              회원가입
            </CardTitle>
            <CardDescription className="korean-text">
              CareerLog과 함께 경력 관리를 시작하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="korean-text font-medium">
                  이름
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="홍길동"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-12 text-base"
                />
              </div>

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
                  placeholder="6자 이상 입력해주세요"
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
                  placeholder="비밀번호를 다시 입력해주세요"
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
                    가입 중...
                  </>
                ) : (
                  "회원가입"
                )}
              </Button>
            </form>

            {/* 로그인 링크 */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300 korean-text">
                이미 계정이 있으신가요?{" "}
                <Link
                  href="/"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  로그인
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 보안 안내 */}
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 korean-text">
            회원가입과 동시에 개인정보처리방침과 이용약관에 동의합니다.
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-400 dark:text-gray-500">
            <span>🔐 SSL 암호화</span>
            <span>•</span>
            <span>🛡️ 개인정보 보호</span>
            <span>•</span>
            <span>🔒 안전한 저장</span>
          </div>
        </div>
      </div>
    </div>
  )
} 