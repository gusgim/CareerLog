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
  resetPassword: (email: string) => Promise<{ error?: string }>
  updatePassword: (password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const getSession = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        
        // Check admin status
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single()
          
          setIsAdmin(profile?.is_admin || false)
        }
      } catch (error) {
        console.error('Session check error:', error)
        setUser(null)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('is_admin')
              .eq('id', session.user.id)
              .single()
            
            setIsAdmin(profile?.is_admin || false)
          } catch (error) {
            console.error('Admin check error:', error)
            setIsAdmin(false)
          }
        } else {
          setIsAdmin(false)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
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
      console.error('Sign in error:', error)
      return { error: "로그인 중 오류가 발생했습니다." }
    }
  }

  const signUp = async (email: string, password: string, userData?: { full_name?: string }) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
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
      console.error('Sign up error:', error)
      return { error: "회원가입 중 오류가 발생했습니다." }
    }
  }

  const createAdminAccount = async (email: string, password: string, adminData: { full_name: string, admin_level?: string }) => {
    try {
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
        return { error: error.message }
      }

      return {}
    } catch (error) {
      console.error('Create admin error:', error)
      return { error: "관리자 계정 생성 중 오류가 발생했습니다." }
    }
  }

  const resendVerificationEmail = async (email: string) => {
    try {
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
      console.error('Resend email error:', error)
      return { error: "이메일 재발송 중 오류가 발생했습니다." }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        if (error.message.includes('User not found')) {
          return { error: "해당 이메일로 가입된 계정을 찾을 수 없습니다." }
        }
        return { error: error.message }
      }

      return {}
    } catch (error) {
      console.error('Reset password error:', error)
      return { error: "비밀번호 재설정 중 오류가 발생했습니다." }
    }
  }

  const updatePassword = async (password: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      console.error('Update password error:', error)
      return { error: "비밀번호 업데이트 중 오류가 발생했습니다." }
    }
  }

  const signOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      setUser(null)
      setIsAdmin(false)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const value = {
    user,
    loading,
    isAdmin,
    signIn,
    signUp,
    createAdminAccount,
    resendVerificationEmail,
    resetPassword,
    updatePassword,
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