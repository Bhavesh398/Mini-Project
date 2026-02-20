import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/button';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';

const engagementData = [
  { month: 'Sep', engagement: 72 },
  { month: 'Oct', engagement: 75 },
  { month: 'Nov', engagement: 78 },
  { month: 'Dec', engagement: 76 },
  { month: 'Jan', engagement: 80 },
];

const masteryData = [
  { subject: 'Mathematics', avgMastery: 82, trend: '+5%' },
  { subject: 'Computer Science', avgMastery: 78, trend: '+3%' },
  { subject: 'Physics', avgMastery: 74, trend: '-2%' },
  { subject: 'Chemistry', avgMastery: 76, trend: '+4%' },
  { subject: 'Biology', avgMastery: 80, trend: '+6%' },
];

const teacherAdoption = [
  { name: 'Dr. Sarah Johnson', engagement: 95, pbl: 88, adaptive: 92 },
  { name: 'Prof. Michael Chen', engagement: 92, pbl: 85, adaptive: 90 },
  { name: 'Dr. Emily Rodriguez', engagement: 88, pbl: 78, adaptive: 85 },
  { name: 'Prof. David Williams', engagement: 85, pbl: 72, adaptive: 80 },
];

export function AdminReportsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Reports</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              View and export aggregated platform analytics
            </p>
          </div>
          <Button variant="outline" className="border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
            <Download className="w-4 h-4 mr-2" />
            Export Reports
          </Button>
        </div>

        {/* School-wide Engagement Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">School-wide Engagement Trends</h2>
          <div className="space-y-4">
            {engagementData.map((data, index) => (
              <div key={data.month}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{data.month} 2024</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{data.engagement}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-indigo-700 h-2.5 rounded-full"
                    style={{ width: `${data.engagement}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* School-wide Mastery by Subject */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">School-wide Mastery by Subject</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Avg Mastery
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {masteryData.map((subject) => (
                  <tr key={subject.subject}>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{subject.subject}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 max-w-xs">
                          <div
                            className="bg-gradient-to-r from-indigo-600 to-indigo-700 h-2.5 rounded-full"
                            style={{ width: `${subject.avgMastery}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white w-12">{subject.avgMastery}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                        subject.trend.startsWith('+') ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                      }`}>
                        {subject.trend.startsWith('+') ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {subject.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Teacher Adoption Report */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Teacher Adoption Report</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Engagement Tracking
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    PBL Usage
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Adaptive Learning
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {teacherAdoption.map((teacher) => (
                  <tr key={teacher.name}>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{teacher.name}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-900 dark:text-white">{teacher.engagement}%</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-900 dark:text-white">{teacher.pbl}%</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-900 dark:text-white">{teacher.adaptive}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}