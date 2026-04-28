import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentLayout } from '../../components/student/StudentLayout';
import { BarChart3, CheckCircle, Clock, BookOpen, TrendingUp, AlertCircle } from 'lucide-react';
import { getUserSession } from '../../services/auth';
import { getStudentUTSheet, type StudentMarksSheet } from '../../services/utMarks';

export function StudentDashboardPage() {
  const navigate = useNavigate();
  const user = getUserSession();
  const [studentUTSheet, setStudentUTSheet] = useState<StudentMarksSheet | null>(null);
  const [loadingMarks, setLoadingMarks] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    let mounted = true;

    const loadMarks = async () => {
      if (!user || user.role !== 'student') return;

      try {
        const sheet = await getStudentUTSheet();
        if (mounted) {
          setStudentUTSheet(sheet);
        }
      } catch (error) {
        console.error('Failed to load UT marks for dashboard', error);
      } finally {
        if (mounted) {
          setLoadingMarks(false);
        }
      }
    };

    loadMarks();

    return () => {
      mounted = false;
    };
  }, [user?.role]);

  if (!user) return null;

  if (loadingMarks || !studentUTSheet) {
    return (
      <StudentLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user.name?.split(' ')[0] || 'Student'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Loading your learning dashboard...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const allSubjectMarks = Object.values(studentUTSheet.marksBySubject);
  const examinationMark = allSubjectMarks.length
    ? Math.round(allSubjectMarks.reduce((sum, mark) => sum + mark, 0) / allSubjectMarks.length)
    : 0;

  // Mock data
  const courseValidation = [
    {
      id: 1,
      name: 'Examination',
      current: examinationMark,
      total: 20,
      icon: '📝',
      color: 'from-orange-500 to-orange-600',
      href: '/student/course-selection',
      ctaLabel: 'View UT Marks'
    },
    {
      id: 2,
      name: 'Subjects',
      current: 7,
      total: 7,
      icon: '📄',
      color: 'from-green-500 to-green-600',
      href: '/student/subjects',
      ctaLabel: 'View Subjects'
    }
  ];

  const activityData = [
    { week: '10 Dec', theory: 15, practice: 8 },
    { week: '12 Dec', theory: 18, practice: 12 },
    { week: '14 Dec', theory: 12, practice: 10 },
    { week: '16 Dec', theory: 20, practice: 15 },
    { week: '18 Dec', theory: 16, practice: 14 },
    { week: '20 Dec', theory: 22, practice: 18 },
    { week: '22 Dec', theory: 25, practice: 20 }
  ];

  const weakestTopics = [
    { id: 1, name: 'DBMS', score: 75 },
    { id: 2, name: 'OS', score: 58 },
    { id: 3, name: 'MDM', score: 36 }
  ];

  const strongestTopics = [
    { id: 1, name: 'OE', score: 92 },
    { id: 2, name: 'CT', score: 95 },
    { id: 3, name: 'DBMS', score: 89 }
  ];

  const courses = [
    { id: 1, name: 'DBMS', progress: [20, 60, 75], image: '🗄️' },
    { id: 2, name: 'OS', progress: [45, 65, 85], image: '💻' },
    { id: 3, name: 'MDM', progress: [30, 55, 70], image: '🌐' },
    { id: 4, name: 'OE', progress: [40, 68, 80], image: '📚' },
    { id: 5, name: 'CT', progress: [35, 62, 88], image: '🧠' }
  ];

  const maxActivity = Math.max(...activityData.flatMap(d => [d.theory, d.practice]));

  const handleCourseValidationClick = (href?: string) => {
    if (!href) return;
    navigate(href);
  };

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user.name?.split(' ')[0] || 'Student'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Your learning dashboard</p>
        </div>

        {/* Course Validation Cards */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Course Validation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courseValidation.map((course) => (
              <button
                key={course.id}
                onClick={() => handleCourseValidationClick(course.href)}
                className={`text-left bg-gradient-to-br ${course.color} rounded-xl p-6 text-white shadow-lg transition-transform hover:shadow-xl hover:-translate-y-0.5`}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{course.icon}</span>
                  <span className="text-sm font-semibold opacity-90">{Math.round((course.current / course.total) * 100)}%</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{course.name}</h3>
                <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-white transition-all"
                    style={{ width: `${(course.current / course.total) * 100}%` }}
                  />
                </div>
                <p className="text-sm opacity-90">{course.current}/{course.total}</p>
                <span className="inline-flex mt-4 px-3 py-1.5 rounded-md bg-white/20 hover:bg-white/25 text-sm font-semibold">
                  {course.ctaLabel}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activities Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activities</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Theory</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-600 rounded"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Practice</span>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="flex items-end justify-between gap-2 h-64">
              {activityData.map((data, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex gap-1 items-end justify-center h-full relative group">
                    <div className="w-1/2 bg-blue-600 dark:bg-blue-500 rounded-t transition-all hover:bg-blue-700 dark:hover:bg-blue-600"
                      style={{ height: `${(data.theory / maxActivity) * 100}%` }}
                      title={`Theory: ${data.theory}`}
                    />
                    <div className="w-1/2 bg-purple-600 dark:bg-purple-500 rounded-t transition-all hover:bg-purple-700 dark:hover:bg-purple-600"
                      style={{ height: `${(data.practice / maxActivity) * 100}%` }}
                      title={`Practice: ${data.practice}`}
                    />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 text-center">{data.week}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Course Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-colors">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Course Statistics</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Done</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">75%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 w-3/4"></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">On Progress</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">45%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 w-5/12"></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">To Do</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">25%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-600 w-1/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary and My Courses */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-colors">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Summary</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Courses</span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">24</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Total Time</span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">180h</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Total Time</span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">180h</span>
              </div>
            </div>
          </div>

          {/* My Courses */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Courses</h3>
            {courses.map((course) => (
              <div key={course.id} className="bg-gradient-to-br from-purple-500 to-blue-600 dark:from-purple-600 dark:to-blue-700 rounded-xl p-6 text-white shadow-lg transition-transform hover:shadow-xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">{course.name}</h4>
                    <div className="flex gap-4">
                      {course.progress.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold">{p}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <span className="text-3xl">{course.image}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weakest and Strongest Topics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weakest Topics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-colors">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Weakest Topics</h3>
            
            <div className="space-y-4">
              {weakestTopics.map((topic) => (
                <div key={topic.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-2 py-1 rounded">0{topic.id}</span>
                    <span className="text-sm text-gray-900 dark:text-white font-medium">{topic.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{topic.score}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strongest Topics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-colors">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Strongest Topics</h3>
            
            <div className="space-y-4">
              {strongestTopics.map((topic) => (
                <div key={topic.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-2 py-1 rounded">0{topic.id}</span>
                    <span className="text-sm text-gray-900 dark:text-white font-medium">{topic.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-6 bg-green-200 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-green-700 dark:text-green-400">{topic.score}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
