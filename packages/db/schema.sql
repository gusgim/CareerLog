-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  full_name TEXT,
  department TEXT,
  role TEXT,
  hospital TEXT,
  phone TEXT,
  avatar_url TEXT,
  -- 추가: 근무자 경력 정보
  years_of_experience INTEGER DEFAULT 0,
  hire_date DATE,
  employee_id TEXT UNIQUE,
  is_admin BOOLEAN DEFAULT false
);

-- Create operating_rooms table (수술방 정보)
CREATE TABLE IF NOT EXISTS public.operating_rooms (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  room_number TEXT NOT NULL UNIQUE,
  room_name TEXT NOT NULL,
  department TEXT,
  capacity INTEGER DEFAULT 1,
  specialty_type TEXT, -- 'cardiac', 'neuro', 'general', 'orthopedic', etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create duty_types table (듀티 타입 정보)
CREATE TABLE IF NOT EXISTS public.duty_types (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL UNIQUE,
  name_ko TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6B7280',
  required_qualifications TEXT[], -- 필요한 자격 요건들
  max_hours_per_week INTEGER DEFAULT 40,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create qualifications table (자격/교육 유형)
CREATE TABLE IF NOT EXISTS public.qualifications (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL UNIQUE,
  name_ko TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'education', 'certification', 'experience', 'training'
  required_for_rooms TEXT[], -- 필요한 수술방들
  required_experience_years INTEGER DEFAULT 0,
  is_mandatory BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create staff_qualifications table (근무자별 자격/교육 정보)
CREATE TABLE IF NOT EXISTS public.staff_qualifications (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  qualification_id BIGINT NOT NULL REFERENCES public.qualifications(id) ON DELETE CASCADE,
  obtained_date DATE,
  expiry_date DATE,
  status TEXT DEFAULT 'active', -- 'active', 'expired', 'suspended'
  notes TEXT,
  certificate_url TEXT, -- Supabase storage URL
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, qualification_id)
);

-- Create duty_schedules table (근무 스케줄)
CREATE TABLE IF NOT EXISTS public.duty_schedules (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duty_date DATE NOT NULL,
  duty_type_id BIGINT REFERENCES public.duty_types(id),
  operating_room_id BIGINT REFERENCES public.operating_rooms(id),
  shift_start TIME NOT NULL,
  shift_end TIME NOT NULL,
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'no_show'
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create logs table (main activity log)
CREATE TABLE IF NOT EXISTS public.logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  log_date DATE NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  details TEXT NOT NULL,
  tags TEXT[],
  attachments TEXT[], -- Array of URLs pointing to Supabase Storage
  metadata JSONB DEFAULT '{}',
  duration_hours DECIMAL(5,2),
  status TEXT DEFAULT 'active', -- active, archived, deleted
  -- 추가: 스케줄링 정보
  duty_schedule_id BIGINT REFERENCES public.duty_schedules(id),
  operating_room_id BIGINT REFERENCES public.operating_rooms(id)
);

-- Create categories table for predefined categories
CREATE TABLE IF NOT EXISTS public.categories (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL UNIQUE,
  name_ko TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6B7280',
  emoji TEXT DEFAULT '📝',
  subcategories TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reports table for saved reports
CREATE TABLE IF NOT EXISTS public.reports (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  filters JSONB DEFAULT '{}',
  file_url TEXT,
  file_type TEXT DEFAULT 'pdf',
  status TEXT DEFAULT 'generated' -- generated, processing, failed
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operating_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duty_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duty_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Admin policies for profiles (관리자는 모든 프로필 조회 가능)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create policies for logs
DROP POLICY IF EXISTS "Users can manage their own logs" ON public.logs;
CREATE POLICY "Users can manage their own logs" 
  ON public.logs FOR ALL 
  USING (auth.uid() = user_id);

-- Admin policies for logs
DROP POLICY IF EXISTS "Admins can view all logs" ON public.logs;
CREATE POLICY "Admins can view all logs" 
  ON public.logs FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create policies for categories (public read)
DROP POLICY IF EXISTS "Categories are publicly readable" ON public.categories;
CREATE POLICY "Categories are publicly readable" 
  ON public.categories FOR SELECT 
  USING (true);

-- Create policies for reports
DROP POLICY IF EXISTS "Users can manage their own reports" ON public.reports;
CREATE POLICY "Users can manage their own reports" 
  ON public.reports FOR ALL 
  USING (auth.uid() = user_id);

-- Operating rooms policies
DROP POLICY IF EXISTS "Operating rooms are readable by authenticated users" ON public.operating_rooms;
CREATE POLICY "Operating rooms are readable by authenticated users" 
  ON public.operating_rooms FOR SELECT 
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage operating rooms" ON public.operating_rooms;
CREATE POLICY "Admins can manage operating rooms" 
  ON public.operating_rooms FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Duty types policies
DROP POLICY IF EXISTS "Duty types are readable by authenticated users" ON public.duty_types;
CREATE POLICY "Duty types are readable by authenticated users" 
  ON public.duty_types FOR SELECT 
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage duty types" ON public.duty_types;
CREATE POLICY "Admins can manage duty types" 
  ON public.duty_types FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Qualifications policies
DROP POLICY IF EXISTS "Qualifications are readable by authenticated users" ON public.qualifications;
CREATE POLICY "Qualifications are readable by authenticated users" 
  ON public.qualifications FOR SELECT 
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage qualifications" ON public.qualifications;
CREATE POLICY "Admins can manage qualifications" 
  ON public.qualifications FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Staff qualifications policies
DROP POLICY IF EXISTS "Users can view their own qualifications" ON public.staff_qualifications;
CREATE POLICY "Users can view their own qualifications" 
  ON public.staff_qualifications FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own qualifications" ON public.staff_qualifications;
CREATE POLICY "Users can manage their own qualifications" 
  ON public.staff_qualifications FOR ALL 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all staff qualifications" ON public.staff_qualifications;
CREATE POLICY "Admins can view all staff qualifications" 
  ON public.staff_qualifications FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can manage all staff qualifications" ON public.staff_qualifications;
CREATE POLICY "Admins can manage all staff qualifications" 
  ON public.staff_qualifications FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Duty schedules policies
DROP POLICY IF EXISTS "Users can view their own schedules" ON public.duty_schedules;
CREATE POLICY "Users can view their own schedules" 
  ON public.duty_schedules FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all schedules" ON public.duty_schedules;
CREATE POLICY "Admins can manage all schedules" 
  ON public.duty_schedules FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON public.logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_log_date ON public.logs(log_date);
CREATE INDEX IF NOT EXISTS idx_logs_category ON public.logs(category);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON public.logs(created_at);
CREATE INDEX IF NOT EXISTS idx_logs_tags ON public.logs USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_logs_details_search ON public.logs USING GIN(to_tsvector('english', details));
CREATE INDEX IF NOT EXISTS idx_logs_operating_room_id ON public.logs(operating_room_id);
CREATE INDEX IF NOT EXISTS idx_logs_duty_schedule_id ON public.logs(duty_schedule_id);

CREATE INDEX IF NOT EXISTS idx_staff_qualifications_user_id ON public.staff_qualifications(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_qualifications_qualification_id ON public.staff_qualifications(qualification_id);
CREATE INDEX IF NOT EXISTS idx_staff_qualifications_status ON public.staff_qualifications(status);

CREATE INDEX IF NOT EXISTS idx_duty_schedules_user_id ON public.duty_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_duty_schedules_duty_date ON public.duty_schedules(duty_date);
CREATE INDEX IF NOT EXISTS idx_duty_schedules_operating_room_id ON public.duty_schedules(operating_room_id);
CREATE INDEX IF NOT EXISTS idx_duty_schedules_duty_type_id ON public.duty_schedules(duty_type_id);

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_logs
  BEFORE UPDATE ON public.logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_reports
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_operating_rooms
  BEFORE UPDATE ON public.operating_rooms
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_staff_qualifications
  BEFORE UPDATE ON public.staff_qualifications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_duty_schedules
  BEFORE UPDATE ON public.duty_schedules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert default categories
INSERT INTO public.categories (name, name_ko, description, color, emoji, subcategories) VALUES
  ('clinical', '근무', '임상 업무 관련 활동', '#3B82F6', '🏥', ARRAY['수술실', '회복실', '환자 상담', '응급 상황', '병동 관리']),
  ('education', '교육', '교육 및 훈련 관련 활동', '#10B981', '📚', ARRAY['내부 세미나', '외부 컨퍼런스', '인증 시험', '온라인 강의', '멘토링']),
  ('performance', '성과', '성과 및 업적 관련 활동', '#8B5CF6', '🏆', ARRAY['임상 연구', '케이스 스터디', '프로세스 개선', '품질 향상', '환자 만족도']),
  ('innovation', '혁신', '혁신 및 개선 관련 활동', '#F59E0B', '💡', ARRAY['새로운 기술 도입', '워크플로우 개선', '팀 프로젝트', '아이디어 제안']),
  ('research', '연구', '연구 및 학술 활동', '#EF4444', '🔬', ARRAY['논문 작성', '학회 발표', '연구 프로젝트', '데이터 분석']),
  ('other', '기타', '기타 활동', '#6B7280', '📝', ARRAY['회의 참석', '행정 업무', '자원봉사', '기타'])
ON CONFLICT (name) DO UPDATE SET
  name_ko = EXCLUDED.name_ko,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  emoji = EXCLUDED.emoji,
  subcategories = EXCLUDED.subcategories;

-- Insert default operating rooms
INSERT INTO public.operating_rooms (room_number, room_name, department, capacity, specialty_type) VALUES
  ('OR1', '수술실 1호', '심장외과', 8, 'cardiac'),
  ('OR2', '수술실 2호', '신경외과', 6, 'neuro'),
  ('OR3', '수술실 3호', '일반외과', 6, 'general'),
  ('OR4', '수술실 4호', '정형외과', 6, 'orthopedic'),
  ('OR5', '수술실 5호', '산부인과', 6, 'gynecology'),
  ('OR6', '수술실 6호', '소아외과', 6, 'pediatric'),
  ('RR1', '회복실 A', '회복실', 10, 'recovery'),
  ('RR2', '회복실 B', '회복실', 10, 'recovery')
ON CONFLICT (room_number) DO UPDATE SET
  room_name = EXCLUDED.room_name,
  department = EXCLUDED.department,
  capacity = EXCLUDED.capacity,
  specialty_type = EXCLUDED.specialty_type;

-- Insert default duty types
INSERT INTO public.duty_types (name, name_ko, description, color, required_qualifications, max_hours_per_week) VALUES
  ('operating_room', '수술실 근무', '수술실에서의 간호 업무', '#DC2626', ARRAY['OR_BASIC', 'CPR_CERTIFICATION'], 40),
  ('recovery_room', '회복실 근무', '회복실에서의 간호 업무', '#059669', ARRAY['RR_BASIC', 'CPR_CERTIFICATION'], 40),
  ('on_call', '당직 근무', '야간 및 응급 상황 대응', '#7C3AED', ARRAY['EMERGENCY_RESPONSE', 'CPR_CERTIFICATION'], 16),
  ('day_shift', '주간 근무', '정규 주간 근무', '#2563EB', ARRAY['BASIC_NURSING'], 40),
  ('night_shift', '야간 근무', '정규 야간 근무', '#DC2626', ARRAY['NIGHT_DUTY', 'CPR_CERTIFICATION'], 40)
ON CONFLICT (name) DO UPDATE SET
  name_ko = EXCLUDED.name_ko,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  required_qualifications = EXCLUDED.required_qualifications,
  max_hours_per_week = EXCLUDED.max_hours_per_week;

-- Insert default qualifications
INSERT INTO public.qualifications (name, name_ko, description, category, required_for_rooms, required_experience_years, is_mandatory) VALUES
  ('OR_BASIC', '수술실 기본 자격', '수술실 근무를 위한 기본 교육 이수', 'training', ARRAY['OR1', 'OR2', 'OR3', 'OR4', 'OR5', 'OR6'], 0, true),
  ('OR_CARDIAC', '심장수술실 자격', '심장수술실 근무를 위한 전문 교육', 'training', ARRAY['OR1'], 6, true),
  ('OR_NEURO', '신경수술실 자격', '신경수술실 근무를 위한 전문 교육', 'training', ARRAY['OR2'], 5, true),
  ('RR_BASIC', '회복실 기본 자격', '회복실 근무를 위한 기본 교육', 'training', ARRAY['RR1', 'RR2'], 2, true),
  ('CPR_CERTIFICATION', 'CPR 인증', '심폐소생술 인증', 'certification', ARRAY[], 0, true),
  ('EMERGENCY_RESPONSE', '응급처치 자격', '응급상황 대응 능력', 'training', ARRAY[], 3, false),
  ('BASIC_NURSING', '간호사 기본 자격', '간호사 면허 및 기본 역량', 'certification', ARRAY[], 0, true),
  ('NIGHT_DUTY', '야간근무 자격', '야간 근무 수행 능력', 'training', ARRAY[], 1, false),
  ('ANESTHESIA_ASSIST', '마취 보조 자격', '마취과 업무 보조 가능', 'training', ARRAY['OR1', 'OR2', 'OR3'], 4, false),
  ('SURGICAL_TECH', '수술 기술 자격', '고급 수술 보조 기술', 'training', ARRAY[], 5, false)
ON CONFLICT (name) DO UPDATE SET
  name_ko = EXCLUDED.name_ko,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  required_for_rooms = EXCLUDED.required_for_rooms,
  required_experience_years = EXCLUDED.required_experience_years,
  is_mandatory = EXCLUDED.is_mandatory; 