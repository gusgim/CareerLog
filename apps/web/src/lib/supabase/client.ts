import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // 디버깅: 환경 변수 확인
  console.log('🔍 Environment Variables Check:')
  console.log('URL:', supabaseUrl)
  console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'undefined')

  // 환경 변수가 없거나 placeholder 값인 경우
  if (!supabaseUrl || !supabaseKey || 
      supabaseUrl.includes('demo') || supabaseUrl.includes('placeholder') ||
      supabaseKey.includes('demo') || supabaseKey.includes('placeholder')) {
    
    console.warn('❌ Supabase 환경 변수가 올바르게 설정되지 않았습니다.')
    console.warn('📝 Vercel 환경 변수를 다시 확인해주세요:')
    console.warn('   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co')
    console.warn('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key')
    
    // 개발 모드로 전환
    console.warn('⚠️  개발 모드로 전환합니다. 실제 인증은 동작하지 않습니다.')
    return createBrowserClient(
      'https://localhost-fallback.supabase.co',
      'localhost-fallback-key'
    )
  }

  try {
    console.log('✅ Supabase 클라이언트 초기화 성공')
    return createBrowserClient(supabaseUrl, supabaseKey)
  } catch (error) {
    console.error('❌ Supabase 클라이언트 초기화 실패:', error)
    console.warn('⚠️  Fallback 모드로 전환합니다.')
    return createBrowserClient(
      'https://localhost-fallback.supabase.co',
      'localhost-fallback-key'
    )
  }
}

export const supabase = createClient() 