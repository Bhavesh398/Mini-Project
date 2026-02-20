import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Users, GraduationCap, BookOpen, TrendingUp, Activity, Target, FolderKanban } from 'lucide-react';
import { getUserSession } from '../../services/auth';

const stats = [
  { name: 'Total Teachers', value: '42', icon: Users, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
  { name: 'Total Students', value: '1,248', icon: GraduationCap, color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
  { name: 'Total Classes', value: '87', icon: BookOpen, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' },
  { name: 'Avg Engagement', value: '78%', icon: TrendingUp, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
];

const platformUsage = [
  { feature: 'Active Teachers (Last 7 Days)', value: '38', total: '42', percentage: 90 },
  { feature: 'Active Students (Last 7 Days)', value: '1,156', total: '1,248', percentage: 93 },
];

const featureAdoption = [
  { name: 'Engagement Tracking', enabled: true, usage: '95%' },
  { name: 'Project-Based Learning', enabled: true, usage: '72%' },
  { name: 'Adaptive Learning', enabled: true, usage: '88%' },
];

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const user = getUserSession();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Overview of platform activity and system health
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.name}</p>
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Platform Usage */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Platform Usage</h2>
          <div className="space-y-6">
            {platformUsage.map((item) => (
              <div key={item.feature}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.feature}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {item.value} / {item.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-indigo-700 h-2.5 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Adoption */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Feature Adoption</h2>
            <div className="space-y-4">
              {featureAdoption.map((feature) => (
                <div key={feature.name} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${feature.enabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{feature.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{feature.usage}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">System Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Platform Status</span>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">Last Backup</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}