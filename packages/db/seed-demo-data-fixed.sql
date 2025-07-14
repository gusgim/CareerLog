-- =====================================
-- 수정된 더미 데이터 생성 스크립트 (EXISTS 방식)
-- =====================================
-- ON CONFLICT 대신 EXISTS 조건을 사용하는 안전한 버전

-- 1. 카테고리 기본 데이터 삽입 (안전한 방식)
DO $$
BEGIN
    -- clinical 카테고리
    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'clinical') THEN
        INSERT INTO public.categories (name, name_ko, description, color, emoji, subcategories) 
        VALUES ('clinical', '근무', '일상 근무 및 수술 관련 활동', '#2563eb', '🏥', ARRAY['수술실', '외래', '회복실', '기타']);
    END IF;
    
    -- education 카테고리
    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'education') THEN
        INSERT INTO public.categories (name, name_ko, description, color, emoji, subcategories) 
        VALUES ('education', '교육', '교육 및 학습 관련 활동', '#7c3aed', '📚', ARRAY['사내교육', '사외교육', '테스트 응시']);
    END IF;
    
    -- performance 카테고리
    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'performance') THEN
        INSERT INTO public.categories (name, name_ko, description, color, emoji, subcategories) 
        VALUES ('performance', '간호성과 및 혁신추구', '성과 개선 및 혁신 활동', '#059669', '🏆', ARRAY['자율적 혁신', '임상연구', '간호사례발표', '부서자율과제', '창의학습', '즉개선', 'Self 혁신', 'SAFTY Design', '제안제도', 'PICO']);
    END IF;
    
    -- research 카테고리
    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'research') THEN
        INSERT INTO public.categories (name, name_ko, description, color, emoji, subcategories) 
        VALUES ('research', '연구', '연구 및 논문 작성 활동', '#dc2626', '🔬', ARRAY['논문 작성', '데이터 수집', '문헌 고찰', '학회 발표']);
    END IF;
    
    RAISE NOTICE '✅ 카테고리 데이터 설정 완료';
END $$;

-- 2. profiles 테이블에 누락된 컬럼 추가
DO $$
BEGIN
    -- is_admin 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'is_admin') THEN
        ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ is_admin 컬럼 추가됨';
    END IF;
    
    -- years_of_experience 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'years_of_experience') THEN
        ALTER TABLE public.profiles ADD COLUMN years_of_experience INTEGER DEFAULT 0;
        RAISE NOTICE '✅ years_of_experience 컬럼 추가됨';
    END IF;
    
    -- hire_date 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'hire_date') THEN
        ALTER TABLE public.profiles ADD COLUMN hire_date DATE DEFAULT CURRENT_DATE;
        RAISE NOTICE '✅ hire_date 컬럼 추가됨';
    END IF;
    
    -- employee_id 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'employee_id') THEN
        ALTER TABLE public.profiles ADD COLUMN employee_id TEXT;
        RAISE NOTICE '✅ employee_id 컬럼 추가됨';
    END IF;
END $$;

-- 3. 관리자 계정 생성 (안전한 방식)
DO $$
DECLARE
    admin_id UUID;
BEGIN
    -- admin@careerlog.demo 계정이 없는 경우에만 생성
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@careerlog.demo') THEN
        admin_id := gen_random_uuid();
        
        -- auth.users에 추가
        INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
        VALUES (admin_id, 'admin@careerlog.demo', NOW(), NOW(), NOW());
        
        -- profiles에 추가
        INSERT INTO public.profiles (
            id, full_name, department, role, hospital, phone, years_of_experience, 
            hire_date, employee_id, is_admin
        ) VALUES (
            admin_id, '시스템 관리자', '정보관리팀', '시스템관리자', '서울대학교병원', 
            '02-1234-5678', 10, '2014-03-01', 'ADMIN001', true
        );
        
        RAISE NOTICE '✅ admin@careerlog.demo 계정 생성 완료';
    ELSE
        -- 기존 계정이 있으면 관리자 권한만 업데이트
        UPDATE public.profiles 
        SET is_admin = true 
        WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@careerlog.demo');
        
        RAISE NOTICE '✅ admin@careerlog.demo 계정 권한 업데이트 완료';
    END IF;
END $$;

-- 4. 더미 사용자 77명 생성
DO $$
DECLARE
    user_id UUID;
    i INTEGER;
    names TEXT[] := ARRAY[
        '김민지', '이서준', '박지현', '최도윤', '정예은', '강하준', '임채원', '조시우', '윤소율', '장예준',
        '한지아', '오건우', '신다인', '문준혁', '배서연', '송민준', '류채은', '권도현', '홍지우', '전소민',
        '고준서', '남다은', '황시온', '서준호', '유채린', '노하율', '구민재', '심서윤', '변도윤', '원지호',
        '곽하은', '맹시후', '봉채영', '사준우', '복서진', '도하람', '석준혁', '선다영', '설민서', '성하준',
        '손지유', '송채원', '신도현', '안지원', '양준서', '어서연', '엄하윤', '여도윤', '연시아', '오채은',
        '우준혁', '원하율', '유시현', '윤다인', '이채린', '임도현', '장하은', '전지우', '정시온', '조예은',
        '차준서', '최하율', '한다영', '허도윤', '홍채원', '황지호', '강서연', '고하준', '권시우', '김다은',
        '남준혁', '노채영', '문하윤', '박시현', '배도현', '서지원', '손하람'
    ];
    departments TEXT[] := ARRAY['마취과', '수술실', '회복실', '중환자실', '응급실', '외래'];
    hospitals TEXT[] := ARRAY['서울대학교병원', '연세대학교병원', '성균관대학교삼성서울병원', '아산의료원', '세브란스병원'];
    roles TEXT[] := ARRAY['간호사', '마취간호사', '수술실간호사', '회복실간호사', '책임간호사'];
    start_date DATE := CURRENT_DATE - INTERVAL '2 years';
    created_count INTEGER := 0;
    
BEGIN
    -- 77명의 일반 사용자 생성
    FOR i IN 1..77 LOOP
        -- 해당 이메일이 없는 경우에만 생성
        IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'user' || i || '@careerlog.demo') THEN
            user_id := gen_random_uuid();
            
            -- auth.users 테이블에 사용자 추가
            INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
            VALUES (user_id, 'user' || i || '@careerlog.demo', NOW(), NOW(), NOW());
            
            -- profiles 테이블에 프로필 추가
            INSERT INTO public.profiles (
                id, full_name, department, role, hospital, phone, 
                years_of_experience, hire_date, employee_id, is_admin
            ) VALUES (
                user_id,
                names[i],
                departments[1 + (i % array_length(departments, 1))],
                roles[1 + (i % array_length(roles, 1))],
                hospitals[1 + (i % array_length(hospitals, 1))],
                '010-' || LPAD((1000 + i)::TEXT, 4, '0') || '-' || LPAD((5000 + i)::TEXT, 4, '0'),
                (i % 15) + 1,
                start_date + (i % 365) * INTERVAL '1 day',
                'EMP' || LPAD(i::TEXT, 3, '0'),
                false
            );
            
            created_count := created_count + 1;
        END IF;
    END LOOP;

    RAISE NOTICE '✅ 더미 사용자 %명 생성 완료', created_count;
END $$;

-- 5. 활동 로그 생성 (더미 사용자들에게만)
DO $$
DECLARE
    user_record RECORD;
    i INTEGER;
    start_date DATE := CURRENT_DATE - INTERVAL '2 years';
    log_count INTEGER := 0;
    
BEGIN
    -- 더미 사용자들 (employee_id가 EMP로 시작하는 사용자들)에게 로그 생성
    FOR user_record IN 
        SELECT id, full_name 
        FROM public.profiles 
        WHERE employee_id LIKE 'EMP%'
        LIMIT 77
    LOOP
        -- 각 사용자당 50개의 로그 생성
        FOR i IN 1..50 LOOP
            INSERT INTO public.logs (
                user_id, 
                log_date, 
                category, 
                subcategory, 
                details, 
                tags, 
                duration_hours
            ) VALUES (
                user_record.id,
                start_date + (random() * 730)::INTEGER * INTERVAL '1 day',
                (ARRAY['clinical', 'education', 'performance', 'research'])[1 + (i % 4)],
                (ARRAY['수술실', '외래', '회복실', '기타'])[1 + (i % 4)],
                '더미 활동 로그 #' || i::TEXT || ' - ' || user_record.full_name || '의 ' || 
                (ARRAY['수술 참여', '환자 간호', '교육 참석', '연구 활동'])[1 + (i % 4)],
                ARRAY['더미데이터', '테스트'],
                (1 + random() * 8)::INTEGER
            );
            
            log_count := log_count + 1;
        END LOOP;
    END LOOP;

    RAISE NOTICE '✅ 활동 로그 %개 생성 완료', log_count;
END $$;

-- 6. 최종 결과 출력
DO $$
DECLARE
    total_users INTEGER;
    admin_users INTEGER;
    dummy_users INTEGER;
    total_logs INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_users FROM public.profiles;
    SELECT COUNT(*) INTO admin_users FROM public.profiles WHERE is_admin = true;
    SELECT COUNT(*) INTO dummy_users FROM public.profiles WHERE employee_id LIKE 'EMP%';
    SELECT COUNT(*) INTO total_logs FROM public.logs;
    
    RAISE NOTICE '🎉 더미 데이터 생성 완료!';
    RAISE NOTICE '👥 전체 사용자: %명', total_users;
    RAISE NOTICE '👑 관리자 사용자: %명', admin_users;
    RAISE NOTICE '🤖 더미 사용자: %명', dummy_users;
    RAISE NOTICE '📊 전체 활동 로그: %개', total_logs;
    RAISE NOTICE '';
    RAISE NOTICE '✅ 로그인 정보:';
    RAISE NOTICE '📧 이메일: admin@careerlog.demo';
    RAISE NOTICE '🔑 비밀번호: 아직 설정 안됨 (다음 단계에서 설정)';
END $$; 