import { useState } from 'react';
import { Filter, ArrowUpDown } from 'lucide-react';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { ProjectCard, type Project } from '../../components/pbl/ProjectCard';

export function ProjectsPage() {
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');

  // Mock data
  const projects: Project[] = [
    {
      id: '1',
      name: 'Build a Weather App',
      class: 'Web Development 101',
      progress: 75,
      phase: 'Build',
      teams: 4,
      nextMilestone: 'Code Review - Jan 14',
      status: 'on-track',
      startDate: '2025-12-01',
      endDate: '2026-01-31'
    },
    {
      id: '2',
      name: 'History Research Paper',
      class: 'Advanced History',
      progress: 45,
      phase: 'Research',
      teams: 5,
      nextMilestone: 'Outline Due - Jan 10',
      status: 'delayed',
      startDate: '2026-01-01',
      endDate: '2026-02-28'
    },
    {
      id: '3',
      name: 'Science Lab Report',
      class: 'Biology 201',
      progress: 100,
      phase: 'Review',
      teams: 3,
      nextMilestone: 'Project Complete',
      status: 'completed',
      startDate: '2025-10-01',
      endDate: '2025-12-20'
    },
    {
      id: '4',
      name: 'Math Problem Set Solution',
      class: 'Advanced Mathematics',
      progress: 60,
      phase: 'Build',
      teams: 6,
      nextMilestone: 'Peer Review - Jan 16',
      status: 'on-track',
      startDate: '2026-01-05',
      endDate: '2026-02-15'
    },
    {
      id: '5',
      name: 'Literature Analysis Project',
      class: 'English Literature',
      progress: 30,
      phase: 'Research',
      teams: 4,
      nextMilestone: 'Draft Submission - Jan 20',
      status: 'delayed',
      startDate: '2026-01-06',
      endDate: '2026-03-01'
    }
  ];

  const classes = ['all', 'Web Development 101', 'Advanced History', 'Biology 201', 'Advanced Mathematics', 'English Literature'];

  // Filter and sort
  let filtered = projects.filter(project => {
    if (filterClass !== 'all' && project.class !== filterClass) return false;
    if (filterStatus !== 'all' && project.status !== filterStatus) return false;
    return true;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'deadline') {
      return new Date(a.nextMilestone).getTime() - new Date(b.nextMilestone).getTime();
    } else if (sortBy === 'progress') {
      return b.progress - a.progress;
    }
    return 0;
  });

  const handleViewProject = (projectId: string) => {
    // Navigate to project dashboard
    console.log('Viewing project:', projectId);
    // navigate(`/teacher/projects/${projectId}`);
  };

  return (
    <TeacherLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Project-Based Learning</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage and monitor ongoing student projects</p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filter by Class */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
                Filter by Class
              </label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {classes.map(cls => (
                  <option key={cls} value={cls}>
                    {cls === 'all' ? 'All Classes' : cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="on-track">On Track</option>
                <option value="delayed">Delayed</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <ArrowUpDown className="w-4 h-4 inline mr-2" />
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="deadline">Nearest Deadline</option>
                <option value="progress">Progress (High to Low)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Project Cards Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onViewProject={handleViewProject}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors">
            <p className="text-gray-600 dark:text-gray-400 mb-2">No projects found</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">Try adjusting your filters</p>
          </div>
        )}

        {/* Stats Footer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Projects</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{projects.length}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">On Track</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
              {projects.filter(p => p.status === 'on-track').length}
            </p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Delayed</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">
              {projects.filter(p => p.status === 'delayed').length}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {projects.filter(p => p.status === 'completed').length}
            </p>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
