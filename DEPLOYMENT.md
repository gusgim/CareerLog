# 🚀 CareerLog 배포 가이드

## 📋 배포 준비사항

### 1. Supabase 프로젝트 설정

1. [Supabase 콘솔](https://supabase.com/dashboard)에 로그인
2. **New Project** 클릭하여 새 프로젝트 생성
3. 프로젝트 이름: `careerlog-production`
4. 데이터베이스 비밀번호 설정 및 저장
5. 리전 선택: **Northeast Asia (Seoul)** 권장

### 2. 데이터베이스 스키마 설정

Supabase 프로젝트가 생성된 후:

1. **SQL Editor**로 이동
2. `packages/db/schema.sql` 파일 내용을 복사
3. 쿼리 실행으로 테이블 생성
4. **Database** → **Tables**에서 테이블 생성 확인

### 3. 환경변수 확인

Supabase 프로젝트 **Settings** → **API**에서 다음 값들 복사:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SECRET_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

---

## 🔧 Vercel 배포 단계

### 1. GitHub 레포지토리 준비

```bash
# Git 초기화 (아직 안했다면)
git init
git add .
git commit -m "feat: 초기 프로젝트 구조 및 모든 기능 구현 완료"

# GitHub에 푸시
git remote add origin https://github.com/your-username/careerlog-v2.git
git push -u origin main
```

### 2. Vercel 배포

1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. **Import Project** 클릭
3. GitHub 레포지토리 선택: `careerlog-v2`
4. **Framework Preset**: Next.js 자동 감지
5. **Root Directory**: `apps/web` 설정
6. **Build Command**: `cd ../.. && npm run build`
7. **Output Directory**: `apps/web/.next`

### 3. 환경변수 설정

Vercel 프로젝트 **Settings** → **Environment Variables**에서 추가:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
- `SUPABASE_SECRET_KEY`
- `NEXT_PUBLIC_APP_URL`

### 4. 배포 확인

- **Deploy** 버튼 클릭
- 빌드 로그 확인
- 배포 완료 후 URL 접속 테스트

---

## 🔐 보안 설정

### Supabase RLS (Row Level Security)

모든 테이블에 RLS가 활성화되어 있는지 확인:

```sql
-- 확인 쿼리
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### 환경변수 보안

- ✅ `NEXT_PUBLIC_*`: 클라이언트 사이드 (브라우저에 노출됨)
- 🔒 `SUPABASE_SECRET_KEY`: 서버 사이드만 (노출 금지)

---

## 📊 배포 후 확인사항

### 기능 테스트 체크리스트

- [ ] 메인 페이지 로딩
- [ ] 사용자 등록/로그인
- [ ] 활동 생성/수정/삭제
- [ ] 캘린더 뷰 (일/주/월/년)
- [ ] 드래그&드롭 기능
- [ ] 관리자 기능 (시스템 로그, 백업, 모니터링)
- [ ] 반응형 디자인 (모바일/태블릿)

### 성능 최적화

- [ ] Lighthouse 스코어 확인
- [ ] 페이지 로딩 속도 테스트
- [ ] 이미지 최적화 확인
- [ ] Core Web Vitals 측정

---

## 🚨 문제 해결

### 일반적인 오류

1. **빌드 실패**: 
   - 환경변수 누락 확인
   - 타입스크립트 오류 수정

2. **데이터베이스 연결 실패**:
   - Supabase URL/키 확인
   - RLS 정책 검증

3. **인증 문제**:
   - Supabase Auth 설정 확인
   - 리디렉션 URL 추가

### 로그 확인

- **Vercel**: Functions 탭에서 서버 로그
- **Supabase**: Dashboard에서 실시간 로그
- **브라우저**: 개발자 도구 콘솔

---

## 📞 지원

배포 중 문제가 발생하면:

1. 오류 메시지 스크린샷
2. Vercel 빌드 로그 
3. 브라우저 콘솔 오류

위 정보와 함께 문의해주세요.

---

**🎉 축하합니다! CareerLog가 성공적으로 배포되었습니다!** 