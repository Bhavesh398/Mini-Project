-- AMPLIFY Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes table
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  section TEXT,
  teacher_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  color TEXT DEFAULT 'blue',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student enrollments
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  UNIQUE(student_id, class_id)
);

-- Engagement tracking
CREATE TABLE IF NOT EXISTS public.engagement_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  engagement_level TEXT CHECK (engagement_level IN ('active', 'passive', 'disengaged')),
  engagement_score INTEGER CHECK (engagement_score >= 0 AND engagement_score <= 100),
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mastery tracking
CREATE TABLE IF NOT EXISTS public.mastery_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  concept TEXT NOT NULL,
  mastery_level INTEGER CHECK (mastery_level >= 0 AND mastery_level <= 100),
  assessment_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects (PBL)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project teams
CREATE TABLE IF NOT EXISTS public.project_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project team members
CREATE TABLE IF NOT EXISTS public.project_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES public.project_teams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  contribution_score INTEGER CHECK (contribution_score >= 0 AND contribution_score <= 100),
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, student_id)
);

-- Assessments
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assessment_type TEXT CHECK (assessment_type IN ('quiz', 'test', 'assignment', 'project')),
  total_points INTEGER,
  due_date TIMESTAMPTZ,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student assessment results
CREATE TABLE IF NOT EXISTS public.assessment_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  score INTEGER,
  max_score INTEGER,
  percentage DECIMAL(5,2),
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  feedback TEXT,
  UNIQUE(assessment_id, student_id)
);

-- Alerts and notifications
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  alert_type TEXT CHECK (alert_type IN ('mastery_threshold', 'engagement_drop', 'project_milestone', 'general')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI suggestions (teacher approval required)
CREATE TABLE IF NOT EXISTS public.ai_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  suggestion_type TEXT CHECK (suggestion_type IN ('intervention', 'practice', 'feedback', 'grouping')),
  content TEXT NOT NULL,
  reasoning TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'modified')),
  teacher_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- Teacher settings
CREATE TABLE IF NOT EXISTS public.teacher_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  notification_mastery_threshold BOOLEAN DEFAULT true,
  notification_engagement_drop BOOLEAN DEFAULT true,
  notification_project_milestone BOOLEAN DEFAULT true,
  notification_weekly_summary BOOLEAN DEFAULT false,
  mastery_threshold INTEGER DEFAULT 70 CHECK (mastery_threshold >= 0 AND mastery_threshold <= 100),
  engagement_threshold INTEGER DEFAULT 70 CHECK (engagement_threshold >= 0 AND engagement_threshold <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Class schedule
CREATE TABLE IF NOT EXISTS public.class_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  topic TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mastery_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_schedule ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Teachers can view their classes
CREATE POLICY "Teachers can view their classes" ON public.classes
  FOR SELECT USING (
    teacher_id = auth.uid() OR
    auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
  );

CREATE POLICY "Teachers can manage their classes" ON public.classes
  FOR ALL USING (teacher_id = auth.uid() OR auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- Students can view classes they're enrolled in
CREATE POLICY "Students can view enrolled classes" ON public.classes
  FOR SELECT USING (
    id IN (SELECT class_id FROM public.enrollments WHERE student_id = auth.uid())
  );

-- Teachers can view engagement for their students
CREATE POLICY "Teachers view student engagement" ON public.engagement_records
  FOR SELECT USING (
    class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid()) OR
    auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
  );

-- Teachers can manage engagement records
CREATE POLICY "Teachers manage engagement" ON public.engagement_records
  FOR ALL USING (
    class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid()) OR
    auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
  );

-- Similar policies for other tables
CREATE POLICY "Teachers view mastery" ON public.mastery_records
  FOR SELECT USING (
    class_id IN (SELECT id FROM public.classes WHERE teacher_id = auth.uid()) OR
    student_id = auth.uid() OR
    auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
  );

CREATE POLICY "Teachers manage alerts" ON public.alerts
  FOR ALL USING (teacher_id = auth.uid() OR auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

CREATE POLICY "Teachers manage AI suggestions" ON public.ai_suggestions
  FOR ALL USING (teacher_id = auth.uid() OR auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- Functions for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mastery_records_updated_at BEFORE UPDATE ON public.mastery_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_settings_updated_at BEFORE UPDATE ON public.teacher_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_classes_teacher ON public.classes(teacher_id);
CREATE INDEX idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX idx_enrollments_class ON public.enrollments(class_id);
CREATE INDEX idx_engagement_student_class ON public.engagement_records(student_id, class_id);
CREATE INDEX idx_engagement_date ON public.engagement_records(session_date);
CREATE INDEX idx_mastery_student_class ON public.mastery_records(student_id, class_id);
CREATE INDEX idx_alerts_teacher ON public.alerts(teacher_id, is_read);
CREATE INDEX idx_ai_suggestions_teacher ON public.ai_suggestions(teacher_id, status);
