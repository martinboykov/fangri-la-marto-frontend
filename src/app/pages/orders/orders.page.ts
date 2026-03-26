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
  templateUrl: './orders.page.html',
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
