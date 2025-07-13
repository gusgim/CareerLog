-- =====================================
-- 데모용 더미 데이터 정리 스크립트
-- =====================================
-- ⚠️ 주의: 이 스크립트는 데모용 계정과 관련 데이터를 모두 삭제합니다!
-- 실제 운영 데이터가 있는 환경에서는 주의하여 사용하세요.

-- 1. 종속 데이터부터 삭제 (외래키 제약 고려)
DELETE FROM public.reports WHERE user_id IN (
    SELECT id FROM auth.users WHERE email LIKE '%@careerlog.demo'
);

DELETE FROM public.logs WHERE user_id IN (
    SELECT id FROM auth.users WHERE email LIKE '%@careerlog.demo'
);

DELETE FROM public.duty_schedules WHERE user_id IN (
    SELECT id FROM auth.users WHERE email LIKE '%@careerlog.demo'
) OR created_by IN (
    SELECT id FROM auth.users WHERE email LIKE '%@careerlog.demo'
);

DELETE FROM public.staff_qualifications WHERE user_id IN (
    SELECT id FROM auth.users WHERE email LIKE '%@careerlog.demo'
);

-- 2. 프로필 데이터 삭제
DELETE FROM public.profiles WHERE id IN (
    SELECT id FROM auth.users WHERE email LIKE '%@careerlog.demo'
);

-- 3. 인증 사용자 삭제
DELETE FROM auth.users WHERE email LIKE '%@careerlog.demo';

-- 4. 기본 데이터 삭제 (필요한 경우)
DELETE FROM public.qualifications;
DELETE FROM public.duty_types;
DELETE FROM public.operating_rooms;
DELETE FROM public.categories;

-- 5. 시퀀스 리셋 (ID를 1부터 다시 시작)
ALTER SEQUENCE IF EXISTS public.operating_rooms_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.duty_types_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.qualifications_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.staff_qualifications_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.duty_schedules_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.logs_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.categories_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.reports_id_seq RESTART WITH 1;

-- 6. 정리 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '데모 데이터 정리 완료!';
    RAISE NOTICE '- 모든 @careerlog.demo 계정 삭제';
    RAISE NOTICE '- 관련 활동 로그 및 스케줄 삭제';
    RAISE NOTICE '- 기본 설정 데이터 초기화';
    RAISE NOTICE '- 시퀀스 ID 리셋 완료';
    RAISE NOTICE '';
    RAISE NOTICE '이제 seed-demo-data.sql을 실행하여 새로운 더미 데이터를 생성할 수 있습니다.';
END $$; 