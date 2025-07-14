-- ============================================
-- 프로덕션 데이터베이스 완전 초기화 스크립트
-- ============================================

-- 1단계: 모든 더미 데이터 삭제
SELECT '=== 더미 데이터 완전 삭제 시작 ===' as status;

-- 더미 로그들 삭제
DELETE FROM logs WHERE id IS NOT NULL;
SELECT '✅ 모든 로그 데이터 삭제 완료' as status;

-- 더미 프로필들 삭제 (관리자 제외)
DELETE FROM profiles WHERE is_admin = false OR is_admin IS NULL;
SELECT '✅ 더미 사용자 프로필 삭제 완료' as status;

-- 더미 관리자 계정들 삭제 (admin@careerlog.demo 포함)
DELETE FROM profiles WHERE email IN ('admin@careerlog.demo') OR employee_id = 'ADMIN001';
SELECT '✅ 더미 관리자 계정 삭제 완료' as status;

-- auth.users에서 더미 계정들 삭제
DELETE FROM auth.users WHERE email = 'admin@careerlog.demo';
SELECT '✅ auth.users 더미 계정 삭제 완료' as status;

-- 2단계: 기존 RLS 정책들 정리
SELECT '=== RLS 정책 정리 ===' as status;

-- 임시로 추가한 관리자 정책들 삭제
DROP POLICY IF EXISTS "admin_full_access_profiles" ON profiles;
DROP POLICY IF EXISTS "admin_full_access_logs" ON logs;
SELECT '✅ 임시 관리자 정책 제거 완료' as status;

-- 3단계: 기본 RLS 정책 재설정 (보안 강화)
SELECT '=== 기본 RLS 정책 재설정 ===' as status;

-- profiles 테이블 기본 정책
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- logs 테이블 기본 정책
CREATE POLICY "Users can view own logs" ON logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs" ON logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs" ON logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs" ON logs
    FOR DELETE USING (auth.uid() = user_id);

SELECT '✅ 기본 RLS 정책 재설정 완료' as status;

-- 4단계: 관리자 전용 정책 추가 (프로덕션용)
SELECT '=== 프로덕션 관리자 정책 설정 ===' as status;

-- 관리자는 모든 데이터 접근 가능 (is_admin = true인 사용자만)
CREATE POLICY "Admin full access to profiles" ON profiles
    FOR ALL USING (
        auth.uid() = id OR 
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.is_admin = true
        )
    );

CREATE POLICY "Admin full access to logs" ON logs
    FOR ALL USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.is_admin = true
        )
    );

SELECT '✅ 프로덕션 관리자 정책 설정 완료' as status;

-- 5단계: 카테고리 데이터 확인 및 정리
SELECT '=== 카테고리 데이터 정리 ===' as status;

-- 기본 카테고리만 유지
DELETE FROM categories WHERE id NOT IN (
    'clinical', 'education', 'research', 'administrative', 'personal', 'quality'
);

-- 기본 카테고리 재삽입 (존재하지 않는 경우)
INSERT INTO categories (id, name, description, color, icon, created_at, updated_at)
VALUES 
    ('clinical', '임상 활동', '환자 진료 및 임상 업무', '#ef4444', 'Stethoscope', NOW(), NOW()),
    ('education', '교육 활동', '교육 및 훈련 관련 활동', '#3b82f6', 'GraduationCap', NOW(), NOW()),
    ('research', '연구 활동', '연구 및 학술 활동', '#8b5cf6', 'FlaskConical', NOW(), NOW()),
    ('administrative', '행정 업무', '행정 및 관리 업무', '#f59e0b', 'FileText', NOW(), NOW()),
    ('personal', '개인 개발', '개인적 성장 및 개발', '#10b981', 'User', NOW(), NOW()),
    ('quality', '질 향상', '의료 질 향상 활동', '#f97316', 'TrendingUp', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

SELECT '✅ 카테고리 데이터 정리 완료' as status;

-- 6단계: 최종 확인
SELECT '=== 최종 상태 확인 ===' as status;

SELECT 
    '사용자' as category,
    COUNT(*) as total_count
FROM auth.users;

SELECT 
    '프로필' as category,
    COUNT(*) as total_count,
    COUNT(CASE WHEN is_admin = true THEN 1 END) as admin_count
FROM profiles;

SELECT 
    '로그' as category,
    COUNT(*) as total_count
FROM logs;

SELECT 
    '카테고리' as category,
    COUNT(*) as total_count
FROM categories;

SELECT '=== 데이터베이스 초기화 완료! ===' as status;
SELECT '이제 완전히 깨끗한 프로덕션 환경입니다.' as message; 