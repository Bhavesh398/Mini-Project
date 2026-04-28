import {
  type MiniProjectActivity,
  type MiniProjectMember,
  type MiniProjectRecord,
} from '../data/miniProjects';

const API_BASE_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:4000';

interface ActivityPayload {
  studentName: string;
  title: string;
  description: string;
  files: string[];
  branch: string;
  linesAdded?: number;
  linesRemoved?: number;
}

interface CreateMiniProjectPayload {
  id: string;
  name: string;
  subject: string;
  teamName: string;
  nextMilestone: string;
  summary: string;
  branch: string;
  repoName: string;
  goals: string[];
  availableFiles: string[];
  members: MiniProjectMember[];
  tasks: Array<{
    id: string;
    title: string;
    ownerId: string;
    status: 'todo' | 'in-progress' | 'done';
  }>;
}

export interface StudentDirectoryItem {
  id: string;
  name: string;
  email: string;
}

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

  return response.json() as Promise<T>;
}

export async function getAllMiniProjects(): Promise<MiniProjectRecord[]> {
  return request<MiniProjectRecord[]>('/api/mini-projects');
}

export async function getMiniProjectById(projectId: string): Promise<MiniProjectRecord | null> {
  try {
    return await request<MiniProjectRecord>(`/api/mini-projects/${projectId}`);
  } catch {
    return null;
  }
}

export async function createMiniProject(payload: CreateMiniProjectPayload): Promise<MiniProjectRecord> {
  return request<MiniProjectRecord>('/api/mini-projects', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function getStudentDirectory(): Promise<StudentDirectoryItem[]> {
  return request<StudentDirectoryItem[]>('/api/users/students');
}

async function addActivity(projectId: string, type: MiniProjectActivity['type'], payload: ActivityPayload): Promise<MiniProjectRecord | null> {
  try {
    return await request<MiniProjectRecord>(`/api/mini-projects/${projectId}/activity`, {
      method: 'POST',
      body: JSON.stringify({
        type,
        ...payload
      })
    });
  } catch {
    return null;
  }
}

export function recordMiniProjectCommit(projectId: string, payload: ActivityPayload): Promise<MiniProjectRecord | null> {
  return addActivity(projectId, 'commit', payload);
}

export function recordMiniProjectPush(projectId: string, payload: ActivityPayload): Promise<MiniProjectRecord | null> {
  return addActivity(projectId, 'push', payload);
}

export function recordMiniProjectPull(projectId: string, studentName: string, branch: string): Promise<MiniProjectRecord | null> {
  return addActivity(projectId, 'pull', {
    studentName,
    branch,
    title: 'Pull latest mini project updates',
    description: 'Synced the latest branch updates before starting the next change.',
    files: [],
    linesAdded: 0,
    linesRemoved: 0,
  });
}

export async function autoFormMiniProjectGroups(projectId: string, groupSize: number = 3): Promise<MiniProjectRecord> {
  return request<MiniProjectRecord>(`/api/mini-projects/${projectId}/groups/auto`, {
    method: 'POST',
    body: JSON.stringify({ groupSize })
  });
}

export function formatRelativeTime(timestamp: string): string {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));

  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

export function getMiniProjectStudentSummaries(project: MiniProjectRecord) {
  return project.members.map((member) => {
    const memberActivity = project.activity.filter((item) => item.studentId === member.id);
    const tasks = project.tasks.filter((item) => item.ownerId === member.id);

    return {
      ...member,
      commitCount: memberActivity.filter((item) => item.type === 'commit').length,
      pushCount: memberActivity.filter((item) => item.type === 'push').length,
      pullCount: memberActivity.filter((item) => item.type === 'pull').length,
      filesChanged: memberActivity.reduce((count, item) => count + item.files.length, 0),
      tasksCompleted: tasks.filter((item) => item.status === 'done').length,
      tasksPending: tasks.filter((item) => item.status !== 'done').length,
      lastActivity: memberActivity[0]?.timestamp ?? null,
      participationPercent:
        memberActivity.length === 0
          ? 0
          : Math.min(100, 45 + memberActivity.filter((item) => item.type !== 'pull').length * 14),
      activity: memberActivity,
    };
  });
}
