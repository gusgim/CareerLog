"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { DemoDataValidator } from "@/components/demo-data-validator"

export default function DemoValidationPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()

  // 권한 확인 - 관리자만 접근 가능
  useEffect(() => {
    if (!user || !isAdmin) {
      router.push("/dashboard")
      return
    }
  }, [user, isAdmin, router])

  // 관리자가 아닌 경우 로딩 상태 표시
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="korean-text">권한을 확인하는 중...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/admin/system-settings">
              <Button variant="ghost" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="korean-text">시스템 설정으로 돌아가기</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <DemoDataValidator />
      </div>
    </div>
  )
} 