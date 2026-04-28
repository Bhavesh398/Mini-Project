export interface Task {
  id: string;
  class_id: string;
  class_name: string;
  subject: string;
  teacher_id: string;
  teacher_name: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface TaskSubmission {
  id: string;
  task_id: string;
  student_id: string;
  student_name: string;
  submission_text: string | null;
  submission_link: string | null;
  attachment_name: string | null;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  marks: number | null;
  feedback: string | null;
  reviewed_by: string | null;
  submitted_at: string;
  updated_at: string;
}

export interface CreateTaskPayload {
  classId: string;
  title: string;
  description?: string;
  dueDate?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  dueDate?: string | null;
}

export interface SubmitTaskPayload {
  submissionText?: string;
  submissionLink?: string;
  attachmentName?: string;
}

export interface GradeTaskPayload {
  status: 'approved' | 'rejected';
  marks?: number;
  feedback?: string;
}

export interface StudentTasksResponse {
  tasks: Task[];
  submissions: TaskSubmission[];
}

export interface TeacherTasksResponse {
  tasks: Task[];
  submissions: TaskSubmission[];
}

const API_BASE_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:4000';

function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : ''
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function getStudentTasks(): Promise<StudentTasksResponse> {
  return request<StudentTasksResponse>('/api/tasks/student');
}

export async function getTeacherTasks(): Promise<TeacherTasksResponse> {
  return request<TeacherTasksResponse>('/api/tasks/teacher');
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  return request<Task>('/api/tasks/teacher', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function deleteTask(taskId: string): Promise<void> {
  await request<unknown>(`/api/tasks/teacher/${taskId}`, {
    method: 'DELETE'
  });
}

export async function updateTask(taskId: string, payload: UpdateTaskPayload): Promise<Task> {
  return request<Task>(`/api/tasks/teacher/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function submitTask(taskId: string, payload: SubmitTaskPayload): Promise<TaskSubmission> {
  return request<TaskSubmission>(`/api/tasks/${taskId}/submit`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function gradeTaskSubmission(
  taskId: string,
  submissionId: string,
  payload: GradeTaskPayload
): Promise<TaskSubmission> {
  return request<TaskSubmission>(`/api/tasks/${taskId}/submissions/${submissionId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}
