import { TrendingUp } from 'lucide-react';

interface PerformanceSnapshot {
  overallMastery: number;
  subjectsOnTrack: number;
  totalSubjects: number;
  subjectsNeedingAttention: number;
  lastUpdated: string;
}

interface PerformanceCardProps {
  data: PerformanceSnapshot;
}

export function PerformanceCard({ data }: PerformanceCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 transition-colors">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Performance Snapshot</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Last updated {data.lastUpdated}</p>
        </div>
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      {/* Overall Mastery */}
      <div className="mb-6">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Overall Mastery</p>
        <div className="flex items-end gap-3">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{data.overallMastery}%</div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {data.overallMastery >= 80 ? 'Excellent progress' :
             data.overallMastery >= 60 ? 'Good progress' :
             'Keep practicing'}
          </p>
        </div>
      </div>

      {/* Subject Status */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30">
          <span className="text-sm text-gray-700 dark:text-gray-300">Subjects On Track</span>
          <span className="text-lg font-semibold text-green-700 dark:text-green-400">{data.subjectsOnTrack}/{data.totalSubjects}</span>
        </div>

        {data.subjectsNeedingAttention > 0 && (
          <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-900/30">
            <span className="text-sm text-gray-700 dark:text-gray-300">Needing Attention</span>
            <span className="text-lg font-semibold text-orange-700 dark:text-orange-400">{data.subjectsNeedingAttention}</span>
          </div>
        )}

        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Focus on subjects needing attention to maintain balanced learning.
          </p>
        </div>
      </div>
    </div>
  );
}
