import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  BookOpen, Users, TrendingUp, AlertCircle, Clock, Activity, BarChart3, CheckCircle, Target, Bell, 
  Settings as SettingsIcon, User, ChevronRight, Play, MessageSquare, Flag, ThumbsUp, Loader2, 
  Menu, Search, Calendar as CalendarIcon, MoreVertical, Plus, Trash2, Pencil, Download 
} from 'lucide-react';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { getUserSession } from '../../services/auth';
import { getTeacherSubjects, SUBJECTS } from '../../data/subjects';
import { deleteTask, getTeacherTasks, updateTask } from '../../../services/tasks';
import { getClassStudents, getTeacherClasses } from '../../services/teacherClasses';
import { 
  getDashboardStats, getTeacherAlerts, markAlertAsRead,
  getTeacherSettings, updateTeacherSettings 
} from '../../services/database';
import type { Alert, Class as ClassType, TeacherSettings } from '../../lib/supabase';
import {
  downloadUTSheetCsv,
  getFinalResult,
  getMarkStatus,
  getOrCreateUTSheets,
  updateStudentUTMark,
  type StudentMarksSheet
} from '../../services/utMarks';

interface DashboardTaskCard {
  id: string;
  classId: string;
  title: string;
  description: string | null;
  className: string;
  dueDate: string | null;
  completedCount: number;
  totalStudents: number;
}

export function TeacherDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUserSession();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [settings, setSettings] = useState<TeacherSettings | null>(null);
  const [taskCards, setTaskCards] = useState<DashboardTaskCard[]>([]);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<DashboardTaskCard | null>(null);
  const [updatingTask, setUpdatingTask] = useState(false);
  const [editTaskForm, setEditTaskForm] = useState({
    title: '',
    description: '',
    dueDate: ''
  });
  const [utSheets, setUtSheets] = useState<StudentMarksSheet[]>([]);
  const [currentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('Live Polls');

  useEffect(() => {
    if (!user || user.role !== 'teacher') {
      navigate('/login');
      return;
    }
    loadDashboardData();
  }, [user?.role, navigate]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // TODO: Enable once database is set up
      // const [stats, alertsData, settingsData] = await Promise.all([
      //   getDashboardStats(user.email),
      //   getTeacherAlerts(user.email),
      //   getTeacherSettings(user.email)
      // ]);
      
      // setDashboardData(stats);
      // setAlerts(alertsData);
      // setSettings(settingsData);
      
      // Using mock data for now
      setDashboardData(null);
      setAlerts([]);
      setSettings(null);

      const [taskPayload, teacherClasses] = await Promise.all([
        getTeacherTasks().catch(() => ({ tasks: [], submissions: [] })),
        getTeacherClasses().catch(() => [])
      ]);

      const classSizes = await Promise.all(
        teacherClasses.map(async (teacherClass) => {
          const students = await getClassStudents(teacherClass.id).catch(() => []);
          return [teacherClass.id, students.length] as const;
        })
      );

      const classSizeMap = new Map(classSizes);
      const completionCountByTask = new Map<string, number>();

      for (const submission of taskPayload.submissions) {
        if (submission.status === 'pending') continue;
        const current = completionCountByTask.get(submission.task_id) ?? 0;
        completionCountByTask.set(submission.task_id, current + 1);
      }

      const cards = taskPayload.tasks
        .slice(0, 8)
        .map((task) => ({
          id: task.id,
          classId: task.class_id,
          title: task.title,
          description: task.description,
          className: task.class_name,
          dueDate: task.due_date,
          completedCount: completionCountByTask.get(task.id) ?? 0,
          totalStudents: classSizeMap.get(task.class_id) ?? 0
        }));

      setTaskCards(cards);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const confirmed = window.confirm('Delete this task? This cannot be undone.');
    if (!confirmed) return;

    try {
      setDeletingTaskId(taskId);
      await deleteTask(taskId);
      setTaskCards((previous) => previous.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task', error);
    } finally {
      setDeletingTaskId(null);
    }
  };

  const formatDateForInput = (value: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
  };

  const handleEditTaskOpen = (task: DashboardTaskCard) => {
    setEditingTask(task);
    setEditTaskForm({
      title: task.title,
      description: task.description ?? '',
      dueDate: formatDateForInput(task.dueDate)
    });
  };

  const handleUpdateTask = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingTask || !editTaskForm.title.trim()) return;

    try {
      setUpdatingTask(true);
      const updated = await updateTask(editingTask.id, {
        title: editTaskForm.title.trim(),
        description: editTaskForm.description.trim() || null,
        dueDate: editTaskForm.dueDate || null
      });

      setTaskCards((previous) =>
        previous.map((task) =>
          task.id === editingTask.id
            ? {
                ...task,
                title: updated.title,
                description: updated.description,
                dueDate: updated.due_date
              }
            : task
        )
      );
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to update task', error);
    } finally {
      setUpdatingTask(false);
    }
  };

  const handleAlertAction = async (alertId: string) => {
    try {
      await markAlertAsRead(alertId);
      setAlerts(alerts.filter(a => a.id !== alertId));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const teacherSubjects = getTeacherSubjects(user?.email);
  const classFromQuery = new URLSearchParams(location.search).get('class');
  const selectedSubjectId =
    classFromQuery && teacherSubjects.some((subject) => subject.id === classFromQuery)
      ? classFromQuery
      : (teacherSubjects[0]?.id ?? 'dbms');

  const selectedSubject = teacherSubjects.find((subject) => subject.id === selectedSubjectId) ?? teacherSubjects[0];

  const subjectContent: Record<string, {
    studentsProgress: Array<{ name: string; progress: number; avatar: string; color: string }>;
    lessons: Array<{ title: string; time: string; students: string[] }>;
    activePoll: { question: string; yesResponses: number; noResponses: number };
  }> = {
    dbms: {
      studentsProgress: [
        { name: 'Amruta', progress: 78, avatar: '👩', color: 'bg-blue-500' },
        { name: 'Rimzim', progress: 54, avatar: '👩', color: 'bg-orange-500' },
        { name: 'Bhavesh', progress: 89, avatar: '👨', color: 'bg-cyan-500' },
        { name: 'Princess', progress: 45, avatar: '👩', color: 'bg-red-500' }
      ],
      lessons: [
        { title: 'DBMS - ER Modeling and Normalization', time: 'Mon 10:00 AM to 11:00 AM', students: ['👩', '👩', '👨'] },
        { title: 'DBMS - SQL Joins and Query Optimization', time: 'Wed 10:00 AM to 11:00 AM', students: ['👩', '👨', '👨'] }
      ],
      activePoll: { question: 'Can you identify 3NF violations in this schema?', yesResponses: 10, noResponses: 6 }
    },
    os: {
      studentsProgress: [
        { name: 'Amruta', progress: 64, avatar: '👩', color: 'bg-orange-500' },
        { name: 'Rimzim', progress: 81, avatar: '👩', color: 'bg-blue-500' },
        { name: 'Bhavesh', progress: 73, avatar: '👨', color: 'bg-cyan-500' },
        { name: 'Princess', progress: 58, avatar: '👩', color: 'bg-orange-500' }
      ],
      lessons: [
        { title: 'OS - Process Scheduling Algorithms', time: 'Tue 11:15 AM to 12:15 PM', students: ['👩', '👩', '👨'] },
        { title: 'OS - Deadlocks and Resource Allocation', time: 'Thu 11:15 AM to 12:15 PM', students: ['👩', '👨', '👨'] }
      ],
      activePoll: { question: 'Is Round Robin fair for all CPU-bound tasks?', yesResponses: 14, noResponses: 3 }
    },
    mdm: {
      studentsProgress: [
        { name: 'Amruta', progress: 92, avatar: '👩', color: 'bg-cyan-500' },
        { name: 'Rimzim', progress: 76, avatar: '👩', color: 'bg-blue-500' },
        { name: 'Bhavesh', progress: 68, avatar: '👨', color: 'bg-orange-500' },
        { name: 'Princess', progress: 84, avatar: '👩', color: 'bg-blue-500' }
      ],
      lessons: [
        { title: 'MDM - Interdisciplinary Thinking Workshop', time: 'Mon 1:00 PM to 2:00 PM', students: ['👩', '👨', '👩'] },
        { title: 'MDM - Systems Mapping Lab', time: 'Wed 1:00 PM to 2:00 PM', students: ['👨', '👩', '👩'] }
      ],
      activePoll: { question: 'Did today\'s case study connect both core domains clearly?', yesResponses: 12, noResponses: 4 }
    },
    oe: {
      studentsProgress: [
        { name: 'Amruta', progress: 59, avatar: '👩', color: 'bg-orange-500' },
        { name: 'Rimzim', progress: 61, avatar: '👩', color: 'bg-orange-500' },
        { name: 'Bhavesh', progress: 47, avatar: '👨', color: 'bg-red-500' },
        { name: 'Princess', progress: 71, avatar: '👩', color: 'bg-blue-500' }
      ],
      lessons: [
        { title: 'OE - Industry Tools Primer', time: 'Wed 10:00 AM to 11:00 AM', students: ['👩', '👨', '👩'] },
        { title: 'OE - Career Readiness Sprint', time: 'Fri 10:00 AM to 11:00 AM', students: ['👨', '👩', '👨'] }
      ],
      activePoll: { question: 'Would you like more hands-on demos next session?', yesResponses: 9, noResponses: 8 }
    },
    ct: {
      studentsProgress: [
        { name: 'Amruta', progress: 88, avatar: '👩', color: 'bg-cyan-500' },
        { name: 'Rimzim', progress: 69, avatar: '👩', color: 'bg-orange-500' },
        { name: 'Bhavesh', progress: 74, avatar: '👨', color: 'bg-blue-500' },
        { name: 'Princess', progress: 52, avatar: '👩', color: 'bg-orange-500' }
      ],
      lessons: [
        { title: 'CT - Recursion and Complexity', time: 'Thu 10:00 AM to 11:00 AM', students: ['👩', '👨', '👩'] },
        { title: 'CT - Graph Traversal Strategies', time: 'Sat 10:00 AM to 11:00 AM', students: ['👨', '👩', '👨'] }
      ],
      activePoll: { question: 'Can you trace DFS execution confidently?', yesResponses: 11, noResponses: 5 }
    }
  };

  const currentContent = subjectContent[selectedSubjectId] ?? subjectContent.dbms;

  // Use real data or fallback to mock data
  const seededStudentsProgress = dashboardData?.students || currentContent.studentsProgress;

  const lessons = dashboardData?.classes || currentContent.lessons;

  const completionRate = dashboardData?.avgEngagement || 80;
  const workingHoursPercent = dashboardData?.avgMastery || 77;

  const attendanceRoster = (seededStudentsProgress as Array<{ name: string; progress: number }>).map((student) => ({
    name: student.name,
    attendanceProgress: student.progress
  }));
  const attendanceRosterSignature = attendanceRoster
    .map((student) => `${student.name}:${student.attendanceProgress}`)
    .join('|');

  useEffect(() => {
    let mounted = true;

    const loadUtSheets = async () => {
      try {
        const sheets = await getOrCreateUTSheets(attendanceRoster);
        if (mounted) {
          setUtSheets(sheets);
        }
      } catch (error) {
        console.error('Failed to load UT sheets', error);
      }
    };

    loadUtSheets();

    return () => {
      mounted = false;
    };
  }, [attendanceRosterSignature, selectedSubjectId]);

  const handleUTMarkChange = async (studentId: string, subjectId: string, value: string) => {
    try {
      const updatedSheets = await updateStudentUTMark(studentId, subjectId, Number(value));
      setUtSheets((previous) => {
        const next = [...previous];
        for (const updated of updatedSheets) {
          const index = next.findIndex((sheet) => sheet.studentId === updated.studentId);
          if (index >= 0) {
            next[index] = updated;
          }
        }
        return next;
      });
    } catch (error) {
      console.error('Failed to update UT mark', error);
    }
  };

  const handleDownloadFinalSheet = async () => {
    if (utSheets.length === 0) return;
    try {
      await downloadUTSheetCsv();
    } catch (error) {
      console.error('Failed to download combined UT and submission sheet', error);
    }
  };

  const studentsProgress = seededStudentsProgress.map((student: any) => {
    const sheet = utSheets.find((entry) => entry.studentName.toLowerCase() === String(student.name).toLowerCase());
    const marks = sheet ? Object.values(sheet.marksBySubject) : [];
    const progress = marks.length
      ? Math.round((marks.reduce((sum, value) => sum + value, 0) / (marks.length * 20)) * 100)
      : student.progress;

    const color = progress >= 70 ? 'bg-blue-500' : progress >= 50 ? 'bg-orange-500' : 'bg-red-500';

    return {
      ...student,
      progress,
      color
    };
  });

  if (!user) return null;

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <TeacherLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 relative overflow-hidden transition-colors">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, <span className="text-blue-600 dark:text-blue-400">{user.name || 'John'}!</span>
            </h1>
            <p className="text-gray-700 dark:text-gray-300 mb-1">
              {selectedSubject ? `Current class: ${selectedSubject.displayName}. ` : ''}
              Your students completed <span className="font-semibold text-orange-500">{completionRate}%</span> of the tasks.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Progress is <span className="font-semibold text-orange-500">
                {completionRate >= 80 ? 'very good!' : completionRate >= 60 ? 'good!' : 'needs improvement'}
              </span>
            </p>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2">
            <div className="w-64 h-40 bg-gradient-to-br from-blue-100 dark:from-blue-500/20 to-indigo-100 dark:to-indigo-500/20 rounded-2xl flex items-center justify-center transition-colors">
              <BookOpen className="w-24 h-24 text-blue-500 dark:text-blue-400 opacity-50" />
            </div>
          </div>
        </div>

        {/* Instant Polls Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700">
            {['Live Polls', 'Completed', 'Archived', 'Templates'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium text-sm transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="p-6">
            {activeTab === 'Live Polls' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Polls</h3>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Poll
                  </button>
                </div>
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No active polls right now</p>
                </div>
              </div>
            )}

            {activeTab === 'Completed' && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No completed polls yet</p>
              </div>
            )}

            {activeTab === 'Archived' && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No archived polls</p>
              </div>
            )}

            {activeTab === 'Templates' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {['Multiple Choice', 'True/False', 'Rating Scale', 'Short Answer', 'Matching', 'Image Selection'].map((template) => (
                    <div key={template} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md dark:hover:shadow-lg dark:shadow-gray-900/50 transition-all cursor-pointer group">
                      <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{template}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Use this template to create a new poll</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Students Progress */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Students Progress</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Calculated from UT marks scored across all subjects.</p>
              </div>
              <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                View List
              </button>
            </div>

            <div className="space-y-4">
              {studentsProgress.map((student: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xl">
                    {student.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{student.name}</p>
                    <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`absolute left-0 top-0 h-full ${student.color} transition-all duration-300`}
                        style={{ width: `${student.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    student.progress >= 70 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                    student.progress >= 50 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {student.progress}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Polls */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Live Polls</h2>
              <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Poll
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md dark:hover:shadow-lg dark:shadow-gray-900/50 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{currentContent.activePoll.question}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Started 2 minutes ago</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded">Active</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">Yes: {currentContent.activePoll.yesResponses} responses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">No: {currentContent.activePoll.noResponses} responses</span>
                  </div>
                </div>
              </div>

              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <p>No more active polls</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">UT Examination Marks Sheet</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Based on attendance progress. Ma'am can edit marks for all subjects. Subject marks below 8 are FAIL and final result becomes KT.
              </p>
            </div>
            <button
              onClick={handleDownloadFinalSheet}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Final Excel Sheet
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/60">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Student</th>
                  {SUBJECTS.map((subject) => (
                    <th key={subject.id} className="px-3 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {subject.code}
                    </th>
                  ))}
                  <th className="px-3 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Final Result</th>
                </tr>
              </thead>
              <tbody>
                {utSheets.map((sheet) => (
                  <tr
                    key={sheet.studentId}
                    className="border-t border-gray-200 dark:border-gray-700 odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700/30"
                  >
                    <td className="px-3 py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">{sheet.studentName}</td>
                    {SUBJECTS.map((subject) => {
                      const mark = sheet.marksBySubject[subject.id] ?? 0;
                      const subjectStatus = getMarkStatus(mark);

                      return (
                        <td key={`${sheet.studentName}-${subject.id}`} className="px-3 py-3 align-top">
                          <div className="flex flex-col gap-1">
                            <input
                              type="number"
                              min={0}
                              max={20}
                              value={mark}
                              onChange={(event) => handleUTMarkChange(sheet.studentId, subject.id, event.target.value)}
                              className="w-20 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1 text-gray-900 dark:text-gray-100"
                            />
                            <span className={`text-xs font-semibold ${subjectStatus === 'FAIL' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                              {subjectStatus}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                    <td className={`px-3 py-3 font-semibold whitespace-nowrap ${getFinalResult(sheet.marksBySubject) === 'KT' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {getFinalResult(sheet.marksBySubject)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{monthName}</h2>
              <div className="flex gap-1">
                <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400 rotate-180" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, idx) => (
                <div key={`empty-${idx}`} className="aspect-square"></div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const isToday = day === currentDate.getDate();
                const hasEvent = day === 3 || day === 30;
                
                return (
                  <div
                    key={day}
                    className={`aspect-square flex items-center justify-center text-sm rounded-lg cursor-pointer transition-colors ${
                      isToday
                        ? 'bg-blue-600 text-white font-semibold'
                        : hasEvent
                        ? 'bg-orange-500 text-white font-medium'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lessons */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lessons</h2>
              <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-4">
              {lessons.map((lesson: any, idx: number) => (
                <div key={idx} className="border-l-4 border-orange-500 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{lesson.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{lesson.time}</p>
                    </div>
                    <button className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {lesson.students.map((avatar: string, i: number) => (
                        <div
                          key={i}
                          className="w-8 h-8 bg-white dark:bg-gray-800 border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center text-sm"
                        >
                          {avatar}
                        </div>
                      ))}
                    </div>
                    <button className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Task Tracker</h2>
            <button
              onClick={() => navigate('/teacher/submissions')}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Manage Tasks
            </button>
          </div>

          {taskCards.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
              No tasks yet. Create one from the submissions page.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {taskCards.map((task) => {
                const completionPercent = task.totalStudents
                  ? Math.round((task.completedCount / task.totalStudents) * 100)
                  : 0;

                return (
                  <div
                    key={task.id}
                    className="group relative rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/40"
                  >
                    <button
                      onClick={() => handleEditTaskOpen(task)}
                      className="absolute right-12 top-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-md p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      aria-label={`Edit ${task.title}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      disabled={deletingTaskId === task.id}
                      className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-md p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                      aria-label={`Delete ${task.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white pr-10">{task.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{task.className}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}
                    </p>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600 dark:text-gray-300">Completed</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-100">
                          {task.completedCount}/{task.totalStudents}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-emerald-500"
                          style={{ width: `${completionPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {editingTask ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-xl rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Task</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Update task details without deleting it.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleUpdateTask} className="space-y-4">
                <label className="block text-sm text-gray-700 dark:text-gray-300">
                  Title
                  <input
                    value={editTaskForm.title}
                    onChange={(event) => setEditTaskForm((previous) => ({ ...previous, title: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  />
                </label>

                <label className="block text-sm text-gray-700 dark:text-gray-300">
                  Due date
                  <input
                    type="date"
                    value={editTaskForm.dueDate}
                    onChange={(event) => setEditTaskForm((previous) => ({ ...previous, dueDate: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  />
                </label>

                <label className="block text-sm text-gray-700 dark:text-gray-300">
                  Description
                  <textarea
                    rows={3}
                    value={editTaskForm.description}
                    onChange={(event) => setEditTaskForm((previous) => ({ ...previous, description: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  ></textarea>
                </label>

                <button
                  type="submit"
                  disabled={updatingTask}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {updatingTask ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        ) : null}

        {/* Bottom Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 rounded-xl p-8 text-white relative overflow-hidden transition-colors">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">User Activity</h3>
              <p className="text-orange-100">Grow marketing & sales through product.</p>
            </div>
            <div className="absolute right-8 bottom-8 opacity-20">
              <Users className="w-32 h-32" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-xl p-8 text-white relative overflow-hidden transition-colors">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-4">Based On</h3>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" />
                  Activities
                </p>
                <p className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" />
                  Sales
                </p>
              </div>
            </div>
            <div className="absolute right-8 bottom-8 opacity-20">
              <BarChart3 className="w-32 h-32" />
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
