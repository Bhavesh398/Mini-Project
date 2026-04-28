import { ChevronRight, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export interface Project {
  id: string;
  name: string;
  class: string;
  progress: number;
  phase: string;
  teams: number;
  nextMilestone: string;
  status: 'on-track' | 'delayed' | 'completed';
  startDate: string;
  endDate: string;
}

interface ProjectCardProps {
  project: Project;
  onViewProject: (projectId: string) => void;
}

export function ProjectCard({ project, onViewProject }: ProjectCardProps) {
  const statusConfig = {
    'on-track': { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', label: 'On Track', icon: CheckCircle },
    'delayed': { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', label: 'Delayed', icon: AlertCircle },
    'completed': { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', label: 'Completed', icon: CheckCircle }
  };

  const config = statusConfig[project.status];
  const StatusIcon = config.icon;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md dark:hover:shadow-lg dark:shadow-gray-900/50 transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {project.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{project.class}</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bg}`}>
          <StatusIcon className={`w-4 h-4 ${config.text}`} />
          <span className={`text-xs font-semibold ${config.text}`}>{config.label}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Progress</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{project.progress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              project.status === 'completed' ? 'bg-green-500' :
              project.status === 'delayed' ? 'bg-red-500' :
              'bg-blue-500'
            }`}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current Phase</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{project.phase}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Contributors</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{project.teams} members</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Next Milestone</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {project.nextMilestone}
          </p>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onViewProject(project.id)}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        View Mini Project
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
