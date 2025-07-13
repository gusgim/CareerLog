-- =====================================
-- 데모용 더미 데이터 생성 스크립트
-- =====================================
-- 이 스크립트는 CareerLog 시스템의 데모를 위한 완전한 더미 데이터를 생성합니다.
-- 78명의 사용자(관리자 1명, 일반 사용자 77명)와 최근 2년간의 활동 데이터를 포함합니다.

-- 1. 카테고리 기본 데이터 삽입
INSERT INTO public.categories (name, name_ko, description, color, emoji, subcategories) VALUES
('clinical', '근무', '일상 근무 및 수술 관련 활동', '#2563eb', '🏥', ARRAY['수술실', '외래', '회복실', '기타']),
('education', '교육', '교육 및 학습 관련 활동', '#7c3aed', '📚', ARRAY['사내교육', '사외교육', '테스트 응시']),
('performance', '간호성과 및 혁신추구', '성과 개선 및 혁신 활동', '#059669', '🏆', ARRAY['자율적 혁신', '임상연구', '간호사례발표', '부서자율과제', '창의학습', '즉개선', 'Self 혁신', 'SAFTY Design', '제안제도', 'PICO']),
('research', '연구', '연구 및 논문 작성 활동', '#dc2626', '🔬', ARRAY['논문 작성', '데이터 수집', '문헌 고찰', '학회 발표']);

-- 2. 수술방 데이터 삽입
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
('OR10', '응급수술실 2호', '응급의학과', 3, 'emergency', true);

-- 3. 듀티 타입 데이터 삽입
INSERT INTO public.duty_types (name, name_ko, description, color, required_qualifications, max_hours_per_week) VALUES
('day', 'Day', '주간 근무 (08:00-16:00)', '#059669', ARRAY['basic_certification'], 40),
('evening', 'Evening', '오후 근무 (16:00-24:00)', '#7c3aed', ARRAY['basic_certification'], 40),
('night', 'Night', '야간 근무 (24:00-08:00)', '#dc2626', ARRAY['basic_certification', 'night_shift_certification'], 40),
('eleven', '11시', '11시 근무 (23:00-07:00)', '#ea580c', ARRAY['basic_certification', 'night_shift_certification'], 40),
('standby', 'Standby', '대기 근무', '#6b7280', ARRAY['basic_certification'], 20),
('overtime', 'Overtime', '연장 근무', '#f59e0b', ARRAY['basic_certification'], 60);

-- 4. 자격/교육 유형 데이터 삽입
INSERT INTO public.qualifications (name, name_ko, description, category, required_for_rooms, required_experience_years, is_mandatory) VALUES
('basic_certification', '기본 자격증', '간호사 기본 자격증', 'certification', ARRAY['OR1', 'OR2', 'OR3', 'OR4', 'OR5', 'OR6', 'OR7', 'OR8', 'OR9', 'OR10'], 0, true),
('night_shift_certification', '야간근무 자격', '야간 근무 가능 인증', 'certification', ARRAY['night', 'eleven'], 6, false),
('cardiac_specialty', '심장수술 전문과정', '심장수술실 전문 교육 이수', 'education', ARRAY['OR4'], 12, false),
('neuro_specialty', '신경외과 전문과정', '신경외과 전문 교육 이수', 'education', ARRAY['OR3'], 12, false),
('emergency_certification', '응급처치 자격증', '응급상황 대응 인증', 'certification', ARRAY['OR9', 'OR10'], 6, false),
('cpr_certification', 'CPR 자격증', '심폐소생술 인증', 'certification', ARRAY[], 0, true),
('infection_control', '감염관리 교육', '감염관리 전문 교육 이수', 'education', ARRAY[], 0, true),
('anesthesia_management', '마취관리 과정', '마취 관리 전문 교육', 'education', ARRAY[], 24, false),
('patient_safety', '환자안전 교육', '환자 안전 관리 교육', 'education', ARRAY[], 0, true),
('surgical_instrument', '수술기구 관리', '수술기구 관리 전문과정', 'education', ARRAY[], 12, false);

-- 5. 더미 사용자 프로필 생성
-- 먼저 관리자 계정을 생성합니다
DO $$
DECLARE
    admin_id UUID := gen_random_uuid();
    user_ids UUID[] := ARRAY[]::UUID[];
    user_id UUID;
    i INTEGER;
    
    -- 이름 목록 (77명)
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
    
    -- 부서 목록
    departments TEXT[] := ARRAY['마취과', '수술실', '회복실', '중환자실', '응급실', '외래'];
    
    -- 병원 목록
    hospitals TEXT[] := ARRAY['서울대학교병원', '연세대학교병원', '성균관대학교삼성서울병원', '아산의료원', '세브란스병원'];
    
    -- 역할 목록
    roles TEXT[] := ARRAY['간호사', '마취간호사', '수술실간호사', '회복실간호사', '책임간호사'];
    
    -- 날짜 변수들
    start_date DATE := CURRENT_DATE - INTERVAL '2 years';
    current_date_var DATE;
    log_count INTEGER;
    category_types TEXT[] := ARRAY['clinical', 'education', 'performance', 'research'];
    category_type TEXT;
    subcategories TEXT[];
    subcategory TEXT;
    
BEGIN
    -- 관리자 계정 생성
    INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
    VALUES (admin_id, 'admin@careerlog.demo', NOW(), NOW(), NOW());
    
    INSERT INTO public.profiles (
        id, full_name, department, role, hospital, phone, years_of_experience, 
        hire_date, employee_id, is_admin
    ) VALUES (
        admin_id, '시스템 관리자', '정보관리팀', '시스템관리자', '서울대학교병원', 
        '02-1234-5678', 10, '2014-03-01', 'ADMIN001', true
    );

    -- 77명의 일반 사용자 생성
    FOR i IN 1..77 LOOP
        user_id := gen_random_uuid();
        user_ids := array_append(user_ids, user_id);
        
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
            (i % 15) + 1, -- 1-15년 경력
            start_date + (i % 365) * INTERVAL '1 day', -- 다양한 입사일
            'EMP' || LPAD(i::TEXT, 3, '0'),
            false
        );
    END LOOP;

    -- 모든 사용자에게 기본 자격증 부여
    FOR i IN 1..77 LOOP
        user_id := user_ids[i];
        
        -- 기본 자격증들 부여
        INSERT INTO public.staff_qualifications (user_id, qualification_id, obtained_date, status) VALUES
        (user_id, 1, start_date + (i % 30) * INTERVAL '1 day', 'active'), -- basic_certification
        (user_id, 6, start_date + (i % 45) * INTERVAL '1 day', 'active'), -- cpr_certification
        (user_id, 7, start_date + (i % 60) * INTERVAL '1 day', 'active'), -- infection_control
        (user_id, 9, start_date + (i % 90) * INTERVAL '1 day', 'active'); -- patient_safety
        
        -- 50% 확률로 야간근무 자격 부여
        IF i % 2 = 0 THEN
            INSERT INTO public.staff_qualifications (user_id, qualification_id, obtained_date, status) VALUES
            (user_id, 2, start_date + (i % 180) * INTERVAL '1 day', 'active'); -- night_shift_certification
        END IF;
        
        -- 30% 확률로 전문 자격 부여
        IF i % 3 = 0 THEN
            CASE i % 4
                WHEN 0 THEN
                    INSERT INTO public.staff_qualifications (user_id, qualification_id, obtained_date, status) VALUES
                    (user_id, 3, start_date + (i % 200) * INTERVAL '1 day', 'active'); -- cardiac_specialty
                WHEN 1 THEN
                    INSERT INTO public.staff_qualifications (user_id, qualification_id, obtained_date, status) VALUES
                    (user_id, 4, start_date + (i % 200) * INTERVAL '1 day', 'active'); -- neuro_specialty
                WHEN 2 THEN
                    INSERT INTO public.staff_qualifications (user_id, qualification_id, obtained_date, status) VALUES
                    (user_id, 5, start_date + (i % 200) * INTERVAL '1 day', 'active'); -- emergency_certification
                ELSE
                    INSERT INTO public.staff_qualifications (user_id, qualification_id, obtained_date, status) VALUES
                    (user_id, 8, start_date + (i % 200) * INTERVAL '1 day', 'active'); -- anesthesia_management
            END CASE;
        END IF;
    END LOOP;

    -- 근무 스케줄 생성 (최근 2년간)
    current_date_var := start_date;
    WHILE current_date_var <= CURRENT_DATE LOOP
        -- 각 사용자에 대해 근무 스케줄 생성
        FOR i IN 1..77 LOOP
            user_id := user_ids[i];
            
            -- 80% 확률로 근무 배정
            IF random() < 0.8 THEN
                DECLARE
                    duty_type_id_var INTEGER;
                    room_id_var INTEGER;
                    shift_start_var TIME;
                    shift_end_var TIME;
                BEGIN
                    -- 듀티 타입 랜덤 선택
                    duty_type_id_var := 1 + (EXTRACT(DOW FROM current_date_var)::INTEGER + i) % 6;
                    
                    -- 수술방 랜덤 선택
                    room_id_var := 1 + (i + EXTRACT(DAY FROM current_date_var)::INTEGER) % 10;
                    
                    -- 듀티 타입에 따른 시간 설정
                    CASE duty_type_id_var
                        WHEN 1 THEN -- Day
                            shift_start_var := '08:00:00';
                            shift_end_var := '16:00:00';
                        WHEN 2 THEN -- Evening
                            shift_start_var := '16:00:00';
                            shift_end_var := '24:00:00';
                        WHEN 3 THEN -- Night
                            shift_start_var := '00:00:00';
                            shift_end_var := '08:00:00';
                        WHEN 4 THEN -- 11시
                            shift_start_var := '23:00:00';
                            shift_end_var := '07:00:00';
                        WHEN 5 THEN -- Standby
                            shift_start_var := '08:00:00';
                            shift_end_var := '17:00:00';
                        ELSE -- Overtime
                            shift_start_var := '08:00:00';
                            shift_end_var := '20:00:00';
                    END CASE;
                    
                    INSERT INTO public.duty_schedules (
                        user_id, duty_date, duty_type_id, operating_room_id,
                        shift_start, shift_end, status, created_by
                    ) VALUES (
                        user_id, current_date_var, duty_type_id_var, room_id_var,
                        shift_start_var, shift_end_var, 'completed', admin_id
                    );
                END;
            END IF;
        END LOOP;
        
        current_date_var := current_date_var + INTERVAL '1 day';
    END LOOP;

    -- 활동 로그 생성 (최근 2년간, 사용자당 평균 200개)
    FOR i IN 1..77 LOOP
        user_id := user_ids[i];
        log_count := 150 + (i % 100); -- 150-250개 로그
        
        FOR j IN 1..log_count LOOP
            current_date_var := start_date + (random() * 730)::INTEGER * INTERVAL '1 day';
            category_type := category_types[1 + (j % array_length(category_types, 1))];
            
            CASE category_type
                WHEN 'clinical' THEN
                    subcategories := ARRAY['수술실', '외래', '회복실', '기타'];
                    subcategory := subcategories[1 + (j % array_length(subcategories, 1))];
                    
                    INSERT INTO public.logs (
                        user_id, log_date, category, subcategory, details, tags, duration_hours,
                        operating_room_id
                    ) VALUES (
                        user_id, current_date_var, category_type, subcategory,
                        CASE subcategory
                            WHEN '수술실' THEN 
                                'OR ' || (1 + (j % 10))::TEXT || '에서 ' || 
                                (ARRAY['정형외과', '신경외과', '일반외과', '흉부외과', '성형외과'])[1 + (j % 5)] || 
                                ' 수술 진행. 환자 모니터링 및 수술 보조 업무 수행.'
                            WHEN '외래' THEN
                                '외래 환자 진료 보조 및 처치. 환자 상담 및 교육 실시.'
                            WHEN '회복실' THEN
                                '수술 후 환자 회복 모니터링. 활력징후 체크 및 통증 관리.'
                            ELSE
                                '일반 병동 근무. 환자 간호 및 의료진 협조 업무.'
                        END,
                        ARRAY[
                            (ARRAY['수술', '환자관리', '모니터링', '처치', '교육'])[1 + (j % 5)],
                            (ARRAY['협력', '안전', '품질', '효율성', '소통'])[1 + (j % 5)]
                        ],
                        6.0 + (random() * 4.0), -- 6-10시간
                        CASE WHEN subcategory = '수술실' THEN 1 + (j % 10) ELSE NULL END
                    );
                    
                WHEN 'education' THEN
                    subcategories := ARRAY['사내교육', '사외교육', '테스트 응시'];
                    subcategory := subcategories[1 + (j % array_length(subcategories, 1))];
                    
                    INSERT INTO public.logs (
                        user_id, log_date, category, subcategory, details, tags, duration_hours
                    ) VALUES (
                        user_id, current_date_var, category_type, subcategory,
                        CASE subcategory
                            WHEN '사내교육' THEN
                                (ARRAY['감염관리 교육', 'CPR 재교육', '환자안전 교육', '의료기기 사용법', '간호기록 작성법'])[1 + (j % 5)] ||
                                ' 참석. 최신 가이드라인 학습 및 실습 진행.'
                            WHEN '사외교육' THEN
                                (ARRAY['대한간호협회 세미나', '학회 참석', '외부 전문과정', '국제 컨퍼런스', '온라인 교육'])[1 + (j % 5)] ||
                                ' 참석. 전문 지식 습득 및 네트워킹.'
                            ELSE
                                (ARRAY['감염관리 인증시험', 'CPR 재인증', '전문간호사 시험', '병원 내부 평가', '온라인 테스트'])[1 + (j % 5)] ||
                                ' 응시. ' || (ARRAY['합격', '우수', '통과'])[1 + (j % 3)] || ' 성과.'
                        END,
                        ARRAY[
                            (ARRAY['지속교육', '전문성', '자격유지', '역량강화', '학습'])[1 + (j % 5)],
                            (ARRAY['인증', '발전', '성장', '지식', '기술'])[1 + (j % 5)]
                        ],
                        2.0 + (random() * 6.0) -- 2-8시간
                    );
                    
                WHEN 'performance' THEN
                    subcategories := ARRAY['자율적 혁신', '임상연구', '간호사례발표', '부서자율과제', '창의학습', '즉개선', 'Self 혁신', 'SAFTY Design'];
                    subcategory := subcategories[1 + (j % array_length(subcategories, 1))];
                    
                    INSERT INTO public.logs (
                        user_id, log_date, category, subcategory, details, tags, duration_hours
                    ) VALUES (
                        user_id, current_date_var, category_type, subcategory,
                        CASE subcategory
                            WHEN '자율적 혁신' THEN
                                '업무 프로세스 개선 아이디어 제안 및 구현. ' ||
                                (ARRAY['환자 대기시간 단축', '물품 관리 효율화', '커뮤니케이션 개선', '안전 절차 강화', '교육 방법 혁신'])[1 + (j % 5)] ||
                                ' 프로젝트 참여.'
                            WHEN '임상연구' THEN
                                (ARRAY['환자 만족도 조사', '간호 중재 효과 연구', '감염률 감소 연구', '통증 관리 연구', '회복률 개선 연구'])[1 + (j % 5)] ||
                                ' 참여. 데이터 수집 및 분석 담당.'
                            WHEN '간호사례발표' THEN
                                (ARRAY['복잡한 케이스 관리 사례', '환자 교육 성공 사례', '응급상황 대처 사례', '팀워크 개선 사례', '혁신적 간호 중재'])[1 + (j % 5)] ||
                                ' 발표. 우수 평가 획득.'
                            ELSE
                                subcategory || ' 프로젝트 참여. 팀원/리더 역할 수행하며 성과 창출.'
                        END,
                        ARRAY[
                            (ARRAY['혁신', '개선', '연구', '발표', '협력'])[1 + (j % 5)],
                            (ARRAY['성과', '창의', '분석', '문제해결', '리더십'])[1 + (j % 5)]
                        ],
                        3.0 + (random() * 5.0) -- 3-8시간
                    );
                    
                WHEN 'research' THEN
                    subcategories := ARRAY['논문 작성', '데이터 수집', '문헌 고찰', '학회 발표'];
                    subcategory := subcategories[1 + (j % array_length(subcategories, 1))];
                    
                    INSERT INTO public.logs (
                        user_id, log_date, category, subcategory, details, tags, duration_hours
                    ) VALUES (
                        user_id, current_date_var, category_type, subcategory,
                        CASE subcategory
                            WHEN '논문 작성' THEN
                                (ARRAY['간호 중재 효과에 관한 연구', '환자 안전 개선 방안', '의료진 간 협력 강화', '새로운 간호 기법 적용', '질 향상 활동 결과'])[1 + (j % 5)] ||
                                ' 주제로 논문 작성 중. 문헌 조사 및 데이터 분석 진행.'
                            WHEN '데이터 수집' THEN
                                '연구 프로젝트를 위한 데이터 수집 활동. 설문조사, 관찰, 인터뷰 등 다양한 방법 활용.'
                            WHEN '문헌 고찰' THEN
                                '연구 주제 관련 최신 논문 및 문헌 검토. 체계적 문헌 고찰 수행.'
                            ELSE
                                (ARRAY['간호학회', '의료질향상학회', '감염관리학회', '환자안전학회', '국제학회'])[1 + (j % 5)] ||
                                '에서 연구 결과 발표. 좋은 반응 획득.'
                        END,
                        ARRAY[
                            (ARRAY['연구', '분석', '논문', '학술', '발표'])[1 + (j % 5)],
                            (ARRAY['학회', '출판', '검증', '학습', '기여'])[1 + (j % 5)]
                        ],
                        4.0 + (random() * 4.0) -- 4-8시간
                    );
            END CASE;
        END LOOP;
    END LOOP;

    RAISE NOTICE '데모 데이터 생성 완료!';
    RAISE NOTICE '- 관리자 1명';
    RAISE NOTICE '- 일반 사용자 77명';
    RAISE NOTICE '- 수술방 10개';
    RAISE NOTICE '- 듀티 타입 6개';
    RAISE NOTICE '- 자격 유형 10개';
    RAISE NOTICE '- 약 15,000개의 활동 로그';
    RAISE NOTICE '- 약 40,000개의 근무 스케줄';
    
END $$; 