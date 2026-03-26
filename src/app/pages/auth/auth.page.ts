import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonItem,
  IonInput,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonItem,
    IonInput,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonSpinner,
  ],
  templateUrl: './auth.page.html',
})
export class AuthPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly mode = signal<'login' | 'register'>('login');
  readonly loading = signal(false);
  readonly error = signal('');

  activeMode: 'login' | 'register' = 'login';

  email = '';
  password = '';
  firstName = '';
  lastName = '';

  submit() {
    this.error.set('');
    this.loading.set(true);

    if (this.mode() === 'login') {
      this.authService.login(this.email, this.password).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/tabs/profile']);
        },
        error: (err) => {
          this.loading.set(false);
          const msg = err?.error?.errors?.[0]?.message || 'Login failed. Please try again.';
          this.error.set(msg);
        },
      });
    } else {
      this.authService.register(this.email, this.password, this.firstName, this.lastName).subscribe({
        next: () => {
          this.loading.set(false);
          // Auto-login after registration
          this.authService.login(this.email, this.password).subscribe({
            next: () => this.router.navigate(['/tabs/profile']),
            error: () => this.router.navigate(['/auth']),
          });
        },
        error: (err) => {
          this.loading.set(false);
          const msg =
            err?.error?.errors?.[0]?.message || 'Registration failed. Please try again.';
          this.error.set(msg);
        },
      });
    }
  }
}
