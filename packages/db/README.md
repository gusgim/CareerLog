# CareerLog Database Package

CareerLog 프로젝트의 데이터베이스 스키마 및 시드 데이터 관리를 위한 패키지입니다.

## 📁 파일 구조

```
packages/db/
├── schema.sql              # 데이터베이스 스키마 정의
├── seed.sql                # 기본 시드 데이터 (운영용)
├── seed-demo-data.sql      # 데모용 더미 데이터 생성 스크립트
├── clean-demo-data.sql     # 더미 데이터 정리 스크립트
├── README.md               # 이 파일
├── README-demo-setup.md    # 상세 데모 설정 가이드
└── demo-setup-guide.md     # 빠른 데모 설정 가이드
```

## 🗄️ 데이터베이스 스키마

### 주요 테이블
- **`profiles`**: 사용자 프로필 정보
- **`logs`**: 활동 로그 (메인 데이터)
- **`operating_rooms`**: 수술방 정보
- **`duty_types`**: 듀티 타입 정의
- **`duty_schedules`**: 근무 스케줄
- **`qualifications`**: 자격/교육 유형
- **`staff_qualifications`**: 사용자별 자격 정보
- **`categories`**: 활동 카테고리
- **`reports`**: 생성된 리포트

### 관계도
```
auth.users (Supabase Auth)
    ↓ (1:1)
profiles
    ↓ (1:N)
├── logs
├── duty_schedules
├── staff_qualifications
└── reports

operating_rooms ←→ duty_schedules
duty_types ←→ duty_schedules
qualifications ←→ staff_qualifications
```

## 🚀 초기 설정

### 1. 스키마 적용
```bash
# Supabase CLI 사용
supabase db reset --linked
supabase db push

# 또는 Supabase 대시보드에서 schema.sql 실행
```

### 2. 기본 시드 데이터 적용
```bash
# 운영용 기본 데이터
supabase db seed --file packages/db/seed.sql
```

## 🎪 데모 환경 설정

CareerLog의 모든 기능을 데모하기 위한 완전한 더미 데이터를 생성할 수 있습니다.

### 빠른 설정
```bash
# 1. 기존 데이터 정리 (선택사항)
# clean-demo-data.sql 실행

# 2. 더미 데이터 생성  
# seed-demo-data.sql 실행 (Supabase 대시보드)
```

### 생성되는 데이터
- ✅ **78명의 사용자** (관리자 1명 + 일반 사용자 77명)
- ✅ **10개 수술방** (다양한 전문 분야)
- ✅ **6개 듀티 타입** (Day, Evening, Night 등)
- ✅ **10개 자격/교육 유형**
- ✅ **약 15,000개 활동 로그** (2년간)
- ✅ **약 40,000개 근무 스케줄** (2년간)

### 데모 계정
- **관리자**: `admin@careerlog.demo`
- **일반 사용자**: `user1@careerlog.demo` ~ `user77@careerlog.demo`

📖 **상세 가이드**: 
- [빠른 설정 가이드](./demo-setup-guide.md)
- [상세 설정 가이드](./README-demo-setup.md)
- [완전한 데모 가이드](./complete-demo-guide.md)

## 🔧 데이터베이스 관리

### 마이그레이션
```bash
# 스키마 변경 시
supabase db diff --schema public > migration.sql
supabase migration new migration_name
```

### 백업
```bash
# 데이터 백업
pg_dump -h [host] -U [user] -d [database] > backup.sql

# 복원
psql -h [host] -U [user] -d [database] < backup.sql
```

### 성능 모니터링
```sql
-- 느린 쿼리 확인
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC;

-- 인덱스 사용률 확인
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## 🛡️ Row Level Security (RLS)

모든 테이블에 RLS가 적용되어 있습니다:

- **사용자**: 자신의 데이터만 접근 가능
- **관리자**: 모든 데이터 조회 가능 (일부 테이블)
- **공개 데이터**: categories, operating_rooms 등

### RLS 정책 예시
```sql
-- 사용자는 자신의 로그만 관리 가능
CREATE POLICY "Users can manage their own logs" 
  ON public.logs FOR ALL 
  USING (auth.uid() = user_id);

-- 관리자는 모든 로그 조회 가능
CREATE POLICY "Admins can view all logs" 
  ON public.logs FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

## 📊 데이터 검증

### 기본 검증 쿼리
```sql
-- 사용자 수 확인
SELECT COUNT(*) as total_users,
       SUM(CASE WHEN is_admin THEN 1 ELSE 0 END) as admin_count
FROM public.profiles;

-- 카테고리별 로그 분포
SELECT category, COUNT(*) as count
FROM public.logs 
GROUP BY category 
ORDER BY count DESC;

-- 월별 활동 추이
SELECT 
  DATE_TRUNC('month', log_date) as month,
  COUNT(*) as logs_count
FROM public.logs 
GROUP BY month 
ORDER BY month DESC;
```

### 데이터 무결성 검사
```sql
-- 고아 레코드 확인
SELECT COUNT(*) FROM public.logs 
WHERE user_id NOT IN (SELECT id FROM public.profiles);

-- 필수 자격증 미보유자 확인
SELECT p.full_name 
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.staff_qualifications sq
  WHERE sq.user_id = p.id AND sq.qualification_id = 1
);
```

## 🔗 관련 링크

- [Supabase 문서](https://supabase.com/docs)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)
- [CareerLog 프로젝트 메인 README](../../README.md)

## 📞 지원

데이터베이스 관련 문의사항이 있으시면 개발팀에 연락해주세요. 