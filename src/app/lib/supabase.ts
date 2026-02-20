import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Replace these with your actual Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'teacher' | 'student';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: string;
  name: string;
  subject: string;
  grade_level: string;
  section?: string;
  teacher_id: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  class_id: string;
  enrolled_at: string;
  status: 'active' | 'inactive' | 'completed';
}

export interface EngagementRecord {
  id: string;
  student_id: string;
  class_id: string;
  session_date: string;
  engagement_level: 'active' | 'passive' | 'disengaged';
  engagement_score: number;
  duration_minutes?: number;
  notes?: string;
  created_at: string;
}

export interface MasteryRecord {
  id: string;
  student_id: string;
  class_id: string;
  concept: string;
  mastery_level: number;
  assessment_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  class_id: string;
  name: string;
  description?: string;
  due_date?: string;
  status: 'active' | 'completed' | 'cancelled';
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectTeam {
  id: string;
  project_id: string;
  name: string;
  progress: number;
  created_at: string;
}

export interface Alert {
  id: string;
  teacher_id: string;
  class_id?: string;
  alert_type: 'mastery_threshold' | 'engagement_drop' | 'project_milestone' | 'general';
  priority: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface AISuggestion {
  id: string;
  teacher_id: string;
  student_id?: string;
  class_id?: string;
  suggestion_type: 'intervention' | 'practice' | 'feedback' | 'grouping';
  content: string;
  reasoning?: string;
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  teacher_feedback?: string;
  created_at: string;
  reviewed_at?: string;
}

export interface Assessment {
  id: string;
  class_id: string;
  title: string;
  description?: string;
  assessment_type: 'quiz' | 'test' | 'assignment' | 'project';
  total_points?: number;
  due_date?: string;
  created_by: string;
  created_at: string;
}

export interface AssessmentResult {
  id: string;
  assessment_id: string;
  student_id: string;
  score?: number;
  max_score?: number;
  percentage?: number;
  submitted_at?: string;
  graded_at?: string;
  feedback?: string;
}

export interface TeacherSettings {
  id: string;
  teacher_id: string;
  notification_mastery_threshold: boolean;
  notification_engagement_drop: boolean;
  notification_project_milestone: boolean;
  notification_weekly_summary: boolean;
  mastery_threshold: number;
  engagement_threshold: number;
  created_at: string;
  updated_at: string;
}
