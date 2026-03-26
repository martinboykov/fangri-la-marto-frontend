import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonThumbnail,
  IonImg,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline, addOutline, removeOutline } from 'ionicons/icons';
import { CartService } from '../../core/services/cart.service';
import { CartLine } from '../../core/services/shopify.service';

@Component({
  selector: 'app-cart',
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
    IonThumbnail,
    IonImg,
    IonButton,
    IonIcon,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Cart</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      @let cart = cartService.cart();
      @if (!cart || cart.lines.edges.length === 0) {
        <div style="display:flex;flex-direction:column;align-items:center;padding:3rem 1rem;text-align:center">
          <p style="font-size:16px">Your cart is empty</p>
          <ion-button routerLink="/tabs/collections">Start Shopping</ion-button>
        </div>
      } @else {
        <ion-list>
          @for (edge of cart.lines.edges; track edge.node.id) {
            <ion-item>
              <ion-thumbnail slot="start">
                @if (edge.node.merchandise.product.featuredImage) {
                  <ion-img [src]="edge.node.merchandise.product.featuredImage.url"></ion-img>
                }
              </ion-thumbnail>
              <ion-label>
                <h3>{{ edge.node.merchandise.product.title }}</h3>
                <p>{{ edge.node.merchandise.title }}</p>
                <p>
                  {{ edge.node.merchandise.price.currencyCode }}
                  {{ +edge.node.merchandise.price.amount | number:'1.2-2' }}
                </p>
              </ion-label>
              <div slot="end" style="display:flex;align-items:center;gap:8px">
                <ion-button fill="clear" size="small" (click)="changeQty(edge.node, -1)" [disabled]="updating()">
                  <ion-icon name="remove-outline" slot="icon-only"></ion-icon>
                </ion-button>
                <span>{{ edge.node.quantity }}</span>
                <ion-button fill="clear" size="small" (click)="changeQty(edge.node, 1)" [disabled]="updating()">
                  <ion-icon name="add-outline" slot="icon-only"></ion-icon>
                </ion-button>
                <ion-button fill="clear" size="small" color="danger" (click)="removeItem(edge.node.id)" [disabled]="updating()">
                  <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
                </ion-button>
              </div>
            </ion-item>
          }
        </ion-list>

        <div style="padding:16px">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-weight:600">
            <span>Subtotal</span>
            <span>{{ cart.cost.subtotalAmount.currencyCode }} {{ +cart.cost.subtotalAmount.amount | number:'1.2-2' }}</span>
          </div>
          <ion-button expand="block" routerLink="/checkout" [disabled]="updating()">
            Proceed to Checkout
          </ion-button>
        </div>
      }
    </ion-content>
  `,
})
export class CartPage implements OnInit {
  readonly cartService = inject(CartService);
  readonly updating = signal(false);

  constructor() {
    addIcons({ trashOutline, addOutline, removeOutline });
  }

  ngOnInit() {
    this.cartService.loadCart().subscribe();
  }

  changeQty(line: CartLine, delta: number) {
    const newQty = line.quantity + delta;
    if (newQty <= 0) {
      this.removeItem(line.id);
      return;
    }
    this.updating.set(true);
    this.cartService.updateItem(line.id, newQty).subscribe({
      next: () => this.updating.set(false),
      error: () => this.updating.set(false),
    });
  }

  removeItem(lineId: string) {
    this.updating.set(true);
    this.cartService.removeItem(lineId).subscribe({
      next: () => this.updating.set(false),
      error: () => this.updating.set(false),
    });
  }
}
