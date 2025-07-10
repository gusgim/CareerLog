"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Shield, Lock, ArrowLeft } from "lucide-react"

export default function CreateAdminPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [adminLevel, setAdminLevel] = useState("admin")
  const [loading, setLoading] = useState(false)
  
  const { createAdminAccount, user, isAdmin } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // 권한 확인 - 관리자만 접근 가능
  useEffect(() => {
    if (!user || !isAdmin) {
      router.push("/dashboard")
      return
    }
  }, [user, isAdmin, router])

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
        admin_level: adminLevel
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
          title: "✅ 관리자 계정 생성 완료!",
          description: `${fullName}님의 관리자 계정이 성공적으로 생성되었습니다.`,
          variant: "success",
          duration: 5000,
        })
        
        // 폼 초기화
        setEmail("")
        setPassword("")
        setConfirmPassword("")
        setFullName("")
        setAdminLevel("admin")
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

  // 관리자가 아닌 경우 로딩 상태 표시
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="korean-text">권한을 확인하는 중...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* 헤더 */}
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="korean-text">돌아가기</span>
          </Button>
        </div>

        {/* 관리자 계정 생성 폼 */}
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold korean-text text-gray-900">
                관리자 계정 생성
              </CardTitle>
              <CardDescription className="korean-text text-lg">
                새로운 관리자 계정을 생성합니다
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 이름 */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="korean-text font-medium text-gray-700">
                  관리자 이름 *
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="김관리자"
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

              {/* 관리자 등급 */}
              <div className="space-y-2">
                <Label htmlFor="adminLevel" className="korean-text font-medium text-gray-700">
                  관리자 등급
                </Label>
                <Select value={adminLevel} onValueChange={setAdminLevel}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="관리자 등급을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super" className="korean-text">
                      🔴 최고 관리자 (모든 권한)
                    </SelectItem>
                    <SelectItem value="admin" className="korean-text">
                      🟡 일반 관리자 (제한적 권한)
                    </SelectItem>
                    <SelectItem value="moderator" className="korean-text">
                      🟢 운영자 (기본 권한)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 비밀번호 */}
              <div className="space-y-2">
                <Label htmlFor="password" className="korean-text font-medium text-gray-700">
                  비밀번호 *
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="최소 6자 이상"
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
                className="w-full h-14 text-lg font-semibold korean-text bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    관리자 계정 생성 중...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    관리자 계정 생성
                  </>
                )}
              </Button>
            </form>

            {/* 주의사항 */}
            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="korean-text font-semibold text-amber-800 mb-2 flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                관리자 계정 생성 주의사항
              </h3>
              <ul className="text-sm text-amber-700 korean-text space-y-1">
                <li>• 관리자 계정은 시스템의 핵심 기능에 접근할 수 있습니다</li>
                <li>• 생성된 계정의 권한 관리에 각별히 주의하세요</li>
                <li>• 강력한 비밀번호를 사용하고 정기적으로 변경하세요</li>
                <li>• 불필요한 관리자 계정은 즉시 삭제하세요</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 