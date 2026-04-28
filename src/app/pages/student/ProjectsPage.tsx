import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentLayout } from '../../components/student/StudentLayout';
import { CheckCircle, Clock, AlertCircle, Users, GitBranch, Upload } from 'lucide-react';
import { autoFormMiniProjectGroups, createMiniProject, getAllMiniProjects, getStudentDirectory, type StudentDirectoryItem } from '../../services/miniProjectStore';
import type { MiniProjectRecord } from '../../data/miniProjects';

export function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<MiniProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        setProjects(projectData);
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

    const timer = setInterval(() => {
      load();
    }, 10000);

    return () => {
      mounted = false;
      clearInterval(timer);
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
      setProjects(refreshed);
      setShowCreateForm(false);
      setSelectedMembers([]);
      setNewProject({ name: '', subject: 'DBMS', nextMilestone: '', summary: '', branch: '', repoName: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create mini project');
    } finally {
      setCreating(false);
    }
  };

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
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Mini Projects</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Use a simple commit, push, and pull flow to track every mini project change.
            </p>
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create Team Project (Max 4 members)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={newProject.name} onChange={(e) => setNewProject((prev) => ({ ...prev, name: e.target.value }))} placeholder="Project name" className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white" />
              <input value={newProject.subject} onChange={(e) => setNewProject((prev) => ({ ...prev, subject: e.target.value }))} placeholder="Subject" className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white" />
              <input value={newProject.nextMilestone} onChange={(e) => setNewProject((prev) => ({ ...prev, nextMilestone: e.target.value }))} placeholder="Next milestone" className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white" />
              <input value={newProject.branch} onChange={(e) => setNewProject((prev) => ({ ...prev, branch: e.target.value }))} placeholder="Branch name" className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white" />
              <input value={newProject.repoName} onChange={(e) => setNewProject((prev) => ({ ...prev, repoName: e.target.value }))} placeholder="Repo name" className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white" />
              <input value={newProject.summary} onChange={(e) => setNewProject((prev) => ({ ...prev, summary: e.target.value }))} placeholder="Summary (optional)" className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white" />
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

            <button onClick={handleCreateMiniProject} disabled={creating} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60">
              {creating ? 'Creating...' : 'Create Project Team'}
            </button>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
            <div className="flex items-center gap-3">
              <GitBranch className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">Branches Ready</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{projects.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
            <div className="flex items-center gap-3">
              <Upload className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">Pushed Updates</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {projects.reduce((count, project) => count + project.activity.filter((item) => item.type === 'push').length, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">Upcoming Milestones</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{projects.filter((project) => project.status !== 'completed').length}</p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">Loading mini projects...</p>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-center">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        ) : null}

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
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Branch: {project.branch}</p>
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
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{project.teamName}</span>
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
              <button
                onClick={() => navigate(`/student/projects/${project.id}`)}
                className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
}
