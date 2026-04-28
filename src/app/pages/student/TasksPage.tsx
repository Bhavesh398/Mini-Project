import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Clock, Send } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { StudentLayout } from '../../components/student/StudentLayout';
import { getStudentTasks, submitTask, Task, TaskSubmission, SubmitTaskPayload } from '../../../services/tasks';

interface TaskGroup {
  class_id: string;
  class_name: string;
  subject: string;
  tasks: Task[];
}

export const StudentTasksPage: React.FC = () => {
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([]);
  const [submissions, setSubmissions] = useState<Map<string, TaskSubmission>>(new Map());
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, SubmitTaskPayload>>({});

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { tasks, submissions: submissionsList } = await getStudentTasks();

      // Group tasks by class
      const grouped = new Map<string, TaskGroup>();
      tasks.forEach((task) => {
        const key = task.class_id;
        if (!grouped.has(key)) {
          grouped.set(key, {
            class_id: task.class_id,
            class_name: task.class_name,
            subject: task.subject,
            tasks: []
          });
        }
        grouped.get(key)!.tasks.push(task);
      });

      setTaskGroups(Array.from(grouped.values()));

      // Create submission map by task_id
      const submissionMap = new Map<string, TaskSubmission>();
      submissionsList.forEach((sub) => {
        submissionMap.set(sub.task_id, sub);
      });
      setSubmissions(submissionMap);

      // Expand first class by default
      if (grouped.size > 0) {
        const firstClass = Array.from(grouped.keys())[0];
        setExpandedClasses(new Set([firstClass]));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const toggleClassExpanded = (classId: string) => {
    const newSet = new Set(expandedClasses);
    if (newSet.has(classId)) {
      newSet.delete(classId);
    } else {
      newSet.add(classId);
    }
    setExpandedClasses(newSet);
  };

  const toggleSubmissionExpanded = (taskId: string) => {
    const newSet = new Set(expandedSubmissions);
    if (newSet.has(taskId)) {
      newSet.delete(taskId);
    } else {
      newSet.add(taskId);
    }
    setExpandedSubmissions(newSet);
  };

  const handleFormChange = (taskId: string, field: keyof SubmitTaskPayload, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [field]: value
      }
    }));
  };

  const handleSubmitTask = async (taskId: string) => {
    try {
      setSubmittingTaskId(taskId);
      const payload = formData[taskId] || {};

      // Validate at least one field is filled
      if (!payload.submissionText && !payload.submissionLink && !payload.attachmentName) {
        setError('Please provide submission text, a link, or an attachment name');
        return;
      }

      const submission = await submitTask(taskId, payload);
      setSubmissions(new Map(submissions).set(taskId, submission));
      setFormData((prev) => {
        const newData = { ...prev };
        delete newData[taskId];
        return newData;
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit task');
    } finally {
      setSubmittingTaskId(null);
    }
  };

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-gray-500';
      case 'submitted':
        return 'text-yellow-600';
      case 'approved':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const getSubmissionStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'rejected':
        return <AlertCircle className="w-5 h-5" />;
      case 'submitted':
        return <Clock className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400">View assigned tasks and submit your work</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 border-red-300 dark:border-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {taskGroups.length === 0 ? (
          <Card className="p-8 text-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No tasks assigned yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {taskGroups.map((group) => (
              <div key={group.class_id}>
                <button
                  onClick={() => toggleClassExpanded(group.class_id)}
                  className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex-1 text-left">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{group.class_name}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{group.subject}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {group.tasks.length} task{group.tasks.length !== 1 ? 's' : ''}
                    </span>
                    {expandedClasses.has(group.class_id) ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {expandedClasses.has(group.class_id) && (
                  <div className="mt-2 space-y-3 ml-2">
                    {group.tasks.map((task) => {
                      const taskSubmission = submissions.get(task.id);
                      const isExpanded = expandedSubmissions.has(task.id);
                      const hasExistingSubmission = !!taskSubmission;

                      return (
                        <Card key={task.id} className="overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                          <button
                            onClick={() => toggleSubmissionExpanded(task.id)}
                            className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-start justify-between"
                          >
                            <div className="flex-1 text-left">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                              {task.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{task.description}</p>
                              )}
                              {task.due_date && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                  Due: {new Date(task.due_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                              {hasExistingSubmission && (
                                <div className={`flex items-center gap-1 ${getSubmissionStatusColor(taskSubmission.status)}`}>
                                  {getSubmissionStatusIcon(taskSubmission.status)}
                                  <span className="text-xs font-medium capitalize">{taskSubmission.status}</span>
                                </div>
                              )}
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/30 space-y-4">
                              {!hasExistingSubmission ? (
                                <>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                      Submission Text (Optional)
                                    </label>
                                    <textarea
                                      value={formData[task.id]?.submissionText || ''}
                                      onChange={(e) =>
                                        handleFormChange(task.id, 'submissionText', e.target.value)
                                      }
                                      placeholder="Enter your response or notes..."
                                      className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                      Submission Link (Optional)
                                    </label>
                                    <Input
                                      type="url"
                                      value={formData[task.id]?.submissionLink || ''}
                                      onChange={(e) =>
                                        handleFormChange(task.id, 'submissionLink', e.target.value)
                                      }
                                      placeholder="https://example.com/your-work"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                      Attachment Name (Optional)
                                    </label>
                                    <Input
                                      value={formData[task.id]?.attachmentName || ''}
                                      onChange={(e) =>
                                        handleFormChange(task.id, 'attachmentName', e.target.value)
                                      }
                                      placeholder="e.g., assignment.pdf"
                                    />
                                  </div>

                                  <Button
                                    onClick={() => handleSubmitTask(task.id)}
                                    disabled={submittingTaskId === task.id}
                                    className="w-full"
                                  >
                                    <Send className="w-4 h-4 mr-2" />
                                    {submittingTaskId === task.id ? 'Submitting...' : 'Submit Task'}
                                  </Button>
                                </>
                              ) : (
                                <div className="space-y-3">
                                  {taskSubmission.submission_text && (
                                    <div>
                                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Submission</p>
                                      <p className="text-sm text-gray-600 dark:text-gray-200 mt-1 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                        {taskSubmission.submission_text}
                                      </p>
                                    </div>
                                  )}

                                  {taskSubmission.submission_link && (
                                    <div>
                                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Submission Link</p>
                                      <a
                                        href={taskSubmission.submission_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline mt-1"
                                      >
                                        {taskSubmission.submission_link}
                                      </a>
                                    </div>
                                  )}

                                  {taskSubmission.attachment_name && (
                                    <div>
                                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Attachment</p>
                                      <p className="text-sm text-gray-600 dark:text-gray-200">{taskSubmission.attachment_name}</p>
                                    </div>
                                  )}

                                  <div className="border-t pt-3">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Submitted: {new Date(taskSubmission.submitted_at).toLocaleString()}
                                    </p>
                                  </div>

                                  {taskSubmission.status !== 'pending' && (
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {taskSubmission.status === 'approved'
                                          ? 'Approved'
                                          : taskSubmission.status === 'rejected'
                                          ? 'Needs Revision'
                                          : 'Status'}
                                      </p>

                                      {taskSubmission.marks !== null ? (
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                                          {taskSubmission.marks}/100
                                        </p>
                                      ) : null}

                                      {taskSubmission.feedback && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{taskSubmission.feedback}</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentTasksPage;
