import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForwardOutline, receiptOutline, personOutline } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonSpinner,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Account</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      @if (!authService.isLoggedIn()) {
        <div style="display:flex;flex-direction:column;align-items:center;padding:3rem 1rem;text-align:center">
          <ion-icon name="person-outline" style="font-size:64px;color:var(--ion-color-medium);margin-bottom:16px"></ion-icon>
          <p style="font-size:16px;margin-bottom:16px">Sign in to view your orders and manage your account.</p>
          <ion-button routerLink="/auth">Sign In / Register</ion-button>
        </div>
      } @else {
        @if (authService.customer(); as customer) {
          <div style="padding:16px">
            <h2 style="font-size:20px;font-weight:700;margin-bottom:4px">
              {{ customer.firstName }} {{ customer.lastName }}
            </h2>
            <p style="color:var(--ion-color-medium);font-size:14px;margin-bottom:24px">{{ customer.email }}</p>
          </div>
        }

        <ion-list>
          <ion-item [routerLink]="['/orders']" detail button>
            <ion-icon name="receipt-outline" slot="start" color="primary"></ion-icon>
            <ion-label>My Orders</ion-label>
          </ion-item>
        </ion-list>

        <div style="padding:16px;margin-top:auto">
          <ion-button expand="block" fill="outline" color="danger" (click)="logout()">
            Sign Out
          </ion-button>
        </div>
      }
    </ion-content>
  `,
})
export class ProfilePage implements OnInit {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    addIcons({ chevronForwardOutline, receiptOutline, personOutline });
  }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.authService.loadProfile().subscribe();
    }
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/tabs/collections']),
      error: () => {
        // Clear locally even if the API call fails
        localStorage.removeItem('fangrila_auth_token');
        this.router.navigate(['/tabs/collections']);
      },
    });
  }
}
