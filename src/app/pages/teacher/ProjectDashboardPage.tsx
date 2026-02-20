import { useState } from 'react';
import { ChevronLeft, Calendar, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { TeamProgressTable, type TeamProgress } from '../../components/pbl/TeamProgressTable';
import { AttentionPanel, type AttentionItem } from '../../components/pbl/AttentionPanel';

export function ProjectDashboardPage() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  // Mock project data
  const project = {
    id: '1',
    name: 'Build a Weather App',
    class: 'Web Development 101',
    startDate: '2025-12-01',
    endDate: '2026-01-31',
    progress: 75,
    currentMilestone: 'Code Review Phase'
  };

  // Mock team data
  const teams: TeamProgress[] = [
    {
      id: 't1',
      name: 'Team Alpha',
      progress: 85,
      milestoneStatus: 'on-track',
      collaboration: 88,
      lastActivity: '2 hours ago',
      status: 'active',
      members: 4
    },
    {
      id: 't2',
      name: 'Team Beta',
      progress: 65,
      milestoneStatus: 'at-risk',
      collaboration: 62,
      lastActivity: '1 day ago',
      status: 'delayed',
      members: 4
    },
    {
      id: 't3',
      name: 'Team Gamma',
      progress: 75,
      milestoneStatus: 'on-track',
      collaboration: 91,
      lastActivity: '30 minutes ago',
      status: 'active',
      members: 3
    },
    {
      id: 't4',
      name: 'Team Delta',
      progress: 40,
      milestoneStatus: 'delayed',
      collaboration: 35,
      lastActivity: '5 days ago',
      status: 'inactive',
      members: 4
    }
  ];

  // Attention items
  const attentionItems: AttentionItem[] = [
    {
      id: 'a1',
      teamName: 'Team Beta',
      issue: 'behind-schedule',
      description: 'Team is 2 days behind on code implementation milestone',
      severity: 'high',
      daysOverdue: 2
    },
    {
      id: 'a2',
      teamName: 'Team Delta',
      issue: 'inactive-member',
      description: 'Sarah Chen has not contributed anything in 5 days',
      severity: 'high',
      affectedMember: 'Sarah Chen'
    },
    {
      id: 'a3',
      teamName: 'Team Beta',
      issue: 'low-collaboration',
      description: 'Team collaboration score dropped 25% this week',
      severity: 'medium'
    }
  ];

  const handleViewTeamDetails = (teamId: string) => {
    setSelectedTeam(teamId);
    // In real app, navigate to team detail page
    // navigate(`/teacher/projects/${project.id}/teams/${teamId}`);
  };

  const handleMessageTeam = (teamId: string) => {
    console.log('Message team:', teamId);
    // Open messaging interface
  };

  const handleScheduleCheckIn = (teamId: string) => {
    console.log('Schedule check-in:', teamId);
    // Open scheduling dialog
  };

  const handleViewDetails = (itemId: string) => {
    console.log('View details:', itemId);
    // Navigate to attention item details
  };

  return (
    <TeacherLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Navigation */}
        <button className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to Projects
        </button>

        {/* Sticky Project Summary */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 sticky top-20 z-10 transition-colors shadow-md">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{project.class}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{project.progress}%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Overall Progress</p>
            </div>
          </div>

          {/* Progress Bar and Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Progress */}
            <div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Current Phase: {project.currentMilestone}</p>
            </div>

            {/* Timeline */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{project.startDate}</span>
              </div>
              <div className="text-gray-400">→</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{project.endDate}</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Progress Table (spans 2 cols on desktop) */}
          <div className="lg:col-span-2">
            <TeamProgressTable teams={teams} onRowClick={handleViewTeamDetails} />
          </div>

          {/* Attention Panel (sidebar on desktop) */}
          <div>
            <AttentionPanel
              items={attentionItems}
              onMessageTeam={handleMessageTeam}
              onScheduleCheckIn={handleScheduleCheckIn}
              onViewDetails={handleViewDetails}
            />
          </div>
        </div>

        {/* Team Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Teams</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{teams.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Collaboration</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {Math.round(teams.reduce((acc, t) => acc + t.collaboration, 0) / teams.length)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Attention Needed</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{attentionItems.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
