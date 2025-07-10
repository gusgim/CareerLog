import { createBrowserClient } from '@supabase/ssr'

// 개발 환경에서 사용할 기본값 (실제 프로덕션에서는 실제 값으로 교체 필요)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // 개발 모드: 환경 변수가 없으면 모의 값 사용
  if (!supabaseUrl || !supabaseKey) {
    console.warn('🔧 개발 모드: Supabase 환경 변수가 설정되지 않았습니다.')
    console.warn('📝 실제 배포를 위해서는 다음 환경 변수를 설정하세요:')
    console.warn('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url')
    console.warn('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
    console.warn('💡 현재는 개발 모드로 동작합니다.')
    
    // 모의 값으로 클라이언트 생성 (실제 요청은 안 됨)
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-key'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}

export const supabase = createClient()

// 개발 환경에서 환경 변수 확인 (실제 배포 시 수정 필요) 