import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonBackButton,
  IonButtons,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonBadge,
} from '@ionic/angular/standalone';
import { ShopifyService, Order } from '../../core/services/shopify.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonBackButton,
    IonButtons,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
    IonBadge,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/profile"></ion-back-button>
        </ion-buttons>
        <ion-title>My Orders</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      @if (loading()) {
        <div style="display:flex;justify-content:center;padding:2rem">
          <ion-spinner name="crescent"></ion-spinner>
        </div>
      } @else if (orders().length === 0) {
        <div style="display:flex;flex-direction:column;align-items:center;padding:3rem 1rem;text-align:center">
          <p style="font-size:16px">No orders yet.</p>
          <a routerLink="/tabs/collections" style="color:var(--ion-color-primary);font-weight:600">Start Shopping</a>
        </div>
      } @else {
        <ion-list>
          @for (order of orders(); track order.id) {
            <ion-item [routerLink]="['/orders', order.id]" detail button>
              <ion-label>
                <h3>Order #{{ order.orderNumber }}</h3>
                <p>{{ order.processedAt | date:'mediumDate' }}</p>
                <p>
                  {{ order.currentTotalPrice.currencyCode }}
                  {{ +order.currentTotalPrice.amount | number:'1.2-2' }}
                </p>
              </ion-label>
              <div slot="end">
                @if (order.fulfillmentStatus) {
                  <ion-badge [color]="fulfillmentColor(order.fulfillmentStatus)">
                    {{ order.fulfillmentStatus | titlecase }}
                  </ion-badge>
                }
              </div>
            </ion-item>
          }
        </ion-list>
      }
    </ion-content>
  `,
})
export class OrdersPage implements OnInit {
  private readonly shopify = inject(ShopifyService);
  readonly orders = signal<Order[]>([]);
  readonly loading = signal(true);

  ngOnInit() {
    this.shopify.getOrders().subscribe({
      next: (data) => {
        this.orders.set(data.edges.map((e) => e.node));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  fulfillmentColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'fulfilled':
        return 'success';
      case 'in_progress':
      case 'partial':
        return 'warning';
      case 'unfulfilled':
        return 'medium';
      default:
        return 'medium';
    }
  }
}
