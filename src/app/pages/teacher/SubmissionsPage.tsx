import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Download, Loader2, Plus } from 'lucide-react';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import {
  downloadSubjectWiseSubmissionsExport,
  downloadSubmissionStatusReport,
  getTeacherSubmissions,
  updateSubmissionStatus,
  type TeacherSubmissionResponse
} from '../../services/submissions';
import {
  createTask,
  getTeacherTasks,
  gradeTaskSubmission,
  type TeacherTasksResponse
} from '../../../services/tasks';
import { getUserClasses, type TeacherClass } from '../../../services/teacherClasses';

const BACKEND_BASE_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:4000';

function toAbsoluteAttachmentUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${BACKEND_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

const STATUS_STYLES: Record<string, string> = {
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
};

interface CombinedSubmission {
  key: string;
  source: 'direct' | 'task';
  id: string;
  taskId?: string;
  className: string;
  subject: string;
  studentName: string;
  title: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  submissionLink: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  submissionText: string | null;
  createdAt: string;
}

interface TaskOverviewRow {
  id: string;
  title: string;
  className: string;
  subject: string;
  dueDate: string | null;
  completed: number;
  totalSubmissions: number;
}

export function TeacherSubmissionsPage() {
  const [data, setData] = useState<TeacherSubmissionResponse | null>(null);
  const [taskData, setTaskData] = useState<TeacherTasksResponse | null>(null);
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingStatusReport, setIsDownloadingStatusReport] = useState(false);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [showCreateTaskForm, setShowCreateTaskForm] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskForm, setTaskForm] = useState({
    classId: '',
    title: '',
    description: '',
    dueDate: ''
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadSubmissions() {
    setLoading(true);
    setErrorMessage(null);

    try {
      const [submissionPayload, taskPayload, classOptions] = await Promise.all([
        getTeacherSubmissions(),
        getTeacherTasks(),
        getUserClasses()
      ]);
      setData(submissionPayload);
      setTaskData(taskPayload);
      setClasses(classOptions);
      setTaskForm((previous) => ({
        ...previous,
        classId: previous.classId || classOptions[0]?.id || ''
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load submissions';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const combinedSubmissions = useMemo<CombinedSubmission[]>(() => {
    const direct: CombinedSubmission[] = (data?.submissions ?? []).map((submission) => ({
      key: `direct:${submission.id}`,
      source: 'direct',
      id: submission.id,
      className: submission.class_name,
      subject: submission.subject,
      studentName: submission.student_name,
      title: submission.title,
      status: submission.status,
      submissionLink: submission.submission_link,
      attachmentUrl: submission.attachment_url,
      attachmentName: submission.attachment_name,
      submissionText: submission.description,
      createdAt: submission.created_at
    }));

    const taskById = new Map((taskData?.tasks ?? []).map((task) => [task.id, task]));

    const taskRows: CombinedSubmission[] = (taskData?.submissions ?? []).map((submission) => {
      const task = taskById.get(submission.task_id);
      return {
        key: `task:${submission.id}`,
        source: 'task',
        id: submission.id,
        taskId: submission.task_id,
        className: task?.class_name ?? 'Unknown Class',
        subject: task?.subject ?? 'Unknown Subject',
        studentName: submission.student_name,
        title: task?.title ?? 'Task Submission',
        status: submission.status,
        submissionLink: submission.submission_link,
        attachmentUrl: null,
        attachmentName: submission.attachment_name,
        submissionText: submission.submission_text,
        createdAt: submission.submitted_at
      };
    });

    return [...direct, ...taskRows].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return bTime - aTime;
    });
  }, [data, taskData]);

  const pendingSubmissions = useMemo(
    () => combinedSubmissions.filter((submission) => submission.status === 'pending' || submission.status === 'submitted'),
    [combinedSubmissions]
  );

  const overviewStats = useMemo(() => {
    return {
      total: combinedSubmissions.length,
      pending: combinedSubmissions.filter((row) => row.status === 'pending' || row.status === 'submitted').length,
      approved: combinedSubmissions.filter((row) => row.status === 'approved').length,
      rejected: combinedSubmissions.filter((row) => row.status === 'rejected').length
    };
  }, [combinedSubmissions]);

  const taskOverviewRows = useMemo<TaskOverviewRow[]>(() => {
    const submissionsByTask = new Map<string, { total: number; completed: number }>();

    for (const submission of taskData?.submissions ?? []) {
      const current = submissionsByTask.get(submission.task_id) ?? { total: 0, completed: 0 };
      current.total += 1;
      if (submission.status !== 'pending') {
        current.completed += 1;
      }
      submissionsByTask.set(submission.task_id, current);
    }

    return (taskData?.tasks ?? []).map((task) => {
      const stats = submissionsByTask.get(task.id) ?? { total: 0, completed: 0 };
      return {
        id: task.id,
        title: task.title,
        className: task.class_name,
        subject: task.subject,
        dueDate: task.due_date,
        completed: stats.completed,
        totalSubmissions: stats.total
      };
    });
  }, [taskData]);

  async function handleDownload() {
    setIsDownloading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const filename = await downloadSubjectWiseSubmissionsExport();
      setSuccessMessage(`Downloaded ${filename}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to download submissions export';
      setErrorMessage(message);
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleDownloadStatusReport() {
    setIsDownloadingStatusReport(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const filename = await downloadSubmissionStatusReport();
      setSuccessMessage(`Downloaded ${filename}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to download submission status report';
      setErrorMessage(message);
    } finally {
      setIsDownloadingStatusReport(false);
    }
  }

  async function handleReview(submission: CombinedSubmission, status: 'approved' | 'rejected') {
    const feedback = window.prompt(
      status === 'approved' ? 'Optional feedback for approval:' : 'Feedback for rejection:',
      ''
    );

    if (feedback === null) {
      return;
    }

    let marks: number | undefined;
    const marksInput = window.prompt('Enter marks out of 100 (optional):', '');
    if (marksInput && marksInput.trim().length > 0) {
      const parsed = Number(marksInput);
      if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
        setErrorMessage('Marks must be a number between 0 and 100.');
        return;
      }
      marks = parsed;
    }

    setActionBusyId(submission.key);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      if (submission.source === 'task' && submission.taskId) {
        await gradeTaskSubmission(submission.taskId, submission.id, {
          status,
          feedback: feedback.trim() || undefined,
          marks
        });
      } else {
        await updateSubmissionStatus(submission.id, {
          status,
          feedback: feedback.trim() || undefined,
          marks
        });
      }
      setSuccessMessage(`Submission ${status}.`);
      await loadSubmissions();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update submission status';
      setErrorMessage(message);
    } finally {
      setActionBusyId(null);
    }
  }

  async function handleCreateTask(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!taskForm.classId || !taskForm.title.trim()) {
      setErrorMessage('Class and title are required to create a task.');
      return;
    }

    setIsCreatingTask(true);
    try {
      await createTask({
        classId: taskForm.classId,
        title: taskForm.title.trim(),
        description: taskForm.description.trim() || undefined,
        dueDate: taskForm.dueDate || undefined
      });

      setSuccessMessage('Task created successfully. Students can now complete and submit it.');
      setTaskForm((previous) => ({
        ...previous,
        title: '',
        description: '',
        dueDate: ''
      }));
      setShowCreateTaskForm(false);
      await loadSubmissions();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create task';
      setErrorMessage(message);
    } finally {
      setIsCreatingTask(false);
    }
  }

  return (
    <TeacherLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Submissions Review</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Review student uploads, approve or reject submissions, and export reports.
            </p>
          </div>

          <div className="inline-flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCreateTaskForm(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Create Task
            </button>

            <button
              type="button"
              onClick={handleDownloadStatusReport}
              disabled={isDownloadingStatusReport}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Download className="h-4 w-4" />
              {isDownloadingStatusReport ? 'Preparing...' : 'Status Report'}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Download className="h-4 w-4" />
              {isDownloading ? 'Preparing Export...' : 'Download Submissions Excel'}
            </button>
          </div>
        </div>

        {showCreateTaskForm ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create Task From Submissions Panel</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Created tasks will appear for students in their task list, and submitted work will show up here.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateTaskForm(false)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Class
                    <select
                      value={taskForm.classId}
                      onChange={(event) => setTaskForm((previous) => ({ ...previous, classId: event.target.value }))}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                    >
                      {classes.map((classOption) => (
                        <option key={classOption.id} value={classOption.id}>
                          {classOption.name} - {classOption.subject}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Due date
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(event) => setTaskForm((previous) => ({ ...previous, dueDate: event.target.value }))}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </label>

                  <label className="text-sm text-gray-700 dark:text-gray-300 md:col-span-2">
                    Title
                    <input
                      value={taskForm.title}
                      onChange={(event) => setTaskForm((previous) => ({ ...previous, title: event.target.value }))}
                      placeholder="e.g., DBMS Normalization Assignment"
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </label>

                  <label className="text-sm text-gray-700 dark:text-gray-300 md:col-span-2">
                    Description
                    <textarea
                      rows={3}
                      value={taskForm.description}
                      onChange={(event) => setTaskForm((previous) => ({ ...previous, description: event.target.value }))}
                      placeholder="Add instructions for students"
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                    ></textarea>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isCreatingTask}
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isCreatingTask ? 'Creating Task...' : 'Create Task'}
                </button>
              </form>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading submissions...
          </div>
        ) : null}

        {!loading && data ? (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{overviewStats.total}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                <p className="mt-2 text-2xl font-semibold text-amber-600 dark:text-amber-400">{overviewStats.pending}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{overviewStats.approved}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">Rejected</p>
                <p className="mt-2 text-2xl font-semibold text-red-600 dark:text-red-400">{overviewStats.rejected}</p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Created Tasks</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Tasks you assigned will appear here immediately, even before submissions come in.
              </p>

              {taskOverviewRows.length === 0 ? (
                <div className="mt-4 rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
                  No tasks created yet.
                </div>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
                        <th className="py-3 pr-4">Task</th>
                        <th className="py-3 pr-4">Class</th>
                        <th className="py-3 pr-4">Subject</th>
                        <th className="py-3 pr-4">Due</th>
                        <th className="py-3 text-right">Completed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {taskOverviewRows.map((taskRow) => (
                        <tr key={taskRow.id}>
                          <td className="py-3 pr-4 text-sm font-medium text-gray-900 dark:text-white">{taskRow.title}</td>
                          <td className="py-3 pr-4 text-sm text-gray-700 dark:text-gray-300">{taskRow.className}</td>
                          <td className="py-3 pr-4 text-sm text-gray-700 dark:text-gray-300">{taskRow.subject}</td>
                          <td className="py-3 pr-4 text-sm text-gray-600 dark:text-gray-400">
                            {taskRow.dueDate ? new Date(taskRow.dueDate).toLocaleDateString() : 'No due date'}
                          </td>
                          <td className="py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                            {taskRow.completed}/{taskRow.totalSubmissions}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Action Queue</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {pendingSubmissions.length} submissions waiting for review.
              </p>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[820px]">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
                      <th className="py-3 pr-4">Type</th>
                      <th className="py-3 pr-4">Student</th>
                      <th className="py-3 pr-4">Subject</th>
                      <th className="py-3 pr-4">Title</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4">Submitted</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {combinedSubmissions.map((submission: CombinedSubmission) => {
                      const isBusy = actionBusyId === submission.key;
                      const needsReview = submission.status === 'pending' || submission.status === 'submitted';
                      return (
                        <tr key={submission.key}>
                          <td className="py-3 pr-4">
                            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                              {submission.source === 'task' ? 'Task' : 'Direct'}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <p className="font-medium text-gray-900 dark:text-white">{submission.studentName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{submission.className}</p>
                          </td>
                          <td className="py-3 pr-4 text-sm text-gray-700 dark:text-gray-300">{submission.subject}</td>
                          <td className="py-3 pr-4">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{submission.title}</p>
                            {submission.attachmentUrl ? (
                              <a
                                href={toAbsoluteAttachmentUrl(submission.attachmentUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                              >
                                {submission.attachmentName || 'Open attachment'}
                              </a>
                            ) : submission.submissionLink ? (
                              <a
                                href={submission.submissionLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                              >
                                Open submission
                              </a>
                            ) : submission.attachmentName ? (
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                Attachment: {submission.attachmentName}
                              </p>
                            ) : submission.submissionText ? (
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                {submission.submissionText}
                              </p>
                            ) : null}
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[submission.status]}`}>
                              {submission.status}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-sm text-gray-600 dark:text-gray-400">
                            {new Date(submission.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 text-right">
                            {needsReview ? (
                              <div className="inline-flex gap-2">
                                <button
                                  onClick={() => handleReview(submission, 'approved')}
                                  disabled={isBusy}
                                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-70"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReview(submission, 'rejected')}
                                  disabled={isBusy}
                                  className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-70"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500 dark:text-gray-400">Reviewed</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}

        {successMessage ? (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-300">
            <CheckCircle2 className="h-4 w-4" />
            <span>{successMessage}</span>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle className="h-4 w-4" />
            <span>{errorMessage}</span>
          </div>
        ) : null}
      </div>
    </TeacherLayout>
  );
}
