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
  templateUrl: './cart.page.html',
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
