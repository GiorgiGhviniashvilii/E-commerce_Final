import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from './services/auth.service';
import { AuthUser } from './models/auth-user';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgIf,
    NgClass,
    ReactiveFormsModule,
    AsyncPipe,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('E-commerce');
  protected readonly isAuthOpen = signal(false);
  protected readonly authTab = signal<'login' | 'register'>('login');
  protected readonly authMessage = signal<string | null>(null);
  protected readonly isAuthLoading = signal(false);

  protected readonly user$;

  protected readonly loginForm;
  protected readonly registerForm;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService
  ) {
    this.user$ = this.authService.user$;
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });

    this.registerForm = this.formBuilder.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      role: ['user', [Validators.required]],
    });
  }

  openAuth(tab: 'login' | 'register'): void {
    this.authTab.set(tab);
    this.isAuthOpen.set(true);
    this.authMessage.set(null);
  }

  closeAuth(): void {
    this.isAuthOpen.set(false);
  }

  submitLogin(): void {
    if (this.loginForm.invalid) {
      this.authMessage.set('Please enter your username and password.');
      return;
    }

    const { username, password } = this.loginForm.getRawValue();
    this.isAuthLoading.set(true);
    this.authMessage.set(null);

    this.authService.login(username ?? '', password ?? '').subscribe({
      next: () => {
        this.isAuthLoading.set(false);
        this.closeAuth();
      },
      error: () => {
        this.isAuthLoading.set(false);
        this.authMessage.set(
          'Login failed. Try the demo credentials or register first.'
        );
      },
    });
  }

  submitRegister(): void {
    if (this.registerForm.invalid) {
      this.authMessage.set('Please complete all required fields.');
      return;
    }

    const payload = this.registerForm.getRawValue();
    this.isAuthLoading.set(true);
    this.authMessage.set(null);

    this.authService
      .register(
        {
          email: payload.email ?? '',
          username: payload.username ?? '',
          password: payload.password ?? '',
          name: {
            firstname: payload.firstname ?? '',
            lastname: payload.lastname ?? '',
          },
        },
        (payload.role ?? 'user') as AuthUser['role']
      )
      .subscribe({
        next: () => {
          this.isAuthLoading.set(false);
          this.authTab.set('login');
          this.authMessage.set(
            'Registration complete. Now sign in to receive your JWT.'
          );
        },
        error: () => {
          this.isAuthLoading.set(false);
          this.authMessage.set(
            'Registration failed. Please try again in a moment.'
          );
        },
      });
  }

  logout(): void {
    this.authService.logout();
  }
}
