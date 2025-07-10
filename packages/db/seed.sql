-- Seed data for testing
-- Note: This will be populated with actual user data after authentication is set up

-- Sample log entries (these will be inserted after user creation)
/*
INSERT INTO public.logs (
  user_id,
  log_date,
  category,
  subcategory,
  details,
  tags,
  duration_hours
) VALUES
  (
    'USER_UUID_PLACEHOLDER',
    '2024-01-15',
    'clinical',
    '수술실',
    'OR #3에서 신경외과 수술 (개두술) 진행. 동맥관 삽입을 도와드리고 유도성 저혈압 중 활력징후를 면밀히 모니터링했습니다.',
    ARRAY['신경외과', '동맥관삽입', '저혈압'],
    6.5
  ),
  (
    'USER_UUID_PLACEHOLDER',
    '2024-01-14',
    'education',
    '내부 세미나',
    '월례 마취과 Grand Round 참석. 주제: 소아 마취의 새로운 기법에 대한 발표를 들었습니다.',
    ARRAY['소아마취', '지속교육'],
    2.0
  ),
  (
    'USER_UUID_PLACEHOLDER',
    '2024-01-13',
    'performance',
    '케이스 스터디',
    '복잡한 심장 수술 케이스 분석 및 발표. 팀원들과 함께 합병증 관리 방안을 논의했습니다.',
    ARRAY['심장수술', '합병증관리', '팀워크'],
    3.0
  ),
  (
    'USER_UUID_PLACEHOLDER',
    '2024-01-12',
    'innovation',
    '프로세스 개선',
    '수술 전 체크리스트 개선 아이디어 제안. 환자 안전성 향상을 위한 새로운 프로토콜 검토.',
    ARRAY['환자안전', '프로토콜개선'],
    1.5
  ),
  (
    'USER_UUID_PLACEHOLDER',
    '2024-01-11',
    'research',
    '논문 작성',
    '마취 후 회복실 환자 관리에 대한 연구 논문 초안 작성. 데이터 분석 결과를 정리했습니다.',
    ARRAY['회복실관리', '데이터분석', '논문작성'],
    4.0
  );
*/

-- The actual seed data will be minimal since most data is user-specific
-- Categories are already inserted in the schema.sql file

-- Insert some sample profiles for testing (these will be replaced with real user data)
/*
INSERT INTO public.profiles (
  id,
  full_name,
  department,
  role,
  hospital
) VALUES
  (
    'USER_UUID_PLACEHOLDER',
    '김지수',
    '마취과',
    '간호사',
    '서울대학교병원'
  );
*/

-- Note: Actual user data will be created through the application's authentication flow 