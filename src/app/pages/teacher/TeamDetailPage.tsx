import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Download, Share2, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { formatRelativeTime, getMiniProjectById, getMiniProjectStudentSummaries } from '../../services/miniProjectStore';

export function TeamDetailPage() {
  const navigate = useNavigate();
  const { projectId, teamId } = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'tasks'>('overview');
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
          <button onClick={() => navigate('/teacher/projects')} className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
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

  const students = getMiniProjectStudentSummaries(project);
  const selectedStudent = students.find((student) => student.id === teamId) ?? null;
  const visibleActivities = selectedStudent ? selectedStudent.activity : project.activity;
  const visibleTasks = selectedStudent
    ? project.tasks.filter((task) => task.ownerId === selectedStudent.id)
    : project.tasks;

  return (
    <TeacherLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Navigation */}
        <button
          onClick={() => navigate(`/teacher/projects/${project.id}`)}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Mini Project
        </button>

        {/* Team Header */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedStudent ? selectedStudent.name : project.teamName}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{project.name}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {selectedStudent ? `${selectedStudent.participationPercent}%` : `${project.progress}%`}
              </p>
              <p className="text-sm font-semibold mt-1 text-blue-600 dark:text-blue-400">
                {selectedStudent ? 'Participation' : 'Mini Project Progress'}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              {selectedStudent ? 'Message Student' : 'Message Team'}
            </button>
            <button className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Schedule Review
            </button>
            <button className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <button className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {['overview', 'activity', 'tasks'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-4 font-medium text-sm transition-colors border-b-2 ${
                activeTab === tab
                  ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Commits</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedStudent ? selectedStudent.commitCount : project.activity.filter((item) => item.type === 'commit').length}</p>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pushes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedStudent ? selectedStudent.pushCount : project.activity.filter((item) => item.type === 'push').length}</p>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Files changed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedStudent ? selectedStudent.filesChanged : new Set(project.activity.flatMap((item) => item.files)).size}</p>
              </div>
            </div>

            {!selectedStudent ? (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All student audit links</h3>
                <div className="mt-4 space-y-3">
                  {students.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => navigate(`/teacher/projects/${project.id}/teams/${student.id}`)}
                      className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-left dark:border-gray-700"
                    >
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{student.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{student.role}</p>
                      </div>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Open audit</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Student summary</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Role: {selectedStudent.role}</p>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">Current focus: {selectedStudent.currentFocus}</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                  Last activity: {selectedStudent.lastActivity ? formatRelativeTime(selectedStudent.lastActivity) : 'No activity yet'}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Change log</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{visibleActivities.length} entries</p>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {visibleActivities.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{activity.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {activity.studentName} • {activity.type.toUpperCase()} • {formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {activity.type === 'push' ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-xs font-semibold text-green-700 dark:text-green-400">Shared</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-5 h-5 text-orange-500" />
                          <span className="text-xs font-semibold text-orange-700 dark:text-orange-400">Tracked</span>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-3">{activity.description}</p>
                  {activity.files.length > 0 && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded border-l-2 border-blue-500">
                      Files: {activity.files.join(', ')} • +{activity.linesAdded} / -{activity.linesRemoved}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Task ownership</h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {visibleTasks.map((task) => {
                const owner = project.members.find((member) => member.id === task.ownerId);
                return (
                  <div key={task.id} className="px-6 py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{owner?.name ?? 'Unassigned'}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        task.status === 'done'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : task.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {task.status}
                      </span>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">Updated {formatRelativeTime(task.updatedAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
