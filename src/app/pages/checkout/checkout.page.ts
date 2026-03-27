import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonBackButton,
  IonButtons,
  IonButton,
  IonItem,
  IonInput,
  IonSpinner,
} from '@ionic/angular/standalone';
import { Browser } from '@capacitor/browser';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonBackButton,
    IonButtons,
    IonButton,
    IonItem,
    IonInput,
    IonSpinner,
  ],
  templateUrl: './checkout.page.html',
})
export class CheckoutPage implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);

  firstName = '';
  lastName = '';
  address1 = '';
  city = '';
  province = '';
  country = 'AU';
  zip = '';

  readonly loading = signal(false);
  readonly error = signal('');

  ngOnInit() {
    const customer = this.authService.customer();
    if (customer) {
      this.firstName = customer.firstName || '';
      this.lastName = customer.lastName || '';
    }
  }

  async proceedToPayment() {
    if (!this.address1 || !this.city || !this.country || !this.zip) {
      this.error.set('Please fill in all required address fields.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const buyerIdentity: Record<string, unknown> = {
      deliveryAddressPreferences: [
        {
          deliveryAddress: {
            firstName: this.firstName,
            lastName: this.lastName,
            address1: this.address1,
            city: this.city,
            province: this.province,
            country: this.country,
            zip: this.zip,
          },
        },
      ],
    };
    // customerAccessToken is injected server-side by the backend from the JWT,
    // so we never send the Shopify token from the frontend.

    this.cartService.updateBuyer(buyerIdentity).subscribe({
      next: () => {
        this.cartService.getCheckoutUrl().subscribe({
          next: async ({ checkoutUrl }) => {
            this.loading.set(false);
            try {
              await Browser.open({ url: checkoutUrl });
            } catch {
              window.open(checkoutUrl, '_blank');
            }
          },
          error: (err) => {
            this.loading.set(false);
            this.error.set(err?.error?.error || 'Failed to get checkout URL');
          },
        });
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.error || 'Failed to update shipping address');
      },
    });
  }
}
