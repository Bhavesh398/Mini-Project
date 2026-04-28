import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpToLine,
  CheckCircle2,
  FileCode2,
  GitBranch,
  GitCommitHorizontal,
  History,
  RefreshCcw,
} from 'lucide-react';
import { StudentLayout } from '../../components/student/StudentLayout';
import { getUserSession } from '../../services/auth';
import {
  formatRelativeTime,
  getMiniProjectById,
  recordMiniProjectCommit,
  recordMiniProjectPull,
  recordMiniProjectPush,
} from '../../services/miniProjectStore';

interface DraftCommit {
  title: string;
  description: string;
  files: string[];
}

export function MiniProjectDetailPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const user = getUserSession();
  const studentName = user?.name ?? 'Student User';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [pendingPush, setPendingPush] = useState<DraftCommit | null>(null);
  const [syncMessage, setSyncMessage] = useState('');
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
      <StudentLayout>
        <div className="max-w-4xl mx-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8">
          <p className="text-gray-600 dark:text-gray-400">Loading mini project...</p>
        </div>
      </StudentLayout>
    );
  }

  if (!project) {
    return (
      <StudentLayout>
        <div className="max-w-4xl mx-auto space-y-4">
          <button
            onClick={() => navigate('/student/projects')}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Mini Projects
          </button>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mini project not found</h1>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const myActivity = project.activity.filter((item) => item.studentName === studentName).slice(0, 5);

  const toggleFile = (fileName: string) => {
    setSelectedFiles((current) =>
      current.includes(fileName)
        ? current.filter((item) => item !== fileName)
        : [...current, fileName],
    );
  };

  const refreshProject = async () => {
    if (!projectId) return;
    const latest = await getMiniProjectById(projectId);
    setProject(latest);
  };

  const handleCommit = async () => {
    if (!title.trim() || selectedFiles.length === 0) {
      setSyncMessage('Add a commit title and select at least one file before committing.');
      return;
    }

    await recordMiniProjectCommit(project.id, {
      studentName,
      title: title.trim(),
      description: description.trim() || 'Updated mini project work items and prepared the change for push.',
      files: selectedFiles,
      branch: project.branch,
    });

    setPendingPush({ title: title.trim(), description: description.trim(), files: selectedFiles });
    setTitle('');
    setDescription('');
    setSelectedFiles([]);
    setSyncMessage('Commit saved locally. Push it when you are ready to share it with the teacher.');
    await refreshProject();
  };

  const handlePush = async () => {
    if (!pendingPush) {
      setSyncMessage('Create a commit first, then push it to the shared mini project log.');
      return;
    }

    await recordMiniProjectPush(project.id, {
      studentName,
      title: `Push: ${pendingPush.title}`,
      description: pendingPush.description || 'Pushed the latest local commit to the shared mini project branch.',
      files: pendingPush.files,
      branch: project.branch,
    });

    setPendingPush(null);
    setSyncMessage('Push complete. Your teacher can now review the latest update.');
    await refreshProject();
  };

  const handlePull = async () => {
    await recordMiniProjectPull(project.id, studentName, project.branch);
    setSyncMessage('Pulled the latest updates from the shared mini project branch.');
    await refreshProject();
  };

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/student/projects')}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Mini Projects
        </button>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{project.subject}</p>
              <p className="mt-3 max-w-3xl text-sm text-gray-700 dark:text-gray-300">{project.summary}</p>
            </div>
            <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-wide text-blue-700 dark:text-blue-300">Progress</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{project.progress}%</p>
              <p className="text-xs text-blue-700/80 dark:text-blue-300/80">{project.nextMilestone}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <GitBranch className="w-4 h-4" />
                Branch
              </div>
              <p className="mt-2 font-semibold text-gray-900 dark:text-white">{project.branch}</p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <RefreshCcw className="w-4 h-4" />
                Repo Status
              </div>
              <p className="mt-2 font-semibold text-gray-900 dark:text-white capitalize">{project.repoStatus}</p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <History className="w-4 h-4" />
                Total Updates
              </div>
              <p className="mt-2 font-semibold text-gray-900 dark:text-white">{project.activity.length}</p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FileCode2 className="w-4 h-4" />
                Team
              </div>
              <p className="mt-2 font-semibold text-gray-900 dark:text-white">{project.teamName}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Easy mini project workflow</h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Follow the same simple order every time: pull, commit, then push.
                  </p>
                </div>
                <div className="hidden rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-200 md:block">
                  Teacher review becomes visible after each push.
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  { step: '1', title: 'Pull', text: 'Sync the latest branch changes before editing.' },
                  { step: '2', title: 'Commit', text: 'Record what you changed and which files were touched.' },
                  { step: '3', title: 'Push', text: 'Share the update so your teacher and teammates can review it.' },
                ].map((item) => (
                  <div key={item.step} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                      {item.step}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Commit title</label>
                    <input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Example: Update schema relationships"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Describe the change</label>
                    <input
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Explain what you improved or fixed"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">Files changed</label>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {project.availableFiles.map((fileName) => {
                      const checked = selectedFiles.includes(fileName);
                      return (
                        <label
                          key={fileName}
                          className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors ${
                            checked
                              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-200'
                              : 'border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                          }`}
                        >
                          <span>{fileName}</span>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleFile(fileName)}
                            className="h-4 w-4"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={handlePull}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <ArrowDownToLine className="w-4 h-4" />
                    Pull Latest
                  </button>
                  <button
                    onClick={handleCommit}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                  >
                    <GitCommitHorizontal className="w-4 h-4" />
                    Commit Changes
                  </button>
                  <button
                    onClick={handlePush}
                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
                  >
                    <ArrowUpToLine className="w-4 h-4" />
                    Push to Shared Log
                  </button>
                </div>

                {syncMessage ? (
                  <div className="mt-4 rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                    {syncMessage}
                  </div>
                ) : null}

                {pendingPush ? (
                  <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                    <p className="text-sm font-semibold text-green-700 dark:text-green-300">Ready to push</p>
                    <p className="mt-1 text-sm text-green-800 dark:text-green-200">{pendingPush.title}</p>
                    <p className="mt-2 text-xs text-green-700/80 dark:text-green-300/80">
                      Files: {pendingPush.files.join(', ')}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Team change timeline</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Every commit, push, and pull is listed here so the teacher can follow the full mini project history.
              </p>

              <div className="mt-6 space-y-4">
                {project.activity.map((item) => (
                  <div key={item.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            item.type === 'commit'
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                              : item.type === 'push'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}>
                            {item.type.toUpperCase()}
                          </span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                          {item.studentName} • {item.branch} • {item.files.length > 0 ? item.files.join(', ') : 'No file diff attached'}
                        </p>
                      </div>
                      <div className="text-right text-xs text-gray-500 dark:text-gray-500">
                        <p>{formatRelativeTime(item.timestamp)}</p>
                        <p className="mt-1">+{item.linesAdded} / -{item.linesRemoved}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your latest updates</h2>
              <div className="mt-4 space-y-3">
                {myActivity.length > 0 ? (
                  myActivity.map((item) => (
                    <div key={item.id} className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{formatRelativeTime(item.timestamp)}</p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600 dark:bg-gray-700/50 dark:text-gray-300">
                    No updates yet. Start by pulling the branch and committing your first change.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Mini project goals</h2>
              <div className="mt-4 space-y-3">
                {project.goals.map((goal) => (
                  <div key={goal} className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                    <CheckCircle2 className="mt-0.5 w-4 h-4 text-green-600 dark:text-green-400" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">{goal}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}