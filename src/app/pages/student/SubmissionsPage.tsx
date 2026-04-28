import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Send, UploadCloud } from 'lucide-react';
import { StudentLayout } from '../../components/student/StudentLayout';
import {
  createStudentSubmission,
  getStudentSubmissions,
  type StudentClassOption,
  type StudentSubmissionResponse,
  type SubmissionItem
} from '../../services/submissions';

const STATUS_STYLES: Record<string, string> = {
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
};

export function StudentSubmissionsPage() {
  const [data, setData] = useState<StudentSubmissionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    classId: '',
    title: '',
    description: '',
    submissionLink: '',
    attachmentName: ''
  });
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  async function loadSubmissions() {
    setLoading(true);
    setError(null);

    try {
      const payload = await getStudentSubmissions();
      setData(payload);
      if (!form.classId && payload.classes.length) {
        setForm((previous) => ({
          ...previous,
          classId: payload.classes[0].id
        }));
      }
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Failed to load submissions';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recentSubmissions = useMemo(() => {
    return (data?.submissions ?? []).slice(0, 6);
  }, [data]);

  const classes = data?.classes ?? [];
  const bySubject = data?.bySubject ?? [];

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!form.classId || !form.title.trim()) {
      setError('Select a class and enter a title before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await createStudentSubmission({
        classId: form.classId,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        submissionLink: form.submissionLink.trim() || undefined,
        attachmentName: form.attachmentName.trim() || undefined,
        attachmentFile
      });

      setSuccess('Submission uploaded successfully. It is now pending teacher review.');
      setForm((previous) => ({
        ...previous,
        title: '',
        description: '',
        submissionLink: '',
        attachmentName: ''
      }));
      setAttachmentFile(null);

      await loadSubmissions();
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Failed to submit';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  function renderSubjectItem(subject: {
    subject: string;
    submitted: number;
    approved: number;
    rejected: number;
    pending: number;
  }) {
    const completion = subject.submitted
      ? Math.round((subject.approved / subject.submitted) * 100)
      : 0;

    return (
      <div key={subject.subject} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{subject.subject}</p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {subject.submitted} submissions, {subject.approved} approved
        </p>
        <div className="mt-3 h-2 rounded-full bg-gray-100 dark:bg-gray-700">
          <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${completion}%` }}></div>
        </div>
      </div>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Submissions</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Upload work, track review status, and follow teacher feedback in one place.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading submissions...
          </div>
        ) : null}

        {!loading && data ? (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">Submission Status</p>
                <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">{data.stats.total}</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Total submitted tasks</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">Progress Rates</p>
                <p className="mt-3 text-3xl font-bold text-emerald-600 dark:text-emerald-400">{data.stats.approvalRate}%</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Approval rate</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">Submission Rate</p>
                <p className="mt-3 text-3xl font-bold text-blue-600 dark:text-blue-400">{data.stats.submissionRate}%</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Submissions vs enrolled classes</p>
              </div>
            </div>

            {data.actionNeeded > 0 ? (
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
                <AlertCircle className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="font-semibold">Action needed</p>
                  <p className="text-sm">{data.actionNeeded} submission rejected. Check feedback and resubmit.</p>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]">
              <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                  <UploadCloud className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-lg font-semibold">Submit New Work</h2>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="text-sm">
                    <span className="mb-1 block text-gray-600 dark:text-gray-300">Subject / Class</span>
                    <select
                      value={form.classId}
                      onChange={(event) => setForm((previous) => ({ ...previous, classId: event.target.value }))}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                    >
                      {classes.map((classOption: StudentClassOption) => (
                        <option key={classOption.id} value={classOption.id}>
                          {classOption.subject} - {classOption.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-sm">
                    <span className="mb-1 block text-gray-600 dark:text-gray-300">Title</span>
                    <input
                      value={form.title}
                      onChange={(event) => setForm((previous) => ({ ...previous, title: event.target.value }))}
                      placeholder="Example: SQL Joins Assignment"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </label>

                  <label className="text-sm md:col-span-2">
                    <span className="mb-1 block text-gray-600 dark:text-gray-300">Description</span>
                    <textarea
                      value={form.description}
                      onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
                      rows={3}
                      placeholder="Add details about what you are submitting"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                    ></textarea>
                  </label>

                  <label className="text-sm">
                    <span className="mb-1 block text-gray-600 dark:text-gray-300">Submission URL</span>
                    <input
                      value={form.submissionLink}
                      onChange={(event) => setForm((previous) => ({ ...previous, submissionLink: event.target.value }))}
                      placeholder="https://github.com/..."
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </label>

                  <label className="text-sm">
                    <span className="mb-1 block text-gray-600 dark:text-gray-300">Attachment File</span>
                    <input
                      type="file"
                      onChange={(event) => setAttachmentFile(event.target.files?.[0] ?? null)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:file:bg-indigo-900/40 dark:file:text-indigo-200"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Optional. Upload a file so teachers can open it directly from the exported sheet.
                    </p>
                    {attachmentFile ? (
                      <p className="mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        Selected: {attachmentFile.name}
                      </p>
                    ) : null}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? 'Submitting...' : 'Submit for Review'}
                </button>
              </form>

              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">By Subject</h3>
                  <div className="mt-3 space-y-3">
                    {bySubject.length ? bySubject.map(renderSubjectItem) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No submissions yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Submissions</h2>
              <div className="mt-4 space-y-3">
                {recentSubmissions.length ? recentSubmissions.map((submission: SubmissionItem) => (
                  <div key={submission.id} className="rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-700">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{submission.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {submission.subject} • {submission.class_name} • {new Date(submission.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[submission.status]}`}>
                        {submission.status}
                      </span>
                    </div>
                    {submission.feedback ? (
                      <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-300">
                        Feedback: {submission.feedback}
                      </p>
                    ) : null}
                    {submission.attachment_url ? (
                      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        Attachment:{' '}
                        <a
                          href={submission.attachment_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          {submission.attachment_name || 'Download file'}
                        </a>
                      </p>
                    ) : null}
                    {typeof submission.marks === 'number' ? (
                      <p className="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                        Score: {submission.marks}/100
                      </p>
                    ) : null}
                  </div>
                )) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No submissions found. Start with your first upload.</p>
                )}
              </div>
            </div>
          </>
        ) : null}

        {error ? (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        ) : null}

        {success ? (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-300">
            <CheckCircle2 className="h-4 w-4" />
            <span>{success}</span>
          </div>
        ) : null}
      </div>
    </StudentLayout>
  );
}
