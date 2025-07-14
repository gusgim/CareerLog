-- =====================================
-- admin@careerlog.demo 계정 비밀번호 설정 스크립트
-- =====================================
-- 비밀번호: admin123!

DO $$
DECLARE
    admin_user_id UUID;
    hashed_password TEXT;
BEGIN
    -- admin@careerlog.demo 사용자 ID 찾기
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@careerlog.demo';
    
    IF admin_user_id IS NULL THEN
        RAISE NOTICE '❌ admin@careerlog.demo 계정을 찾을 수 없습니다.';
        RETURN;
    END IF;
    
    -- 비밀번호 해시 생성 (admin123!)
    -- Supabase에서 사용하는 bcrypt 해시
    hashed_password := '$2a$10$8K1p/a0dhrxiH8Kobt8je.Zvy.xUrOVvq/5c8Ef8Ek6QoHI6g.Sq2';
    
    -- auth.users 테이블 업데이트
    UPDATE auth.users 
    SET 
        encrypted_password = hashed_password,
        email_confirmed_at = NOW(),
        phone_confirmed_at = NOW(),
        confirmed_at = NOW(),
        email_change_confirm_status = 0,
        updated_at = NOW(),
        -- 추가 auth 관련 필드들
        aud = 'authenticated',
        role = 'authenticated'
    WHERE id = admin_user_id;
    
    RAISE NOTICE '✅ admin@careerlog.demo 계정 비밀번호가 설정되었습니다.';
    RAISE NOTICE '📧 이메일: admin@careerlog.demo';
    RAISE NOTICE '🔑 비밀번호: admin123!';
    
END $$; 