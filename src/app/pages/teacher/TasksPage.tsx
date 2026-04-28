import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle2, XCircle, Clock, Save } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import {
  getTeacherTasks,
  createTask,
  gradeTaskSubmission,
  Task,
  TaskSubmission,
  CreateTaskPayload,
  GradeTaskPayload
} from '../../../services/tasks';
import { getUserClasses } from '../../../services/teacherClasses';

interface ClassOption {
  id: string;
  name: string;
  subject: string;
}

interface GradingForm {
  submissionId: string;
  status: 'approved' | 'rejected';
  marks: number;
  feedback: string;
}

export const TeacherTasksPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [creatingTask, setCreatingTask] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<string | null>(null);
  const [gradingForms, setGradingForms] = useState<Record<string, GradingForm>>({});

  const [formData, setFormData] = useState<CreateTaskPayload>({
    classId: '',
    title: '',
    description: '',
    dueDate: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [classesData, tasksData] = await Promise.all([getUserClasses(), getTeacherTasks()]);
      setClasses(classesData);
      setTasks(tasksData.tasks);
      setSubmissions(tasksData.submissions);
      if (classesData.length > 0) {
        setFormData((prev) => ({ ...prev, classId: classesData[0].id }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      setCreatingTask(true);
      setCreateError(null);

      if (!formData.classId || !formData.title.trim()) {
        setCreateError('Class and title are required');
        return;
      }

      const task = await createTask({
        classId: formData.classId,
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        dueDate: formData.dueDate || undefined
      });

      setTasks([task, ...tasks]);
      setFormData({
        classId: classes[0]?.id || '',
        title: '',
        description: '',
        dueDate: ''
      });
      setShowCreateForm(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setCreatingTask(false);
    }
  };

  const handleGradeSubmission = async (taskId: string, submissionId: string) => {
    try {
      setGradingSubmission(submissionId);
      const form = gradingForms[submissionId];

      if (!form || form.status === undefined) {
        setError('Please select approval status');
        return;
      }

      const payload: GradeTaskPayload = {
        status: form.status,
        marks: form.marks,
        feedback: form.feedback
      };

      const updatedSubmission = await gradeTaskSubmission(taskId, submissionId, payload);
      setSubmissions(submissions.map((s) => (s.id === submissionId ? updatedSubmission : s)));
      setGradingForms((prev) => {
        const newForms = { ...prev };
        delete newForms[submissionId];
        return newForms;
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to grade submission');
    } finally {
      setGradingSubmission(null);
    }
  };

  const toggleTaskExpanded = (taskId: string) => {
    const newSet = new Set(expandedTasks);
    if (newSet.has(taskId)) {
      newSet.delete(taskId);
    } else {
      newSet.add(taskId);
    }
    setExpandedTasks(newSet);
  };

  const toggleSubmissionExpanded = (submissionId: string) => {
    const newSet = new Set(expandedSubmissions);
    if (newSet.has(submissionId)) {
      newSet.delete(submissionId);
    } else {
      newSet.add(submissionId);
    }
    setExpandedSubmissions(newSet);
  };

  const getTaskSubmissions = (taskId: string): TaskSubmission[] => {
    return submissions.filter((s) => s.task_id === taskId);
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
        return <XCircle className="w-5 h-5" />;
      case 'submitted':
        return <Clock className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Task Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Create tasks and review student submissions</p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)} variant="default">
            {showCreateForm ? 'Cancel' : '+ Create Task'}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 border-red-300 dark:border-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {showCreateForm && (
          <Card className="p-6 mb-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Task</h2>

            {createError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{createError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Class</label>
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.subject})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title (Required)</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Chapter 5 Quiz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Task instructions and details..."
                  className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
                <Input
                  type="datetime-local"
                  value={formData.dueDate || ''}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>

              <Button onClick={handleCreateTask} disabled={creatingTask} className="w-full">
                {creatingTask ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          </Card>
        )}

        {tasks.length === 0 ? (
          <Card className="p-8 text-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No tasks created yet</p>
            <Button onClick={() => setShowCreateForm(true)} variant="outline" className="mt-4">
              Create Your First Task
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const taskSubmissions = getTaskSubmissions(task.id);
              const submittedCount = taskSubmissions.filter((s) => s.status === 'submitted').length;
              const approvedCount = taskSubmissions.filter((s) => s.status === 'approved').length;
              const rejectedCount = taskSubmissions.filter((s) => s.status === 'rejected').length;

              return (
                <Card key={task.id} className="overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <button
                    onClick={() => toggleTaskExpanded(task.id)}
                    className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-start justify-between"
                  >
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                        <span className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 px-2 py-1 rounded text-xs font-medium">
                          {task.class_name}
                        </span>
                      </div>
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
                      <div className="flex gap-2 text-xs">
                        {submittedCount > 0 && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            {submittedCount} submitted
                          </span>
                        )}
                        {approvedCount > 0 && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                            {approvedCount} approved
                          </span>
                        )}
                        {rejectedCount > 0 && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                            {rejectedCount} revision
                          </span>
                        )}
                      </div>
                      {expandedTasks.has(task.id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {expandedTasks.has(task.id) && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/30">
                      {taskSubmissions.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">No submissions yet</p>
                      ) : (
                        <div className="space-y-3">
                          {taskSubmissions.map((submission) => {
                            const isExpanded = expandedSubmissions.has(submission.id);
                            const isGrading = gradingSubmission === submission.id;
                            const form = gradingForms[submission.id];

                            return (
                              <Card key={submission.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                <button
                                  onClick={() => toggleSubmissionExpanded(submission.id)}
                                  className="w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between"
                                >
                                  <div className="flex-1 text-left flex items-center gap-3">
                                    <div>
                                      <p className="font-medium text-gray-900 dark:text-white">{submission.student_name}</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        Submitted: {new Date(submission.submitted_at).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 ml-4">
                                    <div className={`flex items-center gap-1 ${getSubmissionStatusColor(submission.status)}`}>
                                      {getSubmissionStatusIcon(submission.status)}
                                      <span className="text-xs font-medium capitalize">{submission.status}</span>
                                    </div>
                                    {isExpanded ? (
                                      <ChevronUp className="w-4 h-4 text-gray-400" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-gray-400" />
                                    )}
                                  </div>
                                </button>

                                {isExpanded && (
                                  <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900/40 space-y-3">
                                    {submission.submission_text && (
                                      <div>
                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Submission Text</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-200 mt-1 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                          {submission.submission_text}
                                        </p>
                                      </div>
                                    )}

                                    {submission.submission_link && (
                                      <div>
                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Link</p>
                                        <a
                                          href={submission.submission_link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-blue-600 hover:underline mt-1"
                                        >
                                          {submission.submission_link}
                                        </a>
                                      </div>
                                    )}

                                    {submission.attachment_name && (
                                      <div>
                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Attachment</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-200">{submission.attachment_name}</p>
                                      </div>
                                    )}

                                    {submission.status === 'submitted' ? (
                                      <div className="border-t pt-3 space-y-3">
                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-2">
                                            Status
                                          </label>
                                          <select
                                            value={form?.status || 'approved'}
                                            onChange={(e) =>
                                              setGradingForms({
                                                ...gradingForms,
                                                [submission.id]: {
                                                  ...form,
                                                  submissionId: submission.id,
                                                  status: e.target.value as 'approved' | 'rejected'
                                                }
                                              })
                                            }
                                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          >
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Needs Revision</option>
                                          </select>
                                        </div>

                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-2">
                                            Marks (out of 100)
                                          </label>
                                          <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={form?.marks || ''}
                                            onChange={(e) =>
                                              setGradingForms({
                                                ...gradingForms,
                                                [submission.id]: {
                                                  ...form,
                                                  submissionId: submission.id,
                                                  status: form?.status || 'approved',
                                                  marks: parseInt(e.target.value) || 0
                                                }
                                              })
                                            }
                                            placeholder="80"
                                            className="text-sm"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-xs font-medium text-gray-700 mb-2">
                                            Feedback
                                          </label>
                                          <textarea
                                            value={form?.feedback || ''}
                                            onChange={(e) =>
                                              setGradingForms({
                                                ...gradingForms,
                                                [submission.id]: {
                                                  ...form,
                                                  submissionId: submission.id,
                                                  status: form?.status || 'approved',
                                                  marks: form?.marks || 0,
                                                  feedback: e.target.value
                                                }
                                              })
                                            }
                                            placeholder="Provide constructive feedback..."
                                            className="w-full h-16 px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          />
                                        </div>

                                        <Button
                                          onClick={() => handleGradeSubmission(task.id, submission.id)}
                                          disabled={isGrading}
                                          size="sm"
                                          className="w-full"
                                        >
                                          <Save className="w-4 h-4 mr-2" />
                                          {isGrading ? 'Saving...' : 'Save Grade'}
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="border-t pt-3 bg-white dark:bg-gray-800 p-2 rounded">
                                        <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                                          {submission.status === 'approved' ? 'Approved' : 'Needs Revision'}
                                        </p>
                                        {submission.marks !== null ? (
                                          <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                                            {submission.marks}/100
                                          </p>
                                        ) : null}
                                        {submission.feedback && (
                                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{submission.feedback}</p>
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
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default TeacherTasksPage;
