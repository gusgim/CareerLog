-- =====================================
-- 충돌 방지 더미 데이터 생성 스크립트
-- =====================================
-- 기존 데이터와 충돌하지 않도록 ON CONFLICT 처리를 추가한 버전

-- 1. 카테고리 기본 데이터 삽입 (충돌 방지)
INSERT INTO public.categories (name, name_ko, description, color, emoji, subcategories) VALUES
('clinical', '근무', '일상 근무 및 수술 관련 활동', '#2563eb', '🏥', ARRAY['수술실', '외래', '회복실', '기타']),
('education', '교육', '교육 및 학습 관련 활동', '#7c3aed', '📚', ARRAY['사내교육', '사외교육', '테스트 응시']),
('performance', '간호성과 및 혁신추구', '성과 개선 및 혁신 활동', '#059669', '🏆', ARRAY['자율적 혁신', '임상연구', '간호사례발표', '부서자율과제', '창의학습', '즉개선', 'Self 혁신', 'SAFTY Design', '제안제도', 'PICO']),
('research', '연구', '연구 및 논문 작성 활동', '#dc2626', '🔬', ARRAY['논문 작성', '데이터 수집', '문헌 고찰', '학회 발표'])
ON CONFLICT (name) DO NOTHING;

-- 2. 테이블 존재 여부 확인 및 생성
CREATE TABLE IF NOT EXISTS public.operating_rooms (
    id SERIAL PRIMARY KEY,
    room_number TEXT UNIQUE NOT NULL,
    room_name TEXT NOT NULL,
    department TEXT,
    capacity INTEGER DEFAULT 2,
    specialty_type TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.duty_types (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    name_ko TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6b7280',
    required_qualifications TEXT[] DEFAULT '{}',
    max_hours_per_week INTEGER DEFAULT 40,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.qualifications (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    name_ko TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'certification',
    required_for_rooms TEXT[] DEFAULT '{}',
    required_experience_years INTEGER DEFAULT 0,
    is_mandatory BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.staff_qualifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    qualification_id INTEGER REFERENCES public.qualifications(id),
    obtained_date DATE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.duty_schedules (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    duty_date DATE NOT NULL,
    duty_type_id INTEGER REFERENCES public.duty_types(id),
    operating_room_id INTEGER REFERENCES public.operating_rooms(id),
    shift_start TIME,
    shift_end TIME,
    status TEXT DEFAULT 'scheduled',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. profiles 테이블에 누락된 컬럼 추가
DO $$
BEGIN
    -- is_admin 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'is_admin') THEN
        ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
    END IF;
    
    -- years_of_experience 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'years_of_experience') THEN
        ALTER TABLE public.profiles ADD COLUMN years_of_experience INTEGER DEFAULT 0;
    END IF;
    
    -- hire_date 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'hire_date') THEN
        ALTER TABLE public.profiles ADD COLUMN hire_date DATE DEFAULT CURRENT_DATE;
    END IF;
    
    -- employee_id 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'employee_id') THEN
        ALTER TABLE public.profiles ADD COLUMN employee_id TEXT;
    END IF;
    
    RAISE NOTICE '✅ profiles 테이블 컬럼 업데이트 완료';
END $$;

-- 4. 수술방 데이터 삽입 (충돌 방지)
INSERT INTO public.operating_rooms (room_number, room_name, department, capacity, specialty_type, is_active) VALUES
('OR1', '중앙수술실 1호', '일반외과', 2, 'general', true),
('OR2', '중앙수술실 2호', '정형외과', 2, 'orthopedic', true),
('OR3', '중앙수술실 3호', '신경외과', 3, 'neuro', true),
('OR4', '중앙수술실 4호', '흉부외과', 3, 'cardiac', true),
('OR5', '중앙수술실 5호', '성형외과', 2, 'plastic', true),
('OR6', '중앙수술실 6호', '비뇨기과', 2, 'urologic', true),
('OR7', '중앙수술실 7호', '산부인과', 2, 'gynecologic', true),
('OR8', '중앙수술실 8호', '이비인후과', 2, 'ent', true),
('OR9', '응급수술실 1호', '응급의학과', 3, 'emergency', true),
('OR10', '응급수술실 2호', '응급의학과', 3, 'emergency', true)
ON CONFLICT (room_number) DO NOTHING;

-- 5. 더미 사용자 생성
DO $$
DECLARE
    admin_id UUID := gen_random_uuid();
    user_ids UUID[] := ARRAY[]::UUID[];
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
    
BEGIN
    -- 관리자 계정 생성 (충돌 방지)
    INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
    VALUES (admin_id, 'admin@careerlog.demo', NOW(), NOW(), NOW())
    ON CONFLICT (email) DO NOTHING;
    
    -- 관리자 계정이 새로 생성된 경우만 프로필 추가
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = admin_id) THEN
        INSERT INTO public.profiles (
            id, full_name, department, role, hospital, phone, years_of_experience, 
            hire_date, employee_id, is_admin
        ) VALUES (
            admin_id, '시스템 관리자', '정보관리팀', '시스템관리자', '서울대학교병원', 
            '02-1234-5678', 10, '2014-03-01', 'ADMIN001', true
        );
    END IF;

    -- 77명의 일반 사용자 생성
    FOR i IN 1..77 LOOP
        user_id := gen_random_uuid();
        
        -- auth.users 테이블에 사용자 추가 (충돌 방지)
        INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
        VALUES (user_id, 'user' || i || '@careerlog.demo', NOW(), NOW(), NOW())
        ON CONFLICT (email) DO NOTHING;
        
        -- 새로 생성된 사용자만 프로필 추가
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id) THEN
            user_ids := array_append(user_ids, user_id);
            
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
        END IF;
    END LOOP;

    -- 간단한 로그 데이터 생성 (기존 로그와 추가)
    FOR i IN 1..77 LOOP
        IF i <= array_length(user_ids, 1) THEN
            user_id := user_ids[i];
            
            -- 각 사용자당 50개의 로그 생성
            FOR j IN 1..50 LOOP
                INSERT INTO public.logs (
                    user_id, 
                    log_date, 
                    category, 
                    subcategory, 
                    details, 
                    tags, 
                    duration_hours
                ) VALUES (
                    user_id,
                    start_date + (random() * 730)::INTEGER * INTERVAL '1 day',
                    (ARRAY['clinical', 'education', 'performance', 'research'])[1 + (j % 4)],
                    (ARRAY['수술실', '외래', '회복실', '기타'])[1 + (j % 4)],
                    '더미 활동 로그 #' || j::TEXT || ' - ' || names[i] || '의 ' || 
                    (ARRAY['수술 참여', '환자 간호', '교육 참석', '연구 활동'])[1 + (j % 4)],
                    ARRAY['더미데이터', '테스트'],
                    (1 + random() * 8)::INTEGER
                );
            END LOOP;
        END IF;
    END LOOP;

    RAISE NOTICE '✅ 더미 데이터 생성 완료!';
    RAISE NOTICE '👥 새로 생성된 사용자: %명', array_length(user_ids, 1);
    RAISE NOTICE '📊 새로 생성된 로그: %개', array_length(user_ids, 1) * 50;
    
END $$; 