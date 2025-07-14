# 관리자 계정 설정 및 더미 데이터 확인 가이드

## 🎯 목적
Production 환경에서 `admin@careerlog.demo` 계정으로 로그인해서 77개 더미 사용자 데이터를 확인할 수 있도록 설정합니다.

## 📋 준비사항
- Supabase 프로젝트 대시보드 접근 권한
- SQL Editor 사용 권한

## 🔧 단계별 설정

### 1단계: 더미 데이터 상태 확인

1. **Supabase Dashboard** → **SQL Editor**로 이동
2. `packages/db/check-dummy-data.sql` 파일의 내용을 복사
3. SQL Editor에 붙여넣기하고 실행
4. 결과를 확인해서 더미 데이터가 있는지 체크

**예상 결과:**
```
✅ 더미 데이터 존재: 77+ users
✅ 충분한 로그 데이터: 15,000+ logs  
✅ 카테고리 설정됨: 4+ categories
✅ 수술실 설정됨: 10+ operating rooms
```

### 2단계: 관리자 계정 비밀번호 설정

1. **Supabase Dashboard** → **SQL Editor**로 이동
2. `packages/db/setup-admin-password.sql` 파일의 내용을 복사
3. SQL Editor에 붙여넣기하고 실행
4. 성공 메시지 확인

**성공 시 메시지:**
```
✅ admin@careerlog.demo 계정 비밀번호가 설정되었습니다.
📧 이메일: admin@careerlog.demo
🔑 비밀번호: admin123!
```

### 3단계: 로그인 테스트

1. **Production 사이트**로 이동
2. 로그인 페이지에서 다음 정보로 로그인:
   - **이메일**: `admin@careerlog.demo`
   - **비밀번호**: `admin123!`

### 4단계: 더미 데이터 확인

로그인 후 다음 페이지들을 확인:

1. **`/admin/users`** → 77개 더미 사용자 확인
2. **`/admin/analytics`** → 15,000+ 활동 로그 확인
3. **`/dashboard`** → 전체 시스템 현황 확인

## 🔍 문제 해결

### 더미 데이터가 없는 경우
```sql
-- seed-demo-data.sql 실행 필요
-- Supabase SQL Editor에서 packages/db/seed-demo-data.sql 전체 실행
```

### 로그인이 안 되는 경우
```sql
-- 비밀번호 재설정
-- setup-admin-password.sql 다시 실행
```

### 권한이 없는 경우
```sql
-- 관리자 권한 확인
SELECT email, is_admin FROM public.profiles WHERE email = 'admin@careerlog.demo';

-- 권한 설정 (필요시)
UPDATE public.profiles SET is_admin = true WHERE email = 'admin@careerlog.demo';
```

## 📊 더미 데이터 구성

- 👥 **77명의 간호사** (다양한 부서, 경력)
- 📊 **15,000+ 활동 로그** (최근 2년간)
- 🏥 **10개 수술실** (다양한 전문 분야)
- 📚 **다양한 교육/자격증** 데이터
- 📅 **40,000+ 근무 스케줄** 데이터
- 🎯 **성과 및 혁신** 활동 기록

## 🎉 성공 확인

모든 설정이 완료되면:
- ✅ `admin@careerlog.demo`로 로그인 가능
- ✅ 관리자 페이지 모든 기능 접근 가능  
- ✅ 77개 사용자 데이터 조회 가능
- ✅ 상세한 분석 데이터 확인 가능

---

**📞 문의사항**: 설정 중 문제가 발생하면 개발팀에 문의하세요! 