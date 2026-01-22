import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'https://fakestoreapi.com';
  private readonly storageKey = 'ecommerce_auth_user';
  private readonly rolesKey = 'ecommerce_user_roles';

  private readonly userSubject = new BehaviorSubject<AuthUser | null>(
    this.loadUser()
  );
  readonly user$ = this.userSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  login(username: string, password: string): Observable<AuthUser> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, { username, password })
      .pipe(
        map((response) => {
          const role = this.getRoleForUsername(username);
          return { username, role, token: response.token };
        }),
        tap((user) => this.setUser(user))
      );
  }

  register(payload: RegisterPayload, role: UserRole): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/users`, payload).pipe(
      tap(() => {
        this.setRoleForUsername(payload.username, role);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.userSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.userSubject.value?.token;
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
    return raw ? (JSON.parse(raw) as AuthUser) : null;
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
}
