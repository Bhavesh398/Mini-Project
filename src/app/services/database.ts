import { supabase } from '../lib/supabase';
import type { Class, User, EngagementRecord, MasteryRecord, Project, Alert, TeacherSettings } from '../lib/supabase';

// ============= USER OPERATIONS =============

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data as User;
}

export async function updateUserProfile(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============= CLASS OPERATIONS =============

export async function getTeacherClasses(teacherId: string) {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('name');

  if (error) throw error;
  return data as Class[];
}

export async function getClassById(classId: string) {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('id', classId)
    .single();

  if (error) throw error;
  return data as Class;
}

export async function createClass(classData: Omit<Class, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('classes')
    .insert(classData)
    .select()
    .single();

  if (error) throw error;
  return data as Class;
}

// ============= ENGAGEMENT OPERATIONS =============

export async function getClassEngagement(classId: string, days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('engagement_records')
    .select('*')
    .eq('class_id', classId)
    .gte('session_date', startDate.toISOString().split('T')[0])
    .order('session_date', { ascending: false });

  if (error) throw error;
  return data as EngagementRecord[];
}

export async function getStudentEngagement(studentId: string, classId: string) {
  const { data, error } = await supabase
    .from('engagement_records')
    .select('*')
    .eq('student_id', studentId)
    .eq('class_id', classId)
    .order('session_date', { ascending: false })
    .limit(30);

  if (error) throw error;
  return data as EngagementRecord[];
}

export async function recordEngagement(record: Omit<EngagementRecord, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('engagement_records')
    .insert(record)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getEngagementStats(classId: string) {
  const { data, error } = await supabase
    .from('engagement_records')
    .select('engagement_level, engagement_score')
    .eq('class_id', classId)
    .gte('session_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  if (error) throw error;

  const stats = {
    active: 0,
    passive: 0,
    disengaged: 0,
    avgScore: 0
  };

  if (data && data.length > 0) {
    stats.active = data.filter(r => r.engagement_level === 'active').length;
    stats.passive = data.filter(r => r.engagement_level === 'passive').length;
    stats.disengaged = data.filter(r => r.engagement_level === 'disengaged').length;
    stats.avgScore = data.reduce((sum, r) => sum + (r.engagement_score || 0), 0) / data.length;
  }

  return stats;
}

// ============= MASTERY OPERATIONS =============

export async function getStudentMastery(studentId: string, classId: string) {
  const { data, error } = await supabase
    .from('mastery_records')
    .select('*')
    .eq('student_id', studentId)
    .eq('class_id', classId)
    .order('assessment_date', { ascending: false });

  if (error) throw error;
  return data as MasteryRecord[];
}

export async function getClassMasteryStats(classId: string) {
  const { data, error } = await supabase
    .from('mastery_records')
    .select('student_id, mastery_level')
    .eq('class_id', classId);

  if (error) throw error;

  const students = new Map<string, number[]>();
  data?.forEach(record => {
    if (!students.has(record.student_id)) {
      students.set(record.student_id, []);
    }
    students.get(record.student_id)?.push(record.mastery_level);
  });

  const avgMasteryPerStudent = Array.from(students.entries()).map(([studentId, levels]) => ({
    studentId,
    avgMastery: levels.reduce((sum, level) => sum + level, 0) / levels.length
  }));

  const overallAvg = avgMasteryPerStudent.reduce((sum, s) => sum + s.avgMastery, 0) / avgMasteryPerStudent.length || 0;
  const belowThreshold = avgMasteryPerStudent.filter(s => s.avgMastery < 70).length;
  const mastering = avgMasteryPerStudent.filter(s => s.avgMastery >= 80).length;

  return {
    overallAvg: Math.round(overallAvg),
    belowThreshold,
    mastering,
    students: avgMasteryPerStudent
  };
}

export async function recordMastery(record: Omit<MasteryRecord, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('mastery_records')
    .insert(record)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============= PROJECT OPERATIONS =============

export async function getClassProjects(classId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*, project_teams(id, name, progress)')
    .eq('class_id', classId)
    .eq('status', 'active')
    .order('due_date');

  if (error) throw error;
  return data as (Project & { project_teams: any[] })[];
}

export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single();

  if (error) throw error;
  return data as Project;
}

export async function updateProjectProgress(projectId: string, progress: number) {
  const { data, error } = await supabase
    .from('projects')
    .update({ progress })
    .eq('id', projectId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============= ALERT OPERATIONS =============

export async function getTeacherAlerts(teacherId: string, unreadOnly: boolean = false) {
  let query = supabase
    .from('alerts')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  if (unreadOnly) {
    query = query.eq('is_read', false);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Alert[];
}

export async function markAlertAsRead(alertId: string) {
  const { data, error } = await supabase
    .from('alerts')
    .update({ is_read: true })
    .eq('id', alertId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createAlert(alert: Omit<Alert, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('alerts')
    .insert(alert)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============= STUDENT OPERATIONS =============

export async function getClassStudents(classId: string) {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      *,
      student:users!enrollments_student_id_fkey(*)
    `)
    .eq('class_id', classId)
    .eq('status', 'active');

  if (error) throw error;
  return data;
}

export async function getStudentStats(studentId: string, classId: string) {
  const [engagement, mastery] = await Promise.all([
    getStudentEngagement(studentId, classId),
    getStudentMastery(studentId, classId)
  ]);

  const avgEngagement = engagement.length > 0
    ? engagement.reduce((sum, r) => sum + (r.engagement_score || 0), 0) / engagement.length
    : 0;

  const avgMastery = mastery.length > 0
    ? mastery.reduce((sum, r) => sum + r.mastery_level, 0) / mastery.length
    : 0;

  return {
    avgEngagement: Math.round(avgEngagement),
    avgMastery: Math.round(avgMastery),
    recentEngagement: engagement.slice(0, 7),
    recentMastery: mastery.slice(0, 5)
  };
}

// ============= TEACHER SETTINGS =============

export async function getTeacherSettings(teacherId: string) {
  const { data, error } = await supabase
    .from('teacher_settings')
    .select('*')
    .eq('teacher_id', teacherId)
    .single();

  if (error) {
    // Create default settings if not found
    if (error.code === 'PGRST116') {
      return createTeacherSettings(teacherId);
    }
    throw error;
  }
  return data as TeacherSettings;
}

export async function createTeacherSettings(teacherId: string) {
  const { data, error } = await supabase
    .from('teacher_settings')
    .insert({
      teacher_id: teacherId,
      notification_mastery_threshold: true,
      notification_engagement_drop: true,
      notification_project_milestone: true,
      notification_weekly_summary: false,
      mastery_threshold: 70,
      engagement_threshold: 70
    })
    .select()
    .single();

  if (error) throw error;
  return data as TeacherSettings;
}

export async function updateTeacherSettings(teacherId: string, updates: Partial<TeacherSettings>) {
  const { data, error } = await supabase
    .from('teacher_settings')
    .update(updates)
    .eq('teacher_id', teacherId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============= DASHBOARD STATS =============

export async function getDashboardStats(teacherId: string) {
  const classes = await getTeacherClasses(teacherId);
  const alerts = await getTeacherAlerts(teacherId, true);

  // Calculate aggregate stats
  let totalStudents = 0;
  let totalEngagement = 0;
  let totalMastery = 0;
  let needsSupport = 0;

  for (const classItem of classes) {
    const students = await getClassStudents(classItem.id);
    totalStudents += students?.length || 0;

    const engagementStats = await getEngagementStats(classItem.id);
    totalEngagement += engagementStats.avgScore;

    const masteryStats = await getClassMasteryStats(classItem.id);
    totalMastery += masteryStats.overallAvg;
    needsSupport += masteryStats.belowThreshold;
  }

  const avgEngagement = classes.length > 0 ? Math.round(totalEngagement / classes.length) : 0;
  const avgMastery = classes.length > 0 ? Math.round(totalMastery / classes.length) : 0;

  return {
    totalClasses: classes.length,
    totalStudents,
    avgEngagement,
    avgMastery,
    needsSupport,
    unreadAlerts: alerts.length,
    classes
  };
}
