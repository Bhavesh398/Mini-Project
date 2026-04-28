-- AMPLIFY backend-first schema for Supabase Postgres
-- This schema does NOT depend on Supabase Auth.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enrollment_status') THEN
    CREATE TYPE enrollment_status AS ENUM ('active', 'inactive', 'completed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'engagement_level') THEN
    CREATE TYPE engagement_level AS ENUM ('active', 'passive', 'disengaged');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  section TEXT,
  color TEXT NOT NULL DEFAULT 'blue',
  teacher_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  status enrollment_status NOT NULL DEFAULT 'active',
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (class_id, student_id)
);

CREATE TABLE IF NOT EXISTS engagement_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  engagement_level engagement_level NOT NULL,
  engagement_score INTEGER NOT NULL CHECK (engagement_score BETWEEN 0 AND 100),
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_app_users_updated_at ON app_users;
CREATE TRIGGER trg_app_users_updated_at
BEFORE UPDATE ON app_users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_classes_updated_at ON classes;
CREATE TRIGGER trg_classes_updated_at
BEFORE UPDATE ON classes
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class_id ON enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_engagement_class_date ON engagement_records(class_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_student_date ON engagement_records(student_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mini_project_status') THEN
    CREATE TYPE mini_project_status AS ENUM ('on-track', 'at-risk', 'completed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mini_project_repo_status') THEN
    CREATE TYPE mini_project_repo_status AS ENUM ('synced', 'review', 'behind');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mini_project_activity_type') THEN
    CREATE TYPE mini_project_activity_type AS ENUM ('commit', 'push', 'pull');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mini_project_task_status') THEN
    CREATE TYPE mini_project_task_status AS ENUM ('todo', 'in-progress', 'done');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS mini_projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  team_name TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  next_milestone TEXT NOT NULL,
  status mini_project_status NOT NULL DEFAULT 'on-track',
  summary TEXT NOT NULL,
  branch TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  repo_status mini_project_repo_status NOT NULL DEFAULT 'synced',
  goals TEXT[] NOT NULL DEFAULT '{}',
  available_files TEXT[] NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mini_project_members (
  project_id TEXT NOT NULL REFERENCES mini_projects(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  current_focus TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (project_id, id)
);

CREATE TABLE IF NOT EXISTS mini_project_tasks (
  project_id TEXT NOT NULL REFERENCES mini_projects(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  title TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  status mini_project_task_status NOT NULL DEFAULT 'todo',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (project_id, id)
);

CREATE TABLE IF NOT EXISTS mini_project_activity (
  project_id TEXT NOT NULL REFERENCES mini_projects(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  type mini_project_activity_type NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  branch TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  files TEXT[] NOT NULL DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lines_added INTEGER NOT NULL DEFAULT 0,
  lines_removed INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (project_id, id)
);

CREATE TABLE IF NOT EXISTS mini_project_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id TEXT NOT NULL REFERENCES mini_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mini_project_group_members (
  project_id TEXT NOT NULL,
  group_id UUID NOT NULL REFERENCES mini_project_groups(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL,
  PRIMARY KEY (project_id, group_id, member_id),
  FOREIGN KEY (project_id, member_id)
    REFERENCES mini_project_members(project_id, id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_mini_projects_status ON mini_projects(status);
CREATE INDEX IF NOT EXISTS idx_mini_projects_updated_at ON mini_projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_mini_activity_project_time ON mini_project_activity(project_id, timestamp DESC);

-- Seed one admin user. Replace hash before production.
-- Password for this hash is: Admin@123
INSERT INTO app_users (email, password_hash, full_name, role)
VALUES (
  'admin@institution.edu',
  '$2a$10$YwMiBvYgAKxVNhbbX6Ys8Osx7BfrpsbR9f7D78Dveoxu48UUfZo0G',
  'Platform Admin',
  'admin'
)
ON CONFLICT (email) DO NOTHING;
