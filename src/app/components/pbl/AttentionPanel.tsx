import { AlertTriangle, Clock, Users, ArrowRight } from 'lucide-react';

export interface AttentionItem {
  id: string;
  teamName: string;
  issue: 'behind-schedule' | 'low-collaboration' | 'inactive-member';
  description: string;
  severity: 'high' | 'medium' | 'low';
  affectedMember?: string;
  daysOverdue?: number;
}

interface AttentionPanelProps {
  items: AttentionItem[];
  onMessageTeam: (teamId: string) => void;
  onScheduleCheckIn: (teamId: string) => void;
  onViewDetails: (teamId: string) => void;
}

export function AttentionPanel({ items, onMessageTeam, onScheduleCheckIn, onViewDetails }: AttentionPanelProps) {
  const issueConfig = {
    'behind-schedule': { 
      icon: Clock, 
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-400',
      label: 'Behind Schedule',
      badge: 'bg-red-100 dark:bg-red-900/40'
    },
    'low-collaboration': {
      icon: Users,
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      text: 'text-orange-700 dark:text-orange-400',
      label: 'Low Collaboration',
      badge: 'bg-orange-100 dark:bg-orange-900/40'
    },
    'inactive-member': {
      icon: AlertTriangle,
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      text: 'text-yellow-700 dark:text-yellow-400',
      label: 'Inactive Member',
      badge: 'bg-yellow-100 dark:bg-yellow-900/40'
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attention Required</h3>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">Everything looks good!</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">No teams need immediate attention</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors">
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Attention Required</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{items.length} team(s) need attention</p>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {items.map((item) => {
          const config = issueConfig[item.issue];
          const Icon = config.icon;

          return (
            <div key={item.id} className={`p-4 ${config.bg} transition-colors`}>
              {/* Issue Header */}
              <div className="flex items-start gap-3 mb-3">
                <Icon className={`w-5 h-5 ${config.text} flex-shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{item.teamName}</h4>
                  <p className={`text-xs font-medium mt-1 ${config.text}`}>{config.label}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 ml-8">
                {item.description}
              </p>

              {/* Meta Info */}
              {(item.affectedMember || item.daysOverdue) && (
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-3 ml-8">
                  {item.affectedMember && <p>Affected: {item.affectedMember}</p>}
                  {item.daysOverdue && <p>{item.daysOverdue} days overdue</p>}
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 ml-8">
                <button
                  onClick={() => onMessageTeam(item.id)}
                  className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                >
                  Message
                </button>
                <button
                  onClick={() => onScheduleCheckIn(item.id)}
                  className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                >
                  Check-in
                </button>
                <button
                  onClick={() => onViewDetails(item.id)}
                  className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Details →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
