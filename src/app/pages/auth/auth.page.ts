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
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ mode() === 'login' ? 'Sign In' : 'Create Account' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div style="padding:24px;max-width:400px;margin:0 auto">
        <ion-segment [(ngModel)]="activeMode" (ngModelChange)="mode.set($event)" style="margin-bottom:24px">
          <ion-segment-button value="login">
            <ion-label>Sign In</ion-label>
          </ion-segment-button>
          <ion-segment-button value="register">
            <ion-label>Register</ion-label>
          </ion-segment-button>
        </ion-segment>

        @if (mode() === 'register') {
          <ion-item>
            <ion-input label="First Name" [(ngModel)]="firstName" labelPlacement="floating" autocomplete="given-name"></ion-input>
          </ion-item>
          <ion-item>
            <ion-input label="Last Name" [(ngModel)]="lastName" labelPlacement="floating" autocomplete="family-name"></ion-input>
          </ion-item>
        }

        <ion-item>
          <ion-input
            label="Email"
            type="email"
            [(ngModel)]="email"
            labelPlacement="floating"
            autocomplete="email"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-input
            label="Password"
            type="password"
            [(ngModel)]="password"
            labelPlacement="floating"
            autocomplete="current-password"
          ></ion-input>
        </ion-item>

        @if (error()) {
          <p style="color:var(--ion-color-danger);font-size:13px;margin:8px 4px">{{ error() }}</p>
        }

        <ion-button
          expand="block"
          style="margin-top:16px"
          [disabled]="loading()"
          (click)="submit()"
        >
          @if (loading()) {
            <ion-spinner name="crescent" slot="start"></ion-spinner>
          }
          {{ mode() === 'login' ? 'Sign In' : 'Create Account' }}
        </ion-button>
      </div>
    </ion-content>
  `,
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
