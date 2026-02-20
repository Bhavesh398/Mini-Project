import { useState } from 'react';
import { StudentLayout } from '../../components/student/StudentLayout';
import { CheckCircle, Clock, AlertCircle, Users } from 'lucide-react';

interface ProjectType {
  id: string;
  name: string;
  subject: string;
  team: string;
  progress: number;
  nextMilestone: string;
  status: 'on-track' | 'at-risk' | 'completed';
}

export function ProjectsPage() {
  const projects: ProjectType[] = [
    {
      id: '1',
      name: 'Mathematical Model of Population Growth',
      subject: 'Mathematics 101',
      team: 'Team Alpha',
      progress: 75,
      nextMilestone: 'Final Report - Jan 20',
      status: 'on-track'
    },
    {
      id: '2',
      name: 'Quantum Mechanics Simulation',
      subject: 'Physics Advanced',
      team: 'Team Beta',
      progress: 50,
      nextMilestone: 'Code Submission - Jan 15',
      status: 'at-risk'
    },
    {
      id: '3',
      name: 'Shakespeare Analysis Essay',
      subject: 'English Literature',
      team: 'Solo',
      progress: 90,
      nextMilestone: 'Peer Review - Jan 25',
      status: 'on-track'
    },
    {
      id: '4',
      name: 'Reaction Kinetics Experiment',
      subject: 'Chemistry Lab',
      team: 'Team Gamma',
      progress: 35,
      nextMilestone: 'Lab Session - Jan 12',
      status: 'at-risk'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'at-risk':
        return <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Projects</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your project-based learning tasks
          </p>
        </div>

        {/* Projects Grid */}
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 transition-colors hover:shadow-sm cursor-pointer"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{project.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{project.subject}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(project.status)}
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    project.status === 'on-track' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    project.status === 'at-risk' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                  }`}>
                    {project.status === 'on-track' ? 'On Track' :
                     project.status === 'at-risk' ? 'At Risk' :
                     'Completed'}
                  </span>
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
                    className="h-full bg-blue-600 transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Team</p>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{project.team}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Next Milestone</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{project.nextMilestone}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
}
