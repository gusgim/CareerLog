-- =====================================
-- 데모 데이터 검증 및 테스트 스크립트
-- =====================================
-- 이 스크립트는 생성된 더미 데이터가 모든 차트와 그래프에서
-- 의미있는 데이터로 표시되는지 자동으로 검증합니다.

-- 테스트 시작 알림
DO $$
BEGIN
    RAISE NOTICE '🔍 CareerLog 데모 데이터 검증 시작...';
    RAISE NOTICE '==========================================';
END $$;

-- 1. 기본 데이터 검증
DO $$
DECLARE
    user_count INTEGER;
    admin_count INTEGER;
    regular_count INTEGER;
    log_count INTEGER;
    schedule_count INTEGER;
    room_count INTEGER;
    duty_type_count INTEGER;
    qualification_count INTEGER;
    staff_qual_count INTEGER;
    category_count INTEGER;
BEGIN
    -- 사용자 수 검증
    SELECT COUNT(*) INTO user_count FROM public.profiles;
    SELECT COUNT(*) INTO admin_count FROM public.profiles WHERE is_admin = true;
    SELECT COUNT(*) INTO regular_count FROM public.profiles WHERE is_admin = false;
    
    RAISE NOTICE '📊 기본 데이터 검증:';
    RAISE NOTICE '  - 전체 사용자: %', user_count;
    RAISE NOTICE '  - 관리자: %', admin_count;
    RAISE NOTICE '  - 일반 사용자: %', regular_count;
    
    -- 기본 데이터 유효성 검증
    IF user_count < 78 THEN
        RAISE WARNING '⚠️ 사용자 수가 예상보다 적습니다. (예상: 78명, 실제: %명)', user_count;
    ELSE
        RAISE NOTICE '✅ 사용자 데이터 정상';
    END IF;
    
    IF admin_count < 1 THEN
        RAISE WARNING '⚠️ 관리자 계정이 없습니다.';
    ELSE
        RAISE NOTICE '✅ 관리자 계정 정상';
    END IF;
    
    -- 활동 로그 검증
    SELECT COUNT(*) INTO log_count FROM public.logs;
    RAISE NOTICE '  - 전체 활동 로그: %', log_count;
    
    IF log_count < 10000 THEN
        RAISE WARNING '⚠️ 활동 로그가 부족합니다. (최소 10,000개 권장, 실제: %개)', log_count;
    ELSE
        RAISE NOTICE '✅ 활동 로그 데이터 충분';
    END IF;
    
    -- 근무 스케줄 검증
    SELECT COUNT(*) INTO schedule_count FROM public.duty_schedules;
    RAISE NOTICE '  - 근무 스케줄: %', schedule_count;
    
    IF schedule_count < 30000 THEN
        RAISE WARNING '⚠️ 근무 스케줄이 부족합니다. (최소 30,000개 권장, 실제: %개)', schedule_count;
    ELSE
        RAISE NOTICE '✅ 근무 스케줄 데이터 충분';
    END IF;
    
    -- 기타 테이블 검증
    SELECT COUNT(*) INTO room_count FROM public.operating_rooms;
    SELECT COUNT(*) INTO duty_type_count FROM public.duty_types;
    SELECT COUNT(*) INTO qualification_count FROM public.qualifications;
    SELECT COUNT(*) INTO staff_qual_count FROM public.staff_qualifications;
    SELECT COUNT(*) INTO category_count FROM public.categories;
    
    RAISE NOTICE '  - 수술방: %, 듀티타입: %, 자격유형: %, 사용자자격: %, 카테고리: %', 
                 room_count, duty_type_count, qualification_count, staff_qual_count, category_count;
END $$;

-- 2. 대시보드 통계 검증
DO $$
DECLARE
    today_logs INTEGER;
    week_logs INTEGER;
    month_logs INTEGER;
    category_stats RECORD;
    empty_categories INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📈 대시보드 통계 검증:';
    
    -- 오늘 활동 로그 (최근 데이터 시뮬레이션)
    SELECT COUNT(*) INTO today_logs 
    FROM public.logs 
    WHERE log_date >= CURRENT_DATE - INTERVAL '7 days';
    
    -- 이번 주 활동 로그
    SELECT COUNT(*) INTO week_logs 
    FROM public.logs 
    WHERE log_date >= CURRENT_DATE - INTERVAL '30 days';
    
    -- 이번 달 활동 로그
    SELECT COUNT(*) INTO month_logs 
    FROM public.logs 
    WHERE log_date >= CURRENT_DATE - INTERVAL '90 days';
    
    RAISE NOTICE '  - 최근 7일 활동: %', today_logs;
    RAISE NOTICE '  - 최근 30일 활동: %', week_logs;
    RAISE NOTICE '  - 최근 90일 활동: %', month_logs;
    
    -- 카테고리별 분포 검증
    RAISE NOTICE '  - 카테고리별 활동 분포:';
    FOR category_stats IN 
        SELECT category, COUNT(*) as count,
               ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM public.logs))::numeric, 1) as percentage
        FROM public.logs 
        GROUP BY category 
        ORDER BY count DESC
    LOOP
        RAISE NOTICE '    * %: %건 (%.1f%%)', category_stats.category, category_stats.count, category_stats.percentage;
        
        IF category_stats.count < 100 THEN
            empty_categories := empty_categories + 1;
        END IF;
    END LOOP;
    
    IF empty_categories > 0 THEN
        RAISE WARNING '⚠️ %개 카테고리의 데이터가 부족합니다. (100건 미만)', empty_categories;
    ELSE
        RAISE NOTICE '✅ 모든 카테고리에 충분한 데이터 존재';
    END IF;
END $$;

-- 3. 관리자 통계 대시보드 검증
DO $$
DECLARE
    active_users INTEGER;
    activity_rate NUMERIC;
    user_with_no_logs INTEGER;
    top_user RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '👑 관리자 통계 대시보드 검증:';
    
    -- 활성 사용자 계산 (최근 30일 내 활동이 있는 사용자)
    SELECT COUNT(DISTINCT user_id) INTO active_users 
    FROM public.logs 
    WHERE log_date >= CURRENT_DATE - INTERVAL '30 days';
    
    -- 활성화율 계산
    SELECT ROUND((active_users * 100.0 / (SELECT COUNT(*) FROM public.profiles WHERE NOT is_admin))::numeric, 1) 
    INTO activity_rate;
    
    RAISE NOTICE '  - 활성 사용자: %명', active_users;
    RAISE NOTICE '  - 활성화율: %.1f%%', activity_rate;
    
    -- 활동이 없는 사용자 확인
    SELECT COUNT(*) INTO user_with_no_logs
    FROM public.profiles p
    WHERE NOT is_admin 
    AND NOT EXISTS (SELECT 1 FROM public.logs l WHERE l.user_id = p.id);
    
    IF user_with_no_logs > 0 THEN
        RAISE WARNING '⚠️ %명의 사용자가 활동 로그가 없습니다.', user_with_no_logs;
    ELSE
        RAISE NOTICE '✅ 모든 사용자가 활동 로그를 보유';
    END IF;
    
    -- 최고 활동 사용자
    SELECT p.full_name, COUNT(l.id) as log_count
    INTO top_user
    FROM public.profiles p
    JOIN public.logs l ON p.id = l.user_id
    WHERE NOT p.is_admin
    GROUP BY p.id, p.full_name
    ORDER BY log_count DESC
    LIMIT 1;
    
    RAISE NOTICE '  - 최고 활동 사용자: % (%건)', top_user.full_name, top_user.log_count;
END $$;

-- 4. 수술방 분석 검증
DO $$
DECLARE
    room_stats RECORD;
    empty_rooms INTEGER := 0;
    total_rooms INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🏥 수술방 분석 검증:';
    
    SELECT COUNT(*) INTO total_rooms FROM public.operating_rooms;
    
    -- 수술방별 사용 현황
    FOR room_stats IN 
        SELECT 
            or_table.room_name,
            or_table.department,
            COUNT(ds.id) as schedule_count,
            COUNT(DISTINCT ds.user_id) as unique_users,
            COUNT(DISTINCT DATE(ds.duty_date)) as active_days
        FROM public.operating_rooms or_table
        LEFT JOIN public.duty_schedules ds ON or_table.id = ds.operating_room_id
        GROUP BY or_table.id, or_table.room_name, or_table.department
        ORDER BY schedule_count DESC
    LOOP
        RAISE NOTICE '  - %: %건 스케줄, %명 근무자, %일 활동', 
                     room_stats.room_name, room_stats.schedule_count, 
                     room_stats.unique_users, room_stats.active_days;
        
        IF room_stats.schedule_count < 100 THEN
            empty_rooms := empty_rooms + 1;
        END IF;
    END LOOP;
    
    IF empty_rooms > 0 THEN
        RAISE WARNING '⚠️ %개 수술방의 스케줄이 부족합니다. (100건 미만)', empty_rooms;
    ELSE
        RAISE NOTICE '✅ 모든 수술방에 충분한 스케줄 데이터 존재';
    END IF;
END $$;

-- 5. 자격 관리 시스템 검증
DO $$
DECLARE
    qual_stats RECORD;
    users_without_basic_qual INTEGER;
    avg_qualifications NUMERIC;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🏆 자격 관리 시스템 검증:';
    
    -- 자격증별 보유 현황
    FOR qual_stats IN 
        SELECT 
            q.name_ko,
            q.is_mandatory,
            COUNT(sq.id) as holder_count,
            ROUND((COUNT(sq.id) * 100.0 / (SELECT COUNT(*) FROM public.profiles WHERE NOT is_admin))::numeric, 1) as percentage
        FROM public.qualifications q
        LEFT JOIN public.staff_qualifications sq ON q.id = sq.qualification_id AND sq.status = 'active'
        GROUP BY q.id, q.name_ko, q.is_mandatory
        ORDER BY holder_count DESC
    LOOP
        RAISE NOTICE '  - %: %명 보유 (%.1f%%) %', 
                     qual_stats.name_ko, qual_stats.holder_count, qual_stats.percentage,
                     CASE WHEN qual_stats.is_mandatory THEN '[필수]' ELSE '[선택]' END;
    END LOOP;
    
    -- 기본 자격증 미보유자 확인
    SELECT COUNT(*) INTO users_without_basic_qual
    FROM public.profiles p
    WHERE NOT p.is_admin 
    AND NOT EXISTS (
        SELECT 1 FROM public.staff_qualifications sq 
        WHERE sq.user_id = p.id AND sq.qualification_id = 1 AND sq.status = 'active'
    );
    
    IF users_without_basic_qual > 0 THEN
        RAISE WARNING '⚠️ %명이 기본 자격증을 보유하지 않습니다.', users_without_basic_qual;
    ELSE
        RAISE NOTICE '✅ 모든 사용자가 기본 자격증 보유';
    END IF;
    
    -- 평균 자격증 수
    SELECT ROUND(AVG(qual_count)::numeric, 1) INTO avg_qualifications
    FROM (
        SELECT COUNT(*) as qual_count
        FROM public.staff_qualifications sq
        JOIN public.profiles p ON sq.user_id = p.id
        WHERE NOT p.is_admin AND sq.status = 'active'
        GROUP BY sq.user_id
    ) user_quals;
    
    RAISE NOTICE '  - 사용자당 평균 자격증 수: %.1f개', avg_qualifications;
END $$;

-- 6. 스케줄링 시스템 검증
DO $$
DECLARE
    duty_stats RECORD;
    date_coverage RECORD;
    user_workload RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '⏰ 스케줄링 시스템 검증:';
    
    -- 듀티 타입별 분포
    FOR duty_stats IN 
        SELECT 
            dt.name_ko,
            COUNT(ds.id) as schedule_count,
            ROUND((COUNT(ds.id) * 100.0 / (SELECT COUNT(*) FROM public.duty_schedules))::numeric, 1) as percentage
        FROM public.duty_types dt
        LEFT JOIN public.duty_schedules ds ON dt.id = ds.duty_type_id
        GROUP BY dt.id, dt.name_ko
        ORDER BY schedule_count DESC
    LOOP
        RAISE NOTICE '  - % 듀티: %건 (%.1f%%)', duty_stats.name_ko, duty_stats.schedule_count, duty_stats.percentage;
    END LOOP;
    
    -- 날짜 커버리지 확인
    SELECT 
        MIN(duty_date) as start_date,
        MAX(duty_date) as end_date,
        COUNT(DISTINCT duty_date) as unique_days,
        ROUND((EXTRACT(EPOCH FROM (MAX(duty_date) - MIN(duty_date))) / 86400)::numeric, 0) as total_days
    INTO date_coverage
    FROM public.duty_schedules;
    
    RAISE NOTICE '  - 스케줄 기간: % ~ %', date_coverage.start_date, date_coverage.end_date;
    RAISE NOTICE '  - 활동 일수: %일 / 전체 %일 (%.1f%% 커버리지)', 
                 date_coverage.unique_days, date_coverage.total_days,
                 (date_coverage.unique_days * 100.0 / date_coverage.total_days);
    
    -- 사용자별 근무 부하 확인
    SELECT 
        AVG(schedule_count) as avg_schedules,
        MIN(schedule_count) as min_schedules,
        MAX(schedule_count) as max_schedules,
        STDDEV(schedule_count) as stddev_schedules
    INTO user_workload
    FROM (
        SELECT COUNT(*) as schedule_count
        FROM public.duty_schedules ds
        JOIN public.profiles p ON ds.user_id = p.id
        WHERE NOT p.is_admin
        GROUP BY ds.user_id
    ) user_stats;
    
    RAISE NOTICE '  - 근무 부하: 평균 %.1f건, 최소 %건, 최대 %건 (표준편차: %.1f)', 
                 user_workload.avg_schedules, user_workload.min_schedules, 
                 user_workload.max_schedules, user_workload.stddev_schedules;
END $$;

-- 7. 시간대별 활동 분포 검증
DO $$
DECLARE
    time_stats RECORD;
    weekend_ratio NUMERIC;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🕐 시간대별 활동 분포 검증:';
    
    -- 요일별 분포
    FOR time_stats IN 
        SELECT 
            CASE EXTRACT(DOW FROM log_date)
                WHEN 0 THEN '일요일'
                WHEN 1 THEN '월요일'
                WHEN 2 THEN '화요일'
                WHEN 3 THEN '수요일'
                WHEN 4 THEN '목요일'
                WHEN 5 THEN '금요일'
                WHEN 6 THEN '토요일'
            END as day_name,
            COUNT(*) as count,
            ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM public.logs))::numeric, 1) as percentage
        FROM public.logs
        GROUP BY EXTRACT(DOW FROM log_date)
        ORDER BY EXTRACT(DOW FROM log_date)
    LOOP
        RAISE NOTICE '  - %: %건 (%.1f%%)', time_stats.day_name, time_stats.count, time_stats.percentage;
    END LOOP;
    
    -- 주말 대 평일 비율
    SELECT 
        ROUND((
            (SELECT COUNT(*) FROM public.logs WHERE EXTRACT(DOW FROM log_date) IN (0, 6)) * 100.0 / 
            (SELECT COUNT(*) FROM public.logs WHERE EXTRACT(DOW FROM log_date) NOT IN (0, 6))
        )::numeric, 1)
    INTO weekend_ratio;
    
    RAISE NOTICE '  - 주말/평일 활동 비율: %.1f%%', weekend_ratio;
END $$;

-- 8. 데이터 품질 검증
DO $$
DECLARE
    quality_issues INTEGER := 0;
    null_details INTEGER;
    empty_tags INTEGER;
    invalid_durations INTEGER;
    orphaned_schedules INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 데이터 품질 검증:';
    
    -- 빈 세부사항 확인
    SELECT COUNT(*) INTO null_details FROM public.logs WHERE details IS NULL OR TRIM(details) = '';
    IF null_details > 0 THEN
        RAISE WARNING '⚠️ %건의 로그에 세부사항이 없습니다.', null_details;
        quality_issues := quality_issues + 1;
    END IF;
    
    -- 빈 태그 확인
    SELECT COUNT(*) INTO empty_tags FROM public.logs WHERE tags IS NULL OR array_length(tags, 1) IS NULL;
    IF empty_tags > 0 THEN
        RAISE WARNING '⚠️ %건의 로그에 태그가 없습니다.', empty_tags;
        quality_issues := quality_issues + 1;
    END IF;
    
    -- 비정상적인 근무 시간 확인
    SELECT COUNT(*) INTO invalid_durations FROM public.logs WHERE duration_hours < 0 OR duration_hours > 24;
    IF invalid_durations > 0 THEN
        RAISE WARNING '⚠️ %건의 로그에 비정상적인 근무 시간이 있습니다.', invalid_durations;
        quality_issues := quality_issues + 1;
    END IF;
    
    -- 고아 스케줄 확인
    SELECT COUNT(*) INTO orphaned_schedules 
    FROM public.duty_schedules ds 
    WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = ds.user_id);
    
    IF orphaned_schedules > 0 THEN
        RAISE WARNING '⚠️ %건의 스케줄이 존재하지 않는 사용자를 참조합니다.', orphaned_schedules;
        quality_issues := quality_issues + 1;
    END IF;
    
    IF quality_issues = 0 THEN
        RAISE NOTICE '✅ 데이터 품질 검증 통과';
    ELSE
        RAISE NOTICE '⚠️ %개의 데이터 품질 이슈 발견', quality_issues;
    END IF;
END $$;

-- 9. 차트별 데이터 충분성 검증
DO $$
DECLARE
    chart_readiness INTEGER := 0;
    total_charts INTEGER := 8;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📊 차트별 데이터 준비성 검증:';
    
    -- 1. 대시보드 기본 통계 카드
    IF (SELECT COUNT(*) FROM public.logs WHERE log_date >= CURRENT_DATE - INTERVAL '7 days') > 10 THEN
        RAISE NOTICE '✅ 대시보드 통계 카드: 준비 완료';
        chart_readiness := chart_readiness + 1;
    ELSE
        RAISE WARNING '❌ 대시보드 통계 카드: 최근 데이터 부족';
    END IF;
    
    -- 2. 카테고리별 분포 차트
    IF (SELECT COUNT(DISTINCT category) FROM public.logs) >= 3 THEN
        RAISE NOTICE '✅ 카테고리 분포 차트: 준비 완료';
        chart_readiness := chart_readiness + 1;
    ELSE
        RAISE WARNING '❌ 카테고리 분포 차트: 카테고리 다양성 부족';
    END IF;
    
    -- 3. 일별 활성 사용자 차트
    IF (SELECT COUNT(DISTINCT DATE(log_date)) FROM public.logs WHERE log_date >= CURRENT_DATE - INTERVAL '30 days') >= 20 THEN
        RAISE NOTICE '✅ 일별 활성 사용자 차트: 준비 완료';
        chart_readiness := chart_readiness + 1;
    ELSE
        RAISE WARNING '❌ 일별 활성 사용자 차트: 일별 데이터 부족';
    END IF;
    
    -- 4. 수술방별 사용 현황 차트
    IF (SELECT COUNT(*) FROM public.duty_schedules) > 1000 THEN
        RAISE NOTICE '✅ 수술방 사용 현황 차트: 준비 완료';
        chart_readiness := chart_readiness + 1;
    ELSE
        RAISE WARNING '❌ 수술방 사용 현황 차트: 스케줄 데이터 부족';
    END IF;
    
    -- 5. 자격증 보유 현황 차트
    IF (SELECT COUNT(*) FROM public.staff_qualifications) > 100 THEN
        RAISE NOTICE '✅ 자격증 보유 현황 차트: 준비 완료';
        chart_readiness := chart_readiness + 1;
    ELSE
        RAISE WARNING '❌ 자격증 보유 현황 차트: 자격증 데이터 부족';
    END IF;
    
    -- 6. 개별 사용자 분석 차트
    IF (SELECT MAX(log_count) FROM (SELECT COUNT(*) as log_count FROM public.logs GROUP BY user_id) user_stats) > 50 THEN
        RAISE NOTICE '✅ 개별 사용자 분석 차트: 준비 완료';
        chart_readiness := chart_readiness + 1;
    ELSE
        RAISE WARNING '❌ 개별 사용자 분석 차트: 사용자별 데이터 부족';
    END IF;
    
    -- 7. 듀티 타입별 분포 차트
    IF (SELECT COUNT(DISTINCT duty_type_id) FROM public.duty_schedules) >= 4 THEN
        RAISE NOTICE '✅ 듀티 타입 분포 차트: 준비 완료';
        chart_readiness := chart_readiness + 1;
    ELSE
        RAISE WARNING '❌ 듀티 타입 분포 차트: 듀티 다양성 부족';
    END IF;
    
    -- 8. 월별 성장 추이 차트
    IF (SELECT COUNT(DISTINCT DATE_TRUNC('month', log_date)) FROM public.logs) >= 6 THEN
        RAISE NOTICE '✅ 월별 성장 추이 차트: 준비 완료';
        chart_readiness := chart_readiness + 1;
    ELSE
        RAISE WARNING '❌ 월별 성장 추이 차트: 월별 데이터 부족';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '📈 차트 준비성 요약: %/% (%.1f%%)', chart_readiness, total_charts, (chart_readiness * 100.0 / total_charts);
END $$;

-- 10. 최종 결과 요약
DO $$
DECLARE
    final_score INTEGER;
    user_count INTEGER;
    log_count INTEGER;
    schedule_count INTEGER;
    room_count INTEGER;
    qual_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎯 최종 검증 결과 요약';
    RAISE NOTICE '==========================================';
    
    -- 기본 통계
    SELECT COUNT(*) INTO user_count FROM public.profiles;
    SELECT COUNT(*) INTO log_count FROM public.logs;
    SELECT COUNT(*) INTO schedule_count FROM public.duty_schedules;
    SELECT COUNT(*) INTO room_count FROM public.operating_rooms;
    SELECT COUNT(*) INTO qual_count FROM public.staff_qualifications;
    
    -- 점수 계산 (각 항목별 가중치 적용)
    final_score := 0;
    
    -- 사용자 데이터 (20점)
    IF user_count >= 78 THEN
        final_score := final_score + 20;
    ELSE
        final_score := final_score + (user_count * 20 / 78);
    END IF;
    
    -- 활동 로그 (30점)
    IF log_count >= 15000 THEN
        final_score := final_score + 30;
    ELSE
        final_score := final_score + (log_count * 30 / 15000);
    END IF;
    
    -- 근무 스케줄 (25점)
    IF schedule_count >= 40000 THEN
        final_score := final_score + 25;
    ELSE
        final_score := final_score + (schedule_count * 25 / 40000);
    END IF;
    
    -- 수술방 데이터 (15점)
    IF room_count >= 10 THEN
        final_score := final_score + 15;
    ELSE
        final_score := final_score + (room_count * 15 / 10);
    END IF;
    
    -- 자격증 데이터 (10점)
    IF qual_count >= 300 THEN
        final_score := final_score + 10;
    ELSE
        final_score := final_score + (qual_count * 10 / 300);
    END IF;
    
    RAISE NOTICE '📊 생성된 데이터 현황:';
    RAISE NOTICE '  👥 사용자: %명', user_count;
    RAISE NOTICE '  📝 활동 로그: %건', log_count;
    RAISE NOTICE '  ⏰ 근무 스케줄: %건', schedule_count;
    RAISE NOTICE '  🏥 수술방: %개', room_count;
    RAISE NOTICE '  🏆 자격증: %건', qual_count;
    RAISE NOTICE '';
    
    -- 최종 평가
    RAISE NOTICE '🏆 데모 준비성 점수: %/100점', final_score;
    
    IF final_score >= 90 THEN
        RAISE NOTICE '🎉 축하합니다! 완벽한 데모 환경이 준비되었습니다.';
        RAISE NOTICE '   모든 차트와 그래프가 의미있는 데이터로 표시될 것입니다.';
    ELSIF final_score >= 75 THEN
        RAISE NOTICE '✅ 양호한 데모 환경입니다. 대부분의 기능이 정상 작동할 것입니다.';
    ELSIF final_score >= 60 THEN
        RAISE NOTICE '⚠️ 기본적인 데모는 가능하지만 일부 차트의 데이터가 부족할 수 있습니다.';
    ELSE
        RAISE NOTICE '❌ 데모 준비가 미흡합니다. 더미 데이터를 다시 생성해주세요.';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🚀 데모 시연 추천 순서:';
    RAISE NOTICE '  1. 관리자 계정(admin@careerlog.demo)으로 로그인';
    RAISE NOTICE '  2. 전체 통계 대시보드 확인';
    RAISE NOTICE '  3. 세부 통계 대시보드 → 수술방 분석';
    RAISE NOTICE '  4. 개별 사용자 분석 (김민지 등)';
    RAISE NOTICE '  5. 자동 스케줄링 기능 시연';
    RAISE NOTICE '  6. 일반 사용자(user1@careerlog.demo)로 개인 대시보드 확인';
    RAISE NOTICE '';
    RAISE NOTICE '✨ 데모 데이터 검증 완료! ✨';
END $$; 