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
  ],
  templateUrl: './profile.page.html',
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
