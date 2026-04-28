export interface TeacherClass {
  id: string;
  name: string;
  subject: string;
}

const API_BASE_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:4000';

export async function getUserClasses(): Promise<TeacherClass[]> {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_BASE_URL}/api/classes`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch classes: ${response.statusText}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}
