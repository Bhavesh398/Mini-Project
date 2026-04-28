import { getAccessToken } from './auth';

const API_BASE_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:4000';

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface SubmissionItem {
  id: string;
  class_id: string;
  class_name: string;
  subject: string;
  student_id: string;
  student_name: string;
  title: string;
  description: string | null;
  submission_link: string | null;
  attachment_name: string | null;
  attachment_url: string | null;
  status: SubmissionStatus;
  marks: number | null;
  feedback: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentClassOption {
  id: string;
  name: string;
  subject: string;
}

export interface StudentSubmissionResponse {
  classes: StudentClassOption[];
  submissions: SubmissionItem[];
  stats: {
    total: number;
    approved: number;
    rejected: number;
    pending: number;
    approvalRate: number;
    submissionRate: number;
  };
  bySubject: Array<{
    subject: string;
    submitted: number;
    approved: number;
    rejected: number;
    pending: number;
  }>;
  actionNeeded: number;
}

export interface TeacherSubmissionResponse {
  submissions: SubmissionItem[];
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

interface CreateSubmissionPayload {
  classId: string;
  title: string;
  description?: string;
  submissionLink?: string;
  attachmentName?: string;
  attachmentFile?: File | null;
}

interface UpdateSubmissionStatusPayload {
  status: 'approved' | 'rejected';
  feedback?: string;
  marks?: number;
}

function getDownloadFilename(contentDisposition: string | null, fallback: string): string {
  if (!contentDisposition) {
    return fallback;
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const asciiMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (asciiMatch?.[1]) {
    return asciiMatch[1];
  }

  return fallback;
}

function authHeaders() {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getStudentSubmissions() {
  return request<StudentSubmissionResponse>('/api/submissions/student');
}

export function createStudentSubmission(payload: CreateSubmissionPayload) {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append('classId', payload.classId);
  formData.append('title', payload.title);

  if (payload.description) {
    formData.append('description', payload.description);
  }

  if (payload.submissionLink) {
    formData.append('submissionLink', payload.submissionLink);
  }

  if (payload.attachmentName) {
    formData.append('attachmentName', payload.attachmentName);
  }

  if (payload.attachmentFile) {
    formData.append('attachment', payload.attachmentFile);
  }

  return fetch(`${API_BASE_URL}/api/submissions/student`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: formData
  }).then(async (response) => {
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.message || `Request failed: ${response.status}`);
    }

    return response.json() as Promise<SubmissionItem>;
  });
}

export function getTeacherSubmissions() {
  return request<TeacherSubmissionResponse>('/api/submissions/teacher');
}

export function updateSubmissionStatus(submissionId: string, payload: UpdateSubmissionStatusPayload) {
  return request<SubmissionItem>(`/api/submissions/${submissionId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function downloadSubjectWiseSubmissionsExport(): Promise<string> {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}/api/submissions/export`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || `Failed to export submissions: ${response.status}`);
  }

  const blob = await response.blob();
  const filename = getDownloadFilename(
    response.headers.get('content-disposition'),
    'amplify-submissions-by-subject.xlsx'
  );

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);

  return filename;
}

export async function downloadSubmissionStatusReport(): Promise<string> {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}/api/submissions/export/submission-status`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || `Failed to export submission status report: ${response.status}`);
  }

  const blob = await response.blob();
  const filename = getDownloadFilename(
    response.headers.get('content-disposition'),
    'submission-status-report.xlsx'
  );

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);

  return filename;
}
