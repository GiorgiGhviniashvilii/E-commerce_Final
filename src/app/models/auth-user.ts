export type UserRole = 'user' | 'admin';

export interface AuthUser {
  username: string;
  role: UserRole;
  token: string;
}
