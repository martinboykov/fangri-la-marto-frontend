import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonBadge,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonImg,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, searchOutline, cartOutline, personOutline } from 'ionicons/icons';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonBadge,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonButton,
    IonImg,
  ],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="collections" href="/tabs/collections">
          <ion-icon name="home-outline"></ion-icon>
          <ion-label>Shop</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="cart" href="/tabs/cart">
          <ion-icon name="cart-outline"></ion-icon>
          <ion-label>Cart</ion-label>
          @if (cartCount() > 0) {
            <ion-badge color="danger">{{ cartCount() }}</ion-badge>
          }
        </ion-tab-button>

        <ion-tab-button tab="profile" href="/tabs/profile">
          <ion-icon name="person-outline"></ion-icon>
          <ion-label>Account</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
})
export class HomePage implements OnInit {
  private readonly cartService = inject(CartService);
  readonly cartCount = this.cartService.itemCount;

  constructor() {
    addIcons({ homeOutline, searchOutline, cartOutline, personOutline });
  }

  ngOnInit() {
    this.cartService.loadCart().subscribe();
  }
}
