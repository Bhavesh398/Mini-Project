import { getAccessToken } from './auth';

const API_BASE_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:4000';

export interface TeacherClass {
  id: string;
  name: string;
  subject: string;
  grade_level: string;
  section: string | null;
  color: string;
  teacher_id: string;
  created_at: string;
  updated_at: string;
}

export interface ClassStudent {
  id: string;
  email: string;
  full_name: string;
  status: string;
  enrolled_at: string;
}

export interface StudentDirectoryItem {
  id: string;
  name: string;
  email: string;
}

interface CreateClassPayload {
  name: string;
  subject: string;
  gradeLevel: string;
  section?: string;
  color?: string;
}

interface AddStudentPayload {
  studentId?: string;
  studentEmail?: string;
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

export function getTeacherClasses() {
  return request<TeacherClass[]>('/api/classes');
}

export function createTeacherClass(payload: CreateClassPayload) {
  return request<TeacherClass>('/api/classes', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function getClassStudents(classId: string) {
  return request<ClassStudent[]>(`/api/classes/${classId}/students`);
}

export function addStudentToClass(classId: string, payload: AddStudentPayload) {
  return request(`/api/classes/${classId}/students`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function getStudentDirectory() {
  return request<StudentDirectoryItem[]>('/api/users/students');
}
