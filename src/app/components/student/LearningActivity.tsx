import { BarChart3 } from 'lucide-react';

interface ActivityData {
  date: string;
  practice: number;
  assessment: number;
}

interface LearningActivityProps {
  data: ActivityData[];
}

export function LearningActivity({ data }: LearningActivityProps) {
  // Find min and max for scaling
  const maxValue = Math.max(...data.flatMap(d => [d.practice, d.assessment]));
  
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Learning Activity</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last 3 months</p>
        </div>
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-4">
        {/* Y-axis label */}
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Activity Level</div>

        {/* Bars */}
        <div className="space-y-3">
          {data.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-700 dark:text-gray-300 font-medium">{item.date}</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {Math.max(item.practice, item.assessment)} sessions
                </span>
              </div>

              {/* Bar Group */}
              <div className="flex gap-2 h-6">
                {/* Practice Bar */}
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{ width: `${(item.practice / maxValue) * 100}%` }}
                    title={`Practice: ${item.practice}`}
                  />
                </div>

                {/* Assessment Bar */}
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-green-600 transition-all"
                    style={{ width: `${(item.assessment / maxValue) * 100}%` }}
                    title={`Assessment: ${item.assessment}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-sm" />
            <span className="text-xs text-gray-700 dark:text-gray-300">Practice Sessions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded-sm" />
            <span className="text-xs text-gray-700 dark:text-gray-300">Assessments</span>
          </div>
        </div>
      </div>

      {/* Insight */}
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        Consistent practice sessions help build mastery. Balance practice with assessments for best results.
      </p>
    </div>
  );
}
