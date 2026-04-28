import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, ArrowUpDown } from 'lucide-react';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { ProjectCard, type Project } from '../../components/pbl/ProjectCard';
import { autoFormMiniProjectGroups, createMiniProject, getAllMiniProjects, getStudentDirectory, type StudentDirectoryItem } from '../../services/miniProjectStore';
import type { MiniProjectRecord } from '../../data/miniProjects';

export function ProjectsPage() {
  const navigate = useNavigate();
  const [rawProjects, setRawProjects] = useState<MiniProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [students, setStudents] = useState<StudentDirectoryItem[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [newProject, setNewProject] = useState({
    name: '',
    subject: 'DBMS',
    nextMilestone: '',
    summary: '',
    branch: '',
    repoName: ''
  });

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [projectData, studentData] = await Promise.all([
          getAllMiniProjects(),
          getStudentDirectory()
        ]);

        if (!mounted) return;
        setRawProjects(projectData);
        setStudents(studentData);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load mini projects');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) => {
      if (prev.includes(memberId)) {
        return prev.filter((id) => id !== memberId);
      }

      if (prev.length >= 4) {
        return prev;
      }

      return [...prev, memberId];
    });
  };

  const handleCreateMiniProject = async () => {
    if (!newProject.name.trim() || !newProject.subject.trim() || !newProject.nextMilestone.trim() || !newProject.branch.trim() || !newProject.repoName.trim()) {
      setError('Please fill all required project fields.');
      return;
    }

    if (selectedMembers.length === 0 || selectedMembers.length > 4) {
      setError('Please select between 1 and 4 team members.');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const memberRows = students.filter((student) => selectedMembers.includes(student.id));
      const projectId = `mini-${Date.now()}`;

      await createMiniProject({
        id: projectId,
        name: newProject.name.trim(),
        subject: newProject.subject.trim(),
        teamName: `Team ${newProject.name.trim().split(' ')[0]}`,
        nextMilestone: newProject.nextMilestone.trim(),
        summary: newProject.summary.trim() || `${newProject.name.trim()} assigned for mini project execution.`,
        branch: newProject.branch.trim(),
        repoName: newProject.repoName.trim(),
        goals: ['Complete the assigned deliverables', 'Track commits and pushes', 'Coordinate as a team'],
        availableFiles: ['README.md'],
        members: memberRows.map((student) => ({
          id: student.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          name: student.name,
          role: 'Contributor',
          currentFocus: 'Starting assigned mini project tasks'
        })),
        tasks: memberRows.map((student, idx) => ({
          id: `task-${idx + 1}`,
          title: `Initial deliverable by ${student.name}`,
          ownerId: student.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          status: 'todo' as const
        }))
      });

      await autoFormMiniProjectGroups(projectId, 4);

      const refreshed = await getAllMiniProjects();
      setRawProjects(refreshed);
      setShowCreateForm(false);
      setSelectedMembers([]);
      setNewProject({ name: '', subject: 'DBMS', nextMilestone: '', summary: '', branch: '', repoName: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create mini project');
    } finally {
      setCreating(false);
    }
  };

  const projects: Project[] = useMemo(() => rawProjects.map((project) => ({
    id: project.id,
    name: project.name,
    class: project.subject,
    progress: project.progress,
    phase: project.repoStatus === 'review' ? 'Teacher Review' : project.repoStatus === 'behind' ? 'Needs Sync' : 'Synced',
    teams: project.members.length,
    nextMilestone: project.nextMilestone,
    status: project.status === 'at-risk' ? 'delayed' : project.status,
    startDate: '2026-01-01',
    endDate: '2026-01-31',
  })), [rawProjects]);

  const classes = ['all', ...new Set(projects.map((project) => project.class))];

  // Filter and sort
  let filtered = projects.filter(project => {
    if (filterClass !== 'all' && project.class !== filterClass) return false;
    if (filterStatus !== 'all' && project.status !== filterStatus) return false;
    return true;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'deadline') {
      return a.nextMilestone.localeCompare(b.nextMilestone);
    } else if (sortBy === 'progress') {
      return b.progress - a.progress;
    }
    return 0;
  });

  const handleViewProject = (projectId: string) => {
    navigate(`/teacher/projects/${projectId}`);
  };

  return (
    <TeacherLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mini Projects</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Review student commits, pushes, pulls, and task ownership in one place.</p>
          </div>
          <button
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            {showCreateForm ? 'Close Team Creator' : 'Create Team Mini Project'}
          </button>
        </div>

        {showCreateForm ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 transition-colors space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New Team Assignment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={newProject.name}
                onChange={(e) => setNewProject((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Project name"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
              />
              <input
                value={newProject.subject}
                onChange={(e) => setNewProject((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="Subject"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
              />
              <input
                value={newProject.nextMilestone}
                onChange={(e) => setNewProject((prev) => ({ ...prev, nextMilestone: e.target.value }))}
                placeholder="Next milestone"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
              />
              <input
                value={newProject.branch}
                onChange={(e) => setNewProject((prev) => ({ ...prev, branch: e.target.value }))}
                placeholder="Branch name"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
              />
              <input
                value={newProject.repoName}
                onChange={(e) => setNewProject((prev) => ({ ...prev, repoName: e.target.value }))}
                placeholder="Repo name"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
              />
              <input
                value={newProject.summary}
                onChange={(e) => setNewProject((prev) => ({ ...prev, summary: e.target.value }))}
                placeholder="Summary (optional)"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select team members (max 4)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {students.map((student) => {
                  const checked = selectedMembers.includes(student.id);
                  const disabled = !checked && selectedMembers.length >= 4;

                  return (
                    <label key={student.id} className={`rounded-lg border px-3 py-2 text-sm flex items-center justify-between ${checked ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'} ${disabled ? 'opacity-50' : ''}`}>
                      <span>{student.name}</span>
                      <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggleMember(student.id)} />
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleCreateMiniProject}
              disabled={creating}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60"
            >
              {creating ? 'Creating...' : 'Create Project Team'}
            </button>
          </div>
        ) : null}

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

        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center transition-colors">
            <p className="text-gray-600 dark:text-gray-400">Loading mini projects...</p>
          </div>
        ) : null}

        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-4 text-center transition-colors">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        ) : null}

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
            <p className="text-gray-600 dark:text-gray-400 mb-2">No mini projects found</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">Try adjusting your filters</p>
          </div>
        )}

        {/* Stats Footer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Mini Projects</p>
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
