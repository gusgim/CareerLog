# CareeLog 🏥

> **개인 경력 & 성과 관리 컨설턴트**  
> 의료진을 위한 30초 만에 기록하고, 전문적인 보고서를 생성하는 경력 관리 플랫폼

## 🎯 프로젝트 개요

CareeLog는 의료진, 특히 수술실과 회복실에서 근무하는 간호사들을 위한 개인 경력 관리 시스템입니다. 매월 2-3시간을 소비하며 과거 활동을 기억하고 문서화하는 어려움을 해결하고, 30초 만에 활동을 기록하고 필요할 때 전문적인 성과 보고서를 생성할 수 있습니다.

### 핵심 가치 제안
- **⚡ 빠른 기록**: 30초 만에 활동 로그 작성
- **🎯 정확한 추적**: 체계적인 카테고리와 태그 시스템
- **📊 전문적 보고서**: 성과 평가용 PDF 보고서 자동 생성
- **🔒 개인정보 보호**: 사용자별 데이터 완전 분리

## 🏗️ 기술 스택

### Frontend
- **Next.js 14** (App Router)
- **React 18** + TypeScript
- **Tailwind CSS** + shadcn/ui
- **React Hook Form** + Zod 검증

### Backend & Database
- **Supabase** (PostgreSQL + Auth + Storage)
- **tRPC** (타입 안전한 API)
- **Row Level Security** (RLS)

### Development Tools
- **Turborepo** (Monorepo 관리)
- **ESLint** + **Prettier** (코드 품질)
- **TypeScript** (타입 안전성)

## 📁 프로젝트 구조

```
careerlog-monorepo/
├── apps/
│   ├── web/                 # Next.js 웹 애플리케이션
│   │   ├── src/
│   │   │   ├── app/         # App Router 페이지
│   │   │   ├── components/  # React 컴포넌트
│   │   │   ├── lib/         # 유틸리티 & 설정
│   │   │   └── types/       # TypeScript 타입
│   │   └── package.json
│   └── mobile/              # React Native 앱 (향후 개발)
├── packages/
│   ├── ui/                  # 공유 UI 컴포넌트
│   ├── db/                  # 데이터베이스 스키마 & 마이그레이션
│   └── api-types/           # 공유 API 타입
├── package.json
└── turbo.json
```

## 🚀 시작하기

### 1. 프로젝트 클론 & 설치

```bash
git clone [repository-url]
cd careerlog-monorepo
npm install
```

### 2. 환경 변수 설정

```bash
cd apps/web
cp .env.example .env.local
```

`.env.local` 파일에서 다음 값들을 설정하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SECRET_KEY=your_supabase_secret_key

# 애플리케이션 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. 데이터베이스 설정

Supabase 프로젝트를 생성하고 다음 스키마를 실행하세요:

```bash
# 스키마 파일 위치
packages/db/schema.sql
```

### 4. 개발 서버 실행

```bash
npm run dev
```

웹 애플리케이션이 `http://localhost:3000`에서 실행됩니다.

## 📊 데이터베이스 스키마

### 주요 테이블

#### `profiles` - 사용자 프로필
- `id`: 사용자 UUID (auth.users 참조)
- `full_name`: 전체 이름
- `department`: 부서 (예: 마취과, 외과)
- `role`: 역할 (예: 간호사, 의사)
- `hospital`: 병원명

#### `logs` - 활동 로그
- `id`: 로그 고유 ID
- `user_id`: 사용자 UUID
- `log_date`: 활동 날짜
- `category`: 카테고리 (근무, 교육, 성과, 혁신, 연구, 기타)
- `subcategory`: 세부 카테고리
- `details`: 활동 상세 내용
- `tags`: 태그 배열
- `attachments`: 첨부파일 URL 배열
- `duration_hours`: 소요 시간

#### `categories` - 카테고리 정의
- `name`: 영문 카테고리명
- `name_ko`: 한국어 카테고리명
- `color`: 카테고리 색상
- `emoji`: 카테고리 이모지
- `subcategories`: 하위 카테고리 배열

## 💡 주요 기능

### 1. 빠른 로그 입력
- 미리 정의된 카테고리와 서브카테고리
- 태그 기반 분류 시스템
- 선택적 파일 첨부 (인증서 등)

### 2. 대시보드
- 시간순 활동 로그 표시
- 카테고리별 색상 코딩
- 날짜 범위 필터링
- 키워드 검색

### 3. 보고서 생성
- 날짜 범위 선택
- 카테고리별 필터링
- 전문적인 PDF 보고서 출력
- 성과 평가용 포맷

### 4. 사용자 관리
- Supabase Auth 기반 인증
- 소셜 로그인 지원 (Google, Apple)
- 완전한 데이터 분리 (RLS)

## 🎨 디자인 시스템

### 색상 팔레트
- **근무** (🏥): 파란색 (`#3B82F6`)
- **교육** (📚): 초록색 (`#10B981`)
- **성과** (🏆): 보라색 (`#8B5CF6`)
- **혁신** (💡): 주황색 (`#F59E0B`)
- **연구** (🔬): 빨간색 (`#EF4444`)
- **기타** (📝): 회색 (`#6B7280`)

### UI 컴포넌트
- **Toss 스타일** 디자인 언어
- **glassmorphism** 효과
- **그라데이션** 배경
- **반응형 디자인** (모바일 우선)

## 🔧 개발 가이드

### 스크립트 명령어

```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 타입 체크
npm run type-check

# 린트 검사
npm run lint

# 데이터베이스 관리
npm run db:migrate
npm run db:generate
```

### 코딩 컨벤션

1. **TypeScript**: 모든 코드에 타입 안전성 적용
2. **함수형 컴포넌트**: React Hooks 사용
3. **ES6+ 문법**: 화살표 함수, 구조분해할당 등
4. **명확한 네이밍**: 변수, 함수, 컴포넌트명 명시적 작성
5. **단일 책임 원칙**: 작고 집중된 함수/컴포넌트 작성

## 📝 로드맵

### Phase 1: MVP (현재)
- ✅ 프로젝트 구조 설정
- ✅ 데이터베이스 스키마 설계
- 🔄 빠른 로그 입력 기능
- 🔄 대시보드 구현
- ⏳ PDF 보고서 생성

### Phase 2: 사용자 경험 개선
- ⏳ 푸시 알림 시스템
- ⏳ 캘린더 보기
- ⏳ 개인 분석 대시보드
- ⏳ 모바일 앱 개발

### Phase 3: 팀 협업
- ⏳ 매니저 대시보드
- ⏳ 부서별 공지사항
- ⏳ 카테고리 템플릿 공유

### Phase 4: 지능형 기능
- ⏳ AI 기반 요약 생성
- ⏳ 목표 설정 및 추적
- ⏳ 병원 시스템 연동

## 🤝 기여하기

1. Fork 프로젝트
2. Feature 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 Push (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 📞 연락처

문의사항이 있으시면 Issues 탭을 통해 연락해주세요.

---

**Made with ❤️ for Healthcare Professionals** 