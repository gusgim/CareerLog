"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Shield, Crown, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SetupAdminPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  
  const { createAdminAccount } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // 🔒 보안 검사: 특정 조건에서만 접근 허용
  useEffect(() => {
    const isAccessAllowed = process.env.NODE_ENV === 'development' || 
                           process.env.NEXT_PUBLIC_ENABLE_ADMIN_SETUP === 'true'
    
    if (!isAccessAllowed) {
      toast({
        title: "🚫 접근 거부",
        description: "관리자 계정 생성 기능이 비활성화되어 있습니다.",
        variant: "destructive",
        duration: 5000,
      })
      router.push("/")
      return
    }
  }, [router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 비밀번호 확인
    if (password !== confirmPassword) {
      toast({
        title: "❌ 비밀번호 불일치",
        description: "비밀번호와 비밀번호 확인이 일치하지 않습니다.",
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "❌ 비밀번호 오류",
        description: "비밀번호는 최소 6자 이상이어야 합니다.",
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await createAdminAccount(email, password, {
        full_name: fullName,
        admin_level: "super" // 첫 번째 관리자는 최고 관리자로 설정
      })

      if (error) {
        toast({
          title: "❌ 관리자 계정 생성 실패",
          description: error,
          variant: "destructive",
          duration: 5000,
        })
      } else {
        toast({
          title: "🎉 최고 관리자 계정 생성 완료!",
          description: `${fullName}님, CareerLog의 첫 번째 관리자가 되신 것을 축하합니다!`,
          variant: "success",
          duration: 6000,
        })
        
        // 관리자 로그인 후 대시보드로 이동
        setTimeout(() => {
          router.push("/dashboard")
        }, 3000)
      }
    } catch (error) {
      toast({
        title: "❌ 시스템 오류",
        description: "관리자 계정 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
        duration: 5000,
      })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* 헤더 */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/">
            <Button
              variant="ghost"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="korean-text">로그인으로 돌아가기</span>
            </Button>
          </Link>
        </div>

        {/* 초기 관리자 설정 폼 */}
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex items-center justify-center w-20 h-20 mx-auto bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg">
              <Crown className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-3">
              <CardTitle className="text-3xl font-bold korean-text text-gray-900">
                🎉 CareerLog 초기 설정
              </CardTitle>
              <CardDescription className="korean-text text-lg">
                시스템의 첫 번째 최고 관리자 계정을 생성합니다
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* 안내 메시지 */}
            <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
              <h3 className="korean-text font-semibold text-purple-800 mb-3 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                최고 관리자 권한
              </h3>
              <ul className="text-sm text-purple-700 korean-text space-y-2">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">👑</span>
                  <span>모든 시스템 기능에 대한 완전한 접근 권한</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">🔐</span>
                  <span>다른 관리자 계정 생성 및 관리</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">📊</span>
                  <span>전체 사용자 데이터 및 통계 관리</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">⚙️</span>
                  <span>시스템 설정 및 구성 변경</span>
                </li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 이름 */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="korean-text font-medium text-gray-700">
                  관리자 이름 *
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="김최고"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-12 text-base"
                />
              </div>

              {/* 이메일 */}
              <div className="space-y-2">
                <Label htmlFor="email" className="korean-text font-medium text-gray-700">
                  이메일 주소 *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@careerlog.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-base"
                />
              </div>

              {/* 비밀번호 */}
              <div className="space-y-2">
                <Label htmlFor="password" className="korean-text font-medium text-gray-700">
                  비밀번호 *
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="최소 6자 이상의 강력한 비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 text-base"
                />
              </div>

              {/* 비밀번호 확인 */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="korean-text font-medium text-gray-700">
                  비밀번호 확인 *
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

              {/* 생성 버튼 */}
              <Button
                type="submit"
                className="w-full h-14 text-lg font-semibold korean-text bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    최고 관리자 계정 생성 중...
                  </>
                ) : (
                  <>
                    <Crown className="mr-2 h-5 w-5" />
                    최고 관리자 계정 생성하기
                  </>
                )}
              </Button>
            </form>

            {/* 보안 주의사항 */}
            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="korean-text font-semibold text-red-800 mb-2 flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                보안 주의사항
              </h3>
              <ul className="text-sm text-red-700 korean-text space-y-1">
                <li>• 이 계정은 시스템의 모든 기능에 접근할 수 있습니다</li>
                <li>• 강력한 비밀번호를 사용하고 안전하게 보관하세요</li>
                <li>• 계정 정보를 다른 사람과 공유하지 마세요</li>
                <li>• 정기적으로 비밀번호를 변경하세요</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 