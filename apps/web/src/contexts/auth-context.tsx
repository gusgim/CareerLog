"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { type User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, userData?: { full_name?: string }) => Promise<{ error?: string }>
  createAdminAccount: (email: string, password: string, adminData: { full_name: string, admin_level?: string }) => Promise<{ error?: string }>
  resendVerificationEmail: (email: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false)

  useEffect(() => {
    // 환경 변수 확인 및 개발 모드 설정
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    const isDevMode = !supabaseUrl || !supabaseKey || 
                     supabaseUrl.includes('your_supabase_url_here') || 
                     supabaseKey.includes('your_supabase_anon_key_here')

    setIsDevelopmentMode(isDevMode)

    // 최대 로딩 시간 제한 (3초)
    const maxLoadingTimeout = setTimeout(() => {
      console.log('⏰ 최대 로딩 시간 초과, 강제로 로딩 상태 해제')
      setLoading(false)
    }, 3000)

    // 초기 세션 확인
    const getSession = async () => {
      if (isDevMode) {
        // 개발 모드: 로컬 스토리지에서 모의 세션 확인 (즉시 처리)
        console.log('🔧 개발 모드: 로컬 스토리지에서 세션 확인')
        const devSession = localStorage.getItem('dev-user-session')
        if (devSession) {
          try {
            const mockUser = JSON.parse(devSession)
            setUser(mockUser)
            console.log('개발 모드: 저장된 세션 복원', mockUser)
          } catch (e) {
            console.error('개발 모드 세션 파싱 에러:', e)
          }
        }
        clearTimeout(maxLoadingTimeout)
        setLoading(false)
        return
      }

      // 실제 Supabase 모드
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('세션 확인 에러:', error)
        // Supabase 연결 실패 시 개발 모드로 전환
        setIsDevelopmentMode(true)
        const devSession = localStorage.getItem('dev-user-session')
        if (devSession) {
          try {
            const mockUser = JSON.parse(devSession)
            setUser(mockUser)
            console.log('개발 모드로 전환: 저장된 세션 복원', mockUser)
          } catch (e) {
            console.error('개발 모드 세션 파싱 에러:', e)
          }
        }
      }
      clearTimeout(maxLoadingTimeout)
      setLoading(false)
    }

    getSession()

    // 실제 Supabase 모드에서만 인증 상태 변화 감지
    if (!isDevMode) {
      const supabase = createClient()
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      )

      return () => {
        clearTimeout(maxLoadingTimeout)
        subscription.unsubscribe()
      }
    }

    return () => clearTimeout(maxLoadingTimeout)
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      // 환경 변수 확인
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      // 개발 모드: 실제 Supabase 없이 테스트
      if (!supabaseUrl || !supabaseKey || 
          supabaseUrl.includes('your_supabase_url_here') || 
          supabaseKey.includes('your_supabase_anon_key_here')) {
        
        const mockUser = {
          id: 'dev-user-' + Date.now(),
          email,
          user_metadata: { full_name: '개발자' }
        }
        
        localStorage.setItem('dev-user-session', JSON.stringify(mockUser))
        setUser(mockUser as any)
        
        return {}
      }

      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // 더 구체적인 에러 메시지 제공
        if (error.message.includes('Invalid login credentials')) {
          return { error: "이메일 또는 비밀번호가 잘못되었습니다." }
        }
        if (error.message.includes('Email not confirmed')) {
          return { error: "이메일 인증을 완료해주세요." }
        }
        return { error: error.message }
      }

      return {}
    } catch (error) {
      console.error('로그인 상세 에러:', error)
      
      // 네트워크 에러 확인
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return { 
          error: "네트워크 연결을 확인해주세요. Supabase 환경 변수가 올바르게 설정되어 있는지 확인하세요." 
        }
      }
      
      return { error: "로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." }
    }
  }

  const signUp = async (email: string, password: string, userData?: { full_name?: string }) => {
    try {
      // 환경 변수 확인
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      // 개발 모드: 실제 Supabase 없이 테스트
      if (!supabaseUrl || !supabaseKey || 
          supabaseUrl.includes('your_supabase_url_here') || 
          supabaseKey.includes('your_supabase_anon_key_here')) {
        
        const mockUser = {
          id: 'dev-user-' + Date.now(),
          email,
          user_metadata: userData || {}
        }
        
        localStorage.setItem('dev-user-session', JSON.stringify(mockUser))
        setUser(mockUser as any)
        
        return {}
      }

      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      })

      if (error) {
        // 더 구체적인 에러 메시지 제공
        if (error.message.includes('Invalid email')) {
          return { error: "올바른 이메일 주소를 입력해주세요." }
        }
        if (error.message.includes('Password')) {
          return { error: "비밀번호는 6자 이상이어야 합니다." }
        }
        if (error.message.includes('User already registered')) {
          return { error: "이미 가입된 이메일입니다. 로그인을 시도해주세요." }
        }
        return { error: error.message }
      }

      return {}
    } catch (error) {
      console.error('회원가입 상세 에러:', error)
      
      // 네트워크 에러 확인
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return { 
          error: "네트워크 연결을 확인해주세요. Supabase 환경 변수가 올바르게 설정되어 있는지 확인하세요." 
        }
      }
      
      return { error: "회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." }
    }
  }

  const createAdminAccount = async (email: string, password: string, adminData: { full_name: string, admin_level?: string }) => {
    try {
      // 환경 변수 확인
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      // 개발 모드: 실제 Supabase 없이 테스트
      if (!supabaseUrl || !supabaseKey || 
          supabaseUrl.includes('your_supabase_url_here') || 
          supabaseKey.includes('your_supabase_anon_key_here')) {
        
        const mockAdminUser = {
          id: 'admin-user-' + Date.now(),
          email,
          user_metadata: {
            ...adminData,
            role: 'admin',
            admin_level: adminData.admin_level || 'super'
          }
        }
        
        localStorage.setItem('dev-user-session', JSON.stringify(mockAdminUser))
        setUser(mockAdminUser as any)
        
        return {}
      }

      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...adminData,
            role: 'admin',
            admin_level: adminData.admin_level || 'super'
          },
        },
      })

      if (error) {
        if (error.message.includes('Invalid email')) {
          return { error: "올바른 이메일 주소를 입력해주세요." }
        }
        if (error.message.includes('Password')) {
          return { error: "비밀번호는 6자 이상이어야 합니다." }
        }
        if (error.message.includes('User already registered')) {
          return { error: "이미 가입된 이메일입니다." }
        }
        return { error: error.message }
      }

      return {}
    } catch (error) {
      console.error('관리자 계정 생성 에러:', error)
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return { 
          error: "네트워크 연결을 확인해주세요. Supabase 환경 변수가 올바르게 설정되어 있는지 확인하세요." 
        }
      }
      
      return { error: "관리자 계정 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." }
    }
  }

  const resendVerificationEmail = async (email: string) => {
    try {
      // 환경 변수 확인
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      // 개발 모드: 실제 Supabase 없이 테스트
      if (!supabaseUrl || !supabaseKey || 
          supabaseUrl.includes('your_supabase_url_here') || 
          supabaseKey.includes('your_supabase_anon_key_here')) {
        
        console.log('개발 모드: 이메일 재발송 기능은 모의 환경에서만 동작합니다.')
        return {}
      }

      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      console.error('이메일 재발송 상세 에러:', error)
      
      // 네트워크 에러 확인
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return { 
          error: "네트워크 연결을 확인해주세요. Supabase 환경 변수가 올바르게 설정되어 있는지 확인하세요." 
        }
      }
      
      return { error: "이메일 재발송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." }
    }
  }

  const signOut = async () => {
    try {
      // 개발 모드가 아닌 경우에만 Supabase 로그아웃 호출
      if (!isDevelopmentMode) {
        const supabase = createClient()
        await supabase.auth.signOut()
      }
    } catch (error) {
      console.error('로그아웃 에러:', error)
    }
    
    localStorage.removeItem('dev-user-session')
    setUser(null)
  }

  // 관리자 권한 확인
  const isAdmin = user?.user_metadata?.role === 'admin'

  const value = {
    user,
    loading,
    isAdmin,
    signIn,
    signUp,
    createAdminAccount,
    resendVerificationEmail,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 