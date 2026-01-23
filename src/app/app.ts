import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { AuthService } from './services/auth.service';
import { AuthUser } from './models/auth-user';
import { StoreService } from './services/store.service';
import { Observable, map } from 'rxjs';

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

  protected readonly user$: Observable<AuthUser | null>;
  protected readonly favoritesCount$: Observable<number>;
  protected readonly cartCount$: Observable<number>;

  protected readonly loginForm;
  protected readonly registerForm;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly storeService: StoreService,
    private readonly router: Router
  ) {
    this.user$ = this.authService.user$;
    this.favoritesCount$ = this.storeService.favorites$.pipe(
      map((items) => items.length)
    );
    this.cartCount$ = this.storeService.cart$.pipe(
      map((cart) => Object.values(cart.items).reduce((sum, qty) => sum + qty, 0))
    );
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, emailOrUsernameValidator()]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });

    this.registerForm = this.formBuilder.group(
      {
        firstname: ['', [Validators.required]],
        lastname: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        username: [
          '',
          [Validators.required, Validators.minLength(3), usernameValidator()],
        ],
        password: [
          '',
          [Validators.required, Validators.minLength(8), passwordStrengthValidator()],
        ],
        confirmPassword: ['', [Validators.required]],
        role: ['user', [Validators.required]],
      },
      {
        validators: [matchPasswords('password', 'confirmPassword')],
      }
    );
  }

  openAuth(tab: 'login' | 'register'): void {
    this.authTab.set(tab);
    this.isAuthOpen.set(true);
    this.authMessage.set(null);
    this.resetAuthForms();
  }

  closeAuth(): void {
    this.isAuthOpen.set(false);
    this.resetAuthForms();
  }

  submitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.authMessage.set('Please fix the highlighted fields.');
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    this.isAuthLoading.set(true);
    this.authMessage.set(null);

    this.authService.login(email ?? '', password ?? '').subscribe({
      next: () => {
        this.isAuthLoading.set(false);
        this.closeAuth();
      },
      error: (error) => {
        this.isAuthLoading.set(false);
        this.authMessage.set(
          error?.message ??
            'Login failed. Try the demo credentials or register first.'
        );
      },
    });
  }

  submitRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.authMessage.set('Please fix the highlighted fields.');
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
          const email = payload.email ?? '';
          const password = payload.password ?? '';
          this.authService.login(email, password).subscribe({
            next: () => {
              this.isAuthLoading.set(false);
              this.closeAuth();
            },
            error: () => {
              this.isAuthLoading.set(false);
              this.authTab.set('login');
              this.authMessage.set(
                'Registration complete. Now sign in to receive your JWT.'
              );
            },
          });
        },
        error: (error) => {
          this.isAuthLoading.set(false);
          this.authMessage.set(
            error?.message ?? 'Registration failed. Please try again in a moment.'
          );
        },
      });
  }

  logout(): void {
    this.authService.logout();
    this.storeService.clearStore();
    this.router.navigate(['/']);
  }

  updateHeaderSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value ?? '';
    this.storeService.setSearchTerm(value);
    if (value.trim().length > 0) {
      this.router.navigate(['/shop']);
    }
  }

  private resetAuthForms(): void {
    this.loginForm.reset({
      email: '',
      password: '',
    });
    this.registerForm.reset({
      firstname: '',
      lastname: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      role: 'user',
    });
  }

  getLoginError(controlName: 'email' | 'password'): string | null {
    const control = this.loginForm.get(controlName);
    if (!control || !control.touched || !control.errors) {
      return null;
    }
    if (control.errors['required']) {
      return 'This field is required.';
    }
    if (control.errors['emailOrUsernameInvalid']) {
      return 'Enter a valid email or username.';
    }
    if (control.errors['minlength']) {
      return 'Enter at least 8 characters.';
    }
    return 'Invalid value.';
  }

  getRegisterError(
    controlName:
      | 'firstname'
      | 'lastname'
      | 'email'
      | 'username'
      | 'password'
      | 'confirmPassword'
  ): string | null {
    const control = this.registerForm.get(controlName);
    if (!control || !control.touched || !control.errors) {
      return null;
    }
    if (control.errors['required']) {
      return 'This field is required.';
    }
    if (control.errors['email']) {
      return 'Enter a valid email.';
    }
    if (control.errors['minlength']) {
      if (controlName === 'username') {
        return 'Enter at least 3 characters.';
      }
      return 'Enter at least 8 characters.';
    }
    if (control.errors['usernameInvalid']) {
      return 'Use only letters, numbers, and underscores.';
    }
    if (control.errors['weakPassword']) {
      return 'Use at least 1 letter and 1 number.';
    }
    return 'Invalid value.';
  }

  getPasswordMismatchError(): string | null {
    const confirm = this.registerForm.get('confirmPassword');
    if (!confirm || !confirm.touched) {
      return null;
    }
    if (this.registerForm.errors?.['passwordMismatch']) {
      return 'Passwords do not match.';
    }
    return null;
  }
}

function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '');
    if (value.length === 0) {
      return null;
    }
    const hasLetter = /[A-Za-z]/.test(value);
    const hasNumber = /\d/.test(value);
    return hasLetter && hasNumber ? null : { weakPassword: true };
  };
}

function usernameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '');
    if (value.length === 0) {
      return null;
    }
    return /^[a-zA-Z0-9_]+$/.test(value) ? null : { usernameInvalid: true };
  };
}

function emailOrUsernameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim();
    if (value.length === 0) {
      return null;
    }
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const isUsername = /^[a-zA-Z0-9_]+$/.test(value);
    return isEmail || isUsername ? null : { emailOrUsernameInvalid: true };
  };
}

function matchPasswords(
  passwordKey: string,
  confirmKey: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get(passwordKey)?.value;
    const confirm = control.get(confirmKey)?.value;
    if (!password || !confirm) {
      return null;
    }
    return password === confirm ? null : { passwordMismatch: true };
  };
}
