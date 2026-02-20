import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export interface StudentContribution {
  id: string;
  name: string;
  tasksCompleted: number;
  tasksPending: number;
  lastContribution: string;
  participationPercent: number;
  status: 'active' | 'low-activity' | 'inactive';
}

interface ContributionBreakdownProps {
  students: StudentContribution[];
}

export function ContributionBreakdown({ students }: ContributionBreakdownProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'low-activity':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'inactive':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 dark:bg-green-900/10';
      case 'low-activity':
        return 'bg-orange-50 dark:bg-orange-900/10';
      case 'inactive':
        return 'bg-red-50 dark:bg-red-900/10';
      default:
        return 'bg-gray-50 dark:bg-gray-700/50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'low-activity':
        return 'Low Activity';
      case 'inactive':
        return 'Inactive';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors">
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contribution Breakdown</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{students.length} team members</p>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {students.map((student) => (
          <div key={student.id} className={`p-4 transition-colors ${getStatusColor(student.status)}`}>
            {/* Student Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{student.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(student.status)}
                    <span className="text-xs text-gray-600 dark:text-gray-400">{getStatusLabel(student.status)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{student.participationPercent}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Participation</p>
              </div>
            </div>

            {/* Tasks Grid */}
            <div className="grid grid-cols-3 gap-3 ml-13">
              <div className="bg-white dark:bg-gray-700/50 rounded p-3 border border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Completed</p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">{student.tasksCompleted}</p>
              </div>
              <div className="bg-white dark:bg-gray-700/50 rounded p-3 border border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">{student.tasksPending}</p>
              </div>
              <div className="bg-white dark:bg-gray-700/50 rounded p-3 border border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Last Activity</p>
                <p className="text-xs font-medium text-gray-900 dark:text-white">{student.lastContribution}</p>
              </div>
            </div>

            {/* Issue Indicators */}
            {student.status !== 'active' && (
              <div className="mt-3 ml-13 text-xs font-medium">
                {student.status === 'low-activity' && (
                  <p className="text-orange-700 dark:text-orange-400">⚠️ Low contribution in recent tasks</p>
                )}
                {student.status === 'inactive' && (
                  <p className="text-red-700 dark:text-red-400">❌ No contributions in the last week</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
