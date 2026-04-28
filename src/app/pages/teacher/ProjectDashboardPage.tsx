import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Calendar, GitBranch, Users, Upload, FolderGit2 } from 'lucide-react';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { formatRelativeTime, getMiniProjectById, getMiniProjectStudentSummaries } from '../../services/miniProjectStore';

export function ProjectDashboardPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    if (!projectId) {
      setProject(null);
      setLoading(false);
      return;
    }

    getMiniProjectById(projectId)
      .then((data) => {
        if (!mounted) return;
        setProject(data);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [projectId]);

  if (loading) {
    return (
      <TeacherLayout>
        <div className="max-w-4xl mx-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8">
          <p className="text-gray-600 dark:text-gray-400">Loading mini project...</p>
        </div>
      </TeacherLayout>
    );
  }

  if (!project) {
    return (
      <TeacherLayout>
        <div className="max-w-4xl mx-auto space-y-4">
          <button
            onClick={() => navigate('/teacher/projects')}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Mini Projects
          </button>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mini project not found</h1>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  const studentSummaries = getMiniProjectStudentSummaries(project);
  const pushedUpdates = project.activity.filter((item) => item.type === 'push').length;
  const filesTouched = new Set(project.activity.flatMap((item) => item.files)).size;

  return (
    <TeacherLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Navigation */}
        <button
          onClick={() => navigate('/teacher/projects')}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Mini Projects
        </button>

        {/* Sticky Project Summary */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 sticky top-20 z-10 transition-colors shadow-md">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{project.subject}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">{project.summary}</p>
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
              <p className="text-xs text-gray-600 dark:text-gray-400">Next milestone: {project.nextMilestone}</p>
            </div>

            {/* Timeline */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Branch: {project.branch}</span>
              </div>
              <div className="text-gray-400">→</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">Repo status: {project.repoStatus}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Contributors</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{studentSummaries.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <div className="flex items-center gap-3">
              <Upload className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pushed updates</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{pushedUpdates}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <div className="flex items-center gap-3">
              <FolderGit2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Files touched</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{filesTouched}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <div className="flex items-center gap-3">
              <GitBranch className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active branch</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{project.branch}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Student contribution view</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              See who committed changes, pushed work, and still has pending tasks.
            </p>

            <div className="mt-6 space-y-4">
              {studentSummaries.map((student) => (
                <div key={student.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{student.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{student.role}</p>
                      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">Focus: {student.currentFocus}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                      <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700/50">
                        <p className="text-gray-500 dark:text-gray-400">Commits</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{student.commitCount}</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700/50">
                        <p className="text-gray-500 dark:text-gray-400">Pushes</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{student.pushCount}</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700/50">
                        <p className="text-gray-500 dark:text-gray-400">Done</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{student.tasksCompleted}</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700/50">
                        <p className="text-gray-500 dark:text-gray-400">Pending</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{student.tasksPending}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Last activity: {student.lastActivity ? formatRelativeTime(student.lastActivity) : 'No activity yet'}
                    </p>
                    <button
                      onClick={() => navigate(`/teacher/projects/${project.id}/teams/${student.id}`)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      Open student audit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent mini project log</h2>
            <div className="mt-4 space-y-3">
              {project.activity.slice(0, 8).map((item) => (
                <div key={item.id} className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                        {item.studentName} • {item.type.toUpperCase()} • {item.files.length > 0 ? item.files.join(', ') : 'No file list'}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-500">{formatRelativeTime(item.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
