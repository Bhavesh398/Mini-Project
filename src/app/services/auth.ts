export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

const API_BASE_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:4000';

interface LoginApiResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
  };
  accessToken: string;
  refreshToken: string;
}

// Authenticate against backend API
export async function authenticate(email: string, password: string): Promise<AuthResponse> {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: normalizedEmail, password })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || 'Invalid email or password'
      };
    }

    const data = (await response.json()) as LoginApiResponse;

    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);

    return {
      success: true,
      user: {
        email: data.user.email,
        role: data.user.role,
        name: data.user.fullName
      }
    };
  } catch {
    return {
      success: false,
      error: 'Unable to reach backend. Check if server is running.'
    };
  }
}

// Get dashboard route based on role
export function getDashboardRoute(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'teacher':
      return '/teacher/dashboard';
    case 'student':
      return '/student/dashboard';
    default:
      return '/';
  }
}

// Store user session
export function setUserSession(user: User): void {
  localStorage.setItem('user', JSON.stringify(user));
}

// Get user session
export function getUserSession(): User | null {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Clear user session
export function clearUserSession(): void {
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

export function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}
