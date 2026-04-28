export type UserRole = 'admin' | 'teacher' | 'student';

export interface JwtClaims {
  sub: string;
  role: UserRole;
  email: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}
