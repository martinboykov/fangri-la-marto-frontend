import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
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
  IonLabel,
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
    IonLabel,
    IonInput,
    IonSpinner,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/cart"></ion-back-button>
        </ion-buttons>
        <ion-title>Checkout</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div style="padding:16px">
        <h2 style="font-size:18px;font-weight:700;margin-bottom:16px">Shipping Address</h2>

        <ion-item>
          <ion-input label="First Name" [(ngModel)]="firstName" labelPlacement="floating"></ion-input>
        </ion-item>
        <ion-item>
          <ion-input label="Last Name" [(ngModel)]="lastName" labelPlacement="floating"></ion-input>
        </ion-item>
        <ion-item>
          <ion-input label="Address" [(ngModel)]="address1" labelPlacement="floating"></ion-input>
        </ion-item>
        <ion-item>
          <ion-input label="City" [(ngModel)]="city" labelPlacement="floating"></ion-input>
        </ion-item>
        <ion-item>
          <ion-input label="Province / State" [(ngModel)]="province" labelPlacement="floating"></ion-input>
        </ion-item>
        <ion-item>
          <ion-input label="Country" [(ngModel)]="country" labelPlacement="floating"></ion-input>
        </ion-item>
        <ion-item>
          <ion-input label="Postal Code" [(ngModel)]="zip" labelPlacement="floating"></ion-input>
        </ion-item>

        @if (error()) {
          <p style="color:var(--ion-color-danger);font-size:13px;margin:8px 0">{{ error() }}</p>
        }

        <ion-button
          expand="block"
          style="margin-top:16px"
          [disabled]="loading()"
          (click)="proceedToPayment()"
        >
          @if (loading()) {
            <ion-spinner name="crescent" slot="start"></ion-spinner>
          }
          Proceed to Payment
        </ion-button>

        <div style="margin-top:24px;border-top:1px solid var(--ion-color-light);padding-top:16px">
          <p style="font-size:12px;color:var(--ion-color-medium);text-align:center">
            You will be redirected to Shopify's secure checkout to complete payment.
          </p>
        </div>
      </div>
    </ion-content>
  `,
})
export class CheckoutPage implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

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

    const token = this.authService.token();
    if (token) {
      // The backend extracts the Shopify customer token from the JWT;
      // pass it here to link the order to the customer account.
      buyerIdentity['customerAccessToken'] = token;
    }

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
