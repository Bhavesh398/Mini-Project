import { StudentLayout } from '../../components/student/StudentLayout';
import { Mail, Calendar, Award } from 'lucide-react';

export function ProfilePage() {
  const userProfile = {
    name: 'Aarav Gupta',
    email: 'aarav.gupta@school.edu',
    enrollmentDate: 'Jan 1, 2025',
    overallMastery: 65,
    courses: ['Mathematics 101', 'Physics Advanced', 'English Literature', 'Chemistry Lab'],
    academicGoals: 'Improve mastery in Physics and Chemistry while maintaining strong performance in Mathematics.'
  };

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account and learning information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 transition-colors">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{userProfile.name}</h2>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <span>{userProfile.email}</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
              <span className="text-2xl font-semibold text-white">AG</span>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-8 border-b border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Member Since</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{userProfile.enrollmentDate}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Overall Mastery</p>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{userProfile.overallMastery}%</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Active Courses</p>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{userProfile.courses.length} courses</span>
            </div>
          </div>

          {/* Courses */}
          <div className="pt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Enrolled Courses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {userProfile.courses.map((course) => (
                <div
                  key={course}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{course}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Academic Goals */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Academic Goals</h3>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/40">
            <p className="text-sm text-blue-900 dark:text-blue-100">"{userProfile.academicGoals}"</p>
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Receive updates on assignments and messages</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded transition-colors">
                Manage
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Learning Reminders</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Get reminders to practice and complete tasks</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded transition-colors">
                Manage
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Privacy Settings</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Control what information is shared</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded transition-colors">
                Manage
              </button>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
