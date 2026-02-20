// Mock database of users with roles
const mockUsers = [
  { email: 'admin@institution.edu', password: 'admin123', role: 'admin', name: 'Admin User' },
  { email: 'teacher@institution.edu', password: 'teacher123', role: 'teacher', name: 'Amit Singh' },
  { email: 'student@institution.edu', password: 'student123', role: 'student', name: 'Isha Nair' },
];

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

// Simulate authentication with database lookup
export async function authenticate(email: string, password: string): Promise<AuthResponse> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const user = mockUsers.find(u => u.email === email && u.password === password);

  if (!user) {
    return {
      success: false,
      error: 'Invalid email or password',
    };
  }

  return {
    success: true,
    user: {
      email: user.email,
      role: user.role,
      name: user.name,
    },
  };
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
}
