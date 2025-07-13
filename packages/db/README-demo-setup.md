# CareerLog 데모용 더미 데이터 설정 가이드

이 가이드는 CareerLog 시스템의 데모를 위한 종합적인 더미 데이터를 설정하는 방법을 설명합니다.

## 📊 생성되는 데이터 개요

- **사용자**: 78명 (관리자 1명 + 일반 사용자 77명)
- **수술방**: 10개 (중앙수술실 8개 + 응급수술실 2개)
- **듀티 타입**: 6개 (Day, Evening, Night, 11시, Standby, Overtime)
- **자격/교육 유형**: 10개 (기본자격증, 전문과정 등)
- **활동 로그**: 약 15,000개 (최근 2년간)
- **근무 스케줄**: 약 40,000개 (최근 2년간)

## 🚀 설정 단계

### 1단계: 기존 데이터 정리 (선택사항)

```sql
-- 기존 테스트 데이터가 있는 경우 실행
-- ⚠️ 주의: 이 스크립트는 모든 사용자 데이터를 삭제합니다!

DELETE FROM public.reports;
DELETE FROM public.logs;
DELETE FROM public.duty_schedules;
DELETE FROM public.staff_qualifications;
DELETE FROM public.profiles;
DELETE FROM auth.users WHERE email LIKE '%@careerlog.demo';
DELETE FROM public.qualifications;
DELETE FROM public.duty_types;
DELETE FROM public.operating_rooms;
DELETE FROM public.categories;

-- 시퀀스 리셋
ALTER SEQUENCE public.operating_rooms_id_seq RESTART WITH 1;
ALTER SEQUENCE public.duty_types_id_seq RESTART WITH 1;
ALTER SEQUENCE public.qualifications_id_seq RESTART WITH 1;
ALTER SEQUENCE public.staff_qualifications_id_seq RESTART WITH 1;
ALTER SEQUENCE public.duty_schedules_id_seq RESTART WITH 1;
ALTER SEQUENCE public.logs_id_seq RESTART WITH 1;
ALTER SEQUENCE public.categories_id_seq RESTART WITH 1;
ALTER SEQUENCE public.reports_id_seq RESTART WITH 1;
```

### 2단계: 더미 데이터 생성

1. Supabase 대시보드에 접속
2. SQL Editor로 이동
3. `seed-demo-data.sql` 파일의 내용을 복사하여 붙여넣기
4. 실행 버튼 클릭

**또는 Supabase CLI 사용:**
```bash
supabase db reset --linked
npx supabase db push
npx supabase db seed --file packages/db/seed-demo-data.sql
```

## 👥 생성되는 사용자 계정

### 관리자 계정
- **이메일**: `admin@careerlog.demo`
- **이름**: 시스템 관리자
- **부서**: 정보관리팀
- **역할**: 시스템관리자

### 일반 사용자 계정 (77명)
- **이메일 형식**: `user1@careerlog.demo` ~ `user77@careerlog.demo`
- **이름**: 김민지, 이서준, 박지현, ... (실제 한국 이름 77개)
- **부서**: 마취과, 수술실, 회복실, 중환자실, 응급실, 외래
- **역할**: 간호사, 마취간호사, 수술실간호사, 회복실간호사, 책임간호사
- **병원**: 서울대학교병원, 연세대학교병원, 삼성서울병원, 아산의료원, 세브란스병원

## 🏥 수술방 정보

| 수술방 ID | 수술방명 | 진료과 | 수용인원 | 전문분야 |
|-----------|----------|--------|----------|----------|
| OR1 | 중앙수술실 1호 | 일반외과 | 2명 | general |
| OR2 | 중앙수술실 2호 | 정형외과 | 2명 | orthopedic |
| OR3 | 중앙수술실 3호 | 신경외과 | 3명 | neuro |
| OR4 | 중앙수술실 4호 | 흉부외과 | 3명 | cardiac |
| OR5 | 중앙수술실 5호 | 성형외과 | 2명 | plastic |
| OR6 | 중앙수술실 6호 | 비뇨기과 | 2명 | urologic |
| OR7 | 중앙수술실 7호 | 산부인과 | 2명 | gynecologic |
| OR8 | 중앙수술실 8호 | 이비인후과 | 2명 | ent |
| OR9 | 응급수술실 1호 | 응급의학과 | 3명 | emergency |
| OR10 | 응급수술실 2호 | 응급의학과 | 3명 | emergency |

## 📚 자격/교육 유형

### 필수 자격증
- 기본 자격증 (모든 사용자)
- CPR 자격증 (모든 사용자)
- 감염관리 교육 (모든 사용자)
- 환자안전 교육 (모든 사용자)

### 선택 자격증 (일부 사용자)
- 야간근무 자격 (50% 사용자)
- 심장수술 전문과정 (일부 사용자)
- 신경외과 전문과정 (일부 사용자)
- 응급처치 자격증 (일부 사용자)
- 마취관리 과정 (일부 사용자)
- 수술기구 관리 (일부 사용자)

## 📝 활동 로그 데이터

각 사용자당 150-250개의 활동 로그가 생성되며, 다음 카테고리로 분류됩니다:

### 1. 근무 (Clinical)
- 수술실 근무 (수술 보조, 환자 모니터링)
- 외래 근무 (환자 상담, 처치)
- 회복실 근무 (회복 모니터링, 활력징후 체크)

### 2. 교육 (Education)
- 사내교육 (감염관리, CPR, 환자안전 등)
- 사외교육 (학회, 세미나, 전문과정)
- 테스트 응시 (인증시험, 재인증)

### 3. 간호성과 및 혁신추구 (Performance)
- 자율적 혁신 프로젝트
- 임상연구 참여
- 간호사례발표
- 부서자율과제
- 창의학습 활동

### 4. 연구 (Research)
- 논문 작성
- 데이터 수집
- 문헌 고찰
- 학회 발표

## 🕐 근무 스케줄 데이터

2년간의 근무 스케줄이 생성되며, 각 사용자는 다음과 같은 패턴으로 배정됩니다:

- **Day 근무**: 08:00-16:00
- **Evening 근무**: 16:00-24:00
- **Night 근무**: 00:00-08:00
- **11시 근무**: 23:00-07:00
- **Standby 근무**: 08:00-17:00
- **Overtime 근무**: 08:00-20:00

각 사용자는 약 80% 확률로 매일 근무가 배정되며, 다양한 수술방에서 근무하게 됩니다.

## 🔧 데이터 검증

더미 데이터 생성 후 다음 쿼리로 데이터를 검증할 수 있습니다:

```sql
-- 사용자 수 확인
SELECT COUNT(*) as total_users, 
       SUM(CASE WHEN is_admin THEN 1 ELSE 0 END) as admin_count,
       SUM(CASE WHEN NOT is_admin THEN 1 ELSE 0 END) as regular_users
FROM public.profiles;

-- 활동 로그 통계
SELECT category, COUNT(*) as log_count 
FROM public.logs 
GROUP BY category 
ORDER BY log_count DESC;

-- 근무 스케줄 통계
SELECT 
  dt.name_ko as duty_type,
  COUNT(*) as schedule_count
FROM public.duty_schedules ds
JOIN public.duty_types dt ON ds.duty_type_id = dt.id
GROUP BY dt.name_ko
ORDER BY schedule_count DESC;

-- 수술방별 사용 통계
SELECT 
  or.room_name,
  COUNT(DISTINCT ds.user_id) as unique_users,
  COUNT(*) as total_schedules
FROM public.duty_schedules ds
JOIN public.operating_rooms or ON ds.operating_room_id = or.id
GROUP BY or.room_name
ORDER BY total_schedules DESC;
```

## ⚠️ 주의사항

1. **데이터 초기화**: 기존 데이터가 있는 경우 1단계의 정리 스크립트를 먼저 실행하세요.
2. **실행 시간**: 대량의 데이터를 생성하므로 실행에 1-2분 정도 소요될 수 있습니다.
3. **메모리 사용량**: Supabase의 무료 플랜 제한을 고려하여 데이터 양을 조정했습니다.
4. **인증**: 생성된 사용자들은 이메일 인증이 완료된 상태로 생성됩니다.

## 🎯 데모 시나리오

더미 데이터를 활용한 데모 시나리오:

1. **관리자 로그인** → 전체 사용자 현황 확인
2. **세부 통계 대시보드** → 수술방별, 부서별 통계 확인
3. **개별 사용자 분석** → 특정 사용자의 6/12/18/24개월 근무 내역
4. **자동 스케줄링** → AI 기반 듀티 스케줄링 결과 확인
5. **활동 로그 조회** → 다양한 카테고리별 활동 내역 확인

이 더미 데이터를 통해 CareerLog의 모든 기능을 실제 환경과 유사하게 데모할 수 있습니다. 