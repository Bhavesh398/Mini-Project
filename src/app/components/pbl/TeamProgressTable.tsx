import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

export interface TeamProgress {
  id: string;
  name: string;
  progress: number;
  milestoneStatus: 'on-track' | 'at-risk' | 'delayed';
  collaboration: number; // 0-100
  lastActivity: string; // e.g., "2 hours ago"
  status: 'active' | 'delayed' | 'inactive';
  members: number;
}

interface TeamProgressTableProps {
  teams: TeamProgress[];
  onRowClick: (teamId: string) => void;
}

export function TeamProgressTable({ teams, onRowClick }: TeamProgressTableProps) {
  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case 'on-track':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'at-risk':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'delayed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getMilestoneLabel = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'On Track';
      case 'at-risk':
        return 'At Risk';
      case 'delayed':
        return 'Delayed';
      default:
        return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20';
      case 'delayed':
        return 'bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/20';
      case 'inactive':
        return 'bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20';
      default:
        return 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Team Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Progress</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Milestone</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Collaboration</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Last Activity</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {teams.map((team) => (
              <tr
                key={team.id}
                onClick={() => onRowClick(team.id)}
                className={`cursor-pointer transition-colors ${getStatusColor(team.status)}`}
              >
                {/* Team Name */}
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{team.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{team.members} members</p>
                  </div>
                </td>

                {/* Progress */}
                <td className="px-6 py-4">
                  <div className="w-32">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{team.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${team.progress}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* Milestone Status */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getMilestoneIcon(team.milestoneStatus)}
                    <span className="text-sm text-gray-700 dark:text-gray-300">{getMilestoneLabel(team.milestoneStatus)}</span>
                  </div>
                </td>

                {/* Collaboration Score */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          team.collaboration >= 70 ? 'bg-green-500' :
                          team.collaboration >= 50 ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${team.collaboration}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{team.collaboration}%</span>
                  </div>
                </td>

                {/* Last Activity */}
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{team.lastActivity}</span>
                </td>

                {/* Status Indicator */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      team.status === 'active' ? 'bg-green-500' :
                      team.status === 'delayed' ? 'bg-orange-500' :
                      'bg-red-500'
                    }`} />
                    <span className={`text-xs font-semibold ${
                      team.status === 'active' ? 'text-green-700 dark:text-green-400' :
                      team.status === 'delayed' ? 'text-orange-700 dark:text-orange-400' :
                      'text-red-700 dark:text-red-400'
                    }`}>
                      {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
