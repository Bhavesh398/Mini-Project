import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Users, TrendingUp, AlertCircle, Clock, Activity, BarChart3, CheckCircle, Target, Bell, 
  Settings as SettingsIcon, User, ChevronRight, Play, MessageSquare, Flag, ThumbsUp, Loader2, 
  Menu, Search, Calendar as CalendarIcon, MoreVertical, Plus 
} from 'lucide-react';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { getUserSession } from '../../services/auth';
import { 
  getDashboardStats, getTeacherAlerts, markAlertAsRead, getClassStudents, 
  getTeacherSettings, updateTeacherSettings 
} from '../../services/database';
import type { Alert, Class as ClassType, TeacherSettings } from '../../lib/supabase';

export function TeacherDashboardPage() {
  const navigate = useNavigate();
  const user = getUserSession();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [settings, setSettings] = useState<TeacherSettings | null>(null);
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
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
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

  // Use real data or fallback to mock data
  const studentsProgress = dashboardData?.students || [
    { name: 'Priyanka', progress: 78, avatar: '👩', color: 'bg-blue-500' },
    { name: 'Vivek', progress: 54, avatar: '👨', color: 'bg-orange-500' },
    { name: 'Aditya', progress: 89, avatar: '👨', color: 'bg-cyan-500' },
    { name: 'Sneha', progress: 45, avatar: '👩', color: 'bg-red-500' },
    { name: 'Rahul', progress: 20, avatar: '👨', color: 'bg-blue-500' }
  ];

  const lessons = dashboardData?.classes || [
    { title: 'Programming', time: 'Every Day 10am to 11am', students: ['👨', '👩', '👦'] },
    { title: 'Core Language', time: 'Every Day 12pm to 01pm', students: ['👨', '👩', '👦'] }
  ];

  const completionRate = dashboardData?.avgEngagement || 80;
  const workingHoursPercent = dashboardData?.avgMastery || 77;

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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Students Progress</h2>
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
                    <h4 className="font-semibold text-gray-900 dark:text-white">Do you understand this concept?</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Started 2 minutes ago</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded">Active</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">Yes: 12 responses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">No: 5 responses</span>
                  </div>
                </div>
              </div>

              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <p>No more active polls</p>
              </div>
            </div>
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
