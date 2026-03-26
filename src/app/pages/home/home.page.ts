import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonBadge,
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
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonBadge,
  ],
  templateUrl: './home.page.html',
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
