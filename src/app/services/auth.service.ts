import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  defer,
  map,
  of,
  tap,
  throwError,
} from 'rxjs';
import { AuthUser, UserRole } from '../models/auth-user';

interface LoginResponse {
  token: string;
}

interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  name: {
    firstname: string;
    lastname: string;
  };
}

interface RegisteredUser extends RegisterPayload {
  role: UserRole;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'https://fakestoreapi.com';
  private readonly storageKey = 'ecommerce_auth_user';
  private readonly rolesKey = 'ecommerce_user_roles';
  private readonly registeredUsersKey = 'ecommerce_registered_users';

  private readonly userSubject = new BehaviorSubject<AuthUser | null>(
    this.loadUser()
  );
  readonly user$ = this.userSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  login(email: string, password: string): Observable<AuthUser> {
    return defer(() => {
      const normalizedEmail = email.trim().toLowerCase();
      if (!this.isEmailValid(normalizedEmail)) {
        return throwError(() => new Error('Enter a valid email.'));
      }

      const registeredUser = this.getRegisteredUserByEmail(normalizedEmail);
      if (!registeredUser) {
        return throwError(() => new Error('No account found for this email.'));
      }
      if (registeredUser.password !== password) {
        return throwError(() => new Error('Invalid credentials'));
      }

      const user: AuthUser = {
        username: registeredUser.username,
        role: registeredUser.role,
        token: this.createFakeJwt(registeredUser.username),
      };
      this.setUser(user);
      return of(user);
    });
  }

  register(payload: RegisterPayload, role: UserRole): Observable<unknown> {
    const normalizedPayload: RegisterPayload = {
      ...payload,
      email: payload.email.trim().toLowerCase(),
      username: payload.username.trim(),
    };

    const validationError = this.validateRegisterPayload(normalizedPayload);
    if (validationError) {
      return throwError(() => new Error(validationError));
    }

    const existingByEmail = this.getRegisteredUserByEmail(
      normalizedPayload.email
    );
    if (existingByEmail) {
      return throwError(() => new Error('Email is already registered'));
    }

    if (this.isUsernameTaken(normalizedPayload.username)) {
      return throwError(() => new Error('Username is already taken'));
    }

    const users = this.loadRegisteredUsers();
    users[normalizedPayload.email] = { ...normalizedPayload, role };
    localStorage.setItem(this.registeredUsersKey, JSON.stringify(users));
    this.setRoleForUsername(normalizedPayload.username, role);

    return of({ success: true });
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.userSubject.next(null);
  }

  isLoggedIn(): boolean {
    const token = this.userSubject.value?.token;
    return !!token && this.isTokenValid(token);
  }

  getCurrentRole(): UserRole | null {
    return this.userSubject.value?.role ?? null;
  }

  private setUser(user: AuthUser): void {
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    this.userSubject.next(user);
  }

  private loadUser(): AuthUser | null {
    const raw = localStorage.getItem(this.storageKey);
    const user = raw ? (JSON.parse(raw) as AuthUser) : null;
    if (!user?.token) {
      return null;
    }
    if (!this.isTokenValid(user.token)) {
      localStorage.removeItem(this.storageKey);
      return null;
    }
    return user;
  }

  private getRoleForUsername(username: string): UserRole {
    const roles = this.loadRoles();
    if (roles[username]) {
      return roles[username];
    }
    return username.toLowerCase().includes('admin') ? 'admin' : 'user';
  }

  private setRoleForUsername(username: string, role: UserRole): void {
    const roles = this.loadRoles();
    roles[username] = role;
    localStorage.setItem(this.rolesKey, JSON.stringify(roles));
  }

  private loadRoles(): Record<string, UserRole> {
    const raw = localStorage.getItem(this.rolesKey);
    return raw ? (JSON.parse(raw) as Record<string, UserRole>) : {};
  }

  private loadRegisteredUsers(): Record<string, RegisteredUser> {
    const raw = localStorage.getItem(this.registeredUsersKey);
    return raw ? (JSON.parse(raw) as Record<string, RegisteredUser>) : {};
  }

  private getRegisteredUser(username: string): RegisteredUser | null {
    const users = this.loadRegisteredUsers();
    return users[username] ?? null;
  }

  private getRegisteredUserByEmail(email: string): RegisteredUser | null {
    const users = this.loadRegisteredUsers();
    if (users[email]) {
      return users[email];
    }
    return (
      Object.values(users).find((user) => user.email === email) ?? null
    );
  }

  private isUsernameTaken(username: string): boolean {
    const users = this.loadRegisteredUsers();
    return Object.values(users).some((user) => user.username === username);
  }

  private createFakeJwt(username: string): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const now = Math.floor(Date.now() / 1000);
    const payload = btoa(
      JSON.stringify({
        sub: username,
        iat: now,
        exp: now + 60 * 60,
      })
    );
    const signature = btoa('local-demo');
    return `${header}.${payload}.${signature}`;
  }

  private isTokenValid(token: string): boolean {
    if (!token.includes('.')) {
      return true;
    }
    const payload = this.decodeToken(token);
    if (!payload?.exp) {
      return false;
    }
    return Math.floor(Date.now() / 1000) < payload.exp;
  }

  private decodeToken(token: string): { exp?: number } | null {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }
    try {
      return JSON.parse(atob(parts[1])) as { exp?: number };
    } catch {
      return null;
    }
  }

  private validateRegisterPayload(payload: RegisterPayload): string | null {
    if (!payload.email || !payload.username || !payload.password) {
      return 'Please complete all required fields.';
    }
    if (!this.isEmailValid(payload.email)) {
      return 'Enter a valid email.';
    }
    if (!this.isUsernameValid(payload.username)) {
      return 'Use only letters, numbers, and underscores.';
    }
    if (!this.isPasswordStrong(payload.password)) {
      return 'Password must be 8+ characters with at least 1 number.';
    }
    return null;
  }

  private isEmailValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isUsernameValid(username: string): boolean {
    return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
  }

  private isPasswordStrong(password: string): boolean {
    return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
  }
}
