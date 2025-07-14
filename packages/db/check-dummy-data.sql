-- =====================================
-- 더미 데이터 확인 스크립트
-- =====================================
-- production DB에 더미 데이터가 제대로 들어갔는지 확인

-- 1. 전체 사용자 수 확인
SELECT 
    'Total Users' as check_item,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) >= 77 THEN '✅ 더미 데이터 존재'
        ELSE '❌ 더미 데이터 부족'
    END as status
FROM public.profiles;

-- 2. 관리자 계정 확인
SELECT 
    'Admin Account' as check_item,
    email,
    full_name,
    is_admin,
    CASE 
        WHEN email = 'admin@careerlog.demo' AND is_admin = true THEN '✅ 관리자 계정 존재'
        ELSE '❌ 관리자 계정 문제'
    END as status
FROM public.profiles 
WHERE email = 'admin@careerlog.demo' OR is_admin = true;

-- 3. 활동 로그 수 확인
SELECT 
    'Activity Logs' as check_item,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) >= 15000 THEN '✅ 충분한 로그 데이터'
        WHEN COUNT(*) >= 1000 THEN '⚠️ 일부 로그 데이터'
        ELSE '❌ 로그 데이터 부족'
    END as status
FROM public.logs;

-- 4. 카테고리 데이터 확인
SELECT 
    'Categories' as check_item,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) >= 4 THEN '✅ 카테고리 설정됨'
        ELSE '❌ 카테고리 부족'
    END as status
FROM public.categories;

-- 5. 수술실 데이터 확인
SELECT 
    'Operating Rooms' as check_item,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) >= 10 THEN '✅ 수술실 설정됨'
        ELSE '❌ 수술실 데이터 부족'
    END as status
FROM public.operating_rooms;

-- 6. 최근 활동 로그 확인 (최근 30일)
SELECT 
    'Recent Logs (30 days)' as check_item,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ 최근 활동 있음'
        ELSE '❌ 최근 활동 없음'
    END as status
FROM public.logs 
WHERE created_at >= NOW() - INTERVAL '30 days';

-- 7. Auth 사용자 확인 
SELECT 
    'Auth Users' as check_item,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) >= 77 THEN '✅ Auth 사용자 존재'
        ELSE '❌ Auth 사용자 부족'
    END as status
FROM auth.users;

-- 8. admin@careerlog.demo 계정 상세 확인
SELECT 
    'Admin Auth Status' as check_item,
    email,
    CASE 
        WHEN encrypted_password IS NOT NULL THEN '✅ 비밀번호 설정됨'
        ELSE '❌ 비밀번호 미설정'
    END as password_status,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ 이메일 확인됨'
        ELSE '❌ 이메일 미확인'
    END as email_status
FROM auth.users 
WHERE email = 'admin@careerlog.demo'; 