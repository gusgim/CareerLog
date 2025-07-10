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
  avatar_url TEXT
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
  status TEXT DEFAULT 'active' -- active, archived, deleted
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

-- Create policies for logs
DROP POLICY IF EXISTS "Users can manage their own logs" ON public.logs;
CREATE POLICY "Users can manage their own logs" 
  ON public.logs FOR ALL 
  USING (auth.uid() = user_id);

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON public.logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_log_date ON public.logs(log_date);
CREATE INDEX IF NOT EXISTS idx_logs_category ON public.logs(category);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON public.logs(created_at);
CREATE INDEX IF NOT EXISTS idx_logs_tags ON public.logs USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_logs_details_search ON public.logs USING GIN(to_tsvector('english', details));

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