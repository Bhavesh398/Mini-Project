import { useState } from 'react';
import { Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

export interface Subject {
  id: string;
  name: string;
  progress: number;
  estimatedHours: number;
  pendingTasks: number;
  status: 'on-track' | 'needs-attention' | 'completed';
}

interface CurrentCoursesProps {
  subjects: Subject[];
  onContinueLearning: (subjectId: string) => void;
}

export function CurrentCourses({ subjects, onContinueLearning }: CurrentCoursesProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'needs-attention':
        return <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'On Track';
      case 'needs-attention':
        return 'Needs Attention';
      case 'completed':
        return 'Completed';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-3">
      {subjects.map((subject) => (
        <div
          key={subject.id}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 transition-colors hover:shadow-sm"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{subject.name}</h3>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(subject.status)}
              <span className={`text-xs font-semibold ${
                subject.status === 'on-track' ? 'text-green-700 dark:text-green-400' :
                subject.status === 'needs-attention' ? 'text-orange-700 dark:text-orange-400' :
                'text-gray-700 dark:text-gray-400'
              }`}>
                {getStatusLabel(subject.status)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Progress</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{subject.progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${subject.progress}%` }}
              />
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Estimated Time</p>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{subject.estimatedHours}h remaining</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Pending Tasks</p>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{subject.pendingTasks} task{subject.pendingTasks !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => onContinueLearning(subject.id)}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Continue Learning
          </button>
        </div>
      ))}
    </div>
  );
}
