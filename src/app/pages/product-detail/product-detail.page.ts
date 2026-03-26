import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonBackButton,
  IonButtons,
  IonButton,
  IonImg,
  IonSpinner,
  IonSelect,
  IonSelectOption,
  IonLabel,
  ToastController,
} from '@ionic/angular/standalone';
import { ShopifyService, Product, ProductVariant } from '../../core/services/shopify.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-product-detail',
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
    IonImg,
    IonSpinner,
    IonSelect,
    IonSelectOption,
    IonLabel,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/collections"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ product()?.title || 'Product' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      @if (loading()) {
        <div style="display:flex;justify-content:center;padding:2rem">
          <ion-spinner name="crescent"></ion-spinner>
        </div>
      } @else if (product(); as p) {
        <!-- Featured image -->
        @if (p.featuredImage) {
          <ion-img
            [src]="p.featuredImage.url"
            [alt]="p.featuredImage.altText || p.title"
            style="width:100%;max-height:400px;object-fit:cover"
          ></ion-img>
        }

        <div style="padding:16px">
          <!-- Badges -->
          <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">
            @for (badge of shopify.getBadges(p); track badge.label) {
              <span [class]="'badge badge--' + badge.type">{{ badge.label }}</span>
            }
          </div>

          <h1 style="font-size:20px;font-weight:700;margin:0 0 4px">{{ p.title }}</h1>

          <!-- Price — use @let to narrow the nullable signal once -->
          @let variant = selectedVariant();
          @if (variant) {
            <p style="font-size:16px;margin:0 0 16px">
              {{ variant.price.currencyCode }}
              {{ +variant.price.amount | number:'1.2-2' }}
            </p>
          }

          <!-- Variant selector -->
          @if (p.variants.edges.length > 1) {
            <ion-select
              label="Select option"
              [value]="selectedVariantId"
              (ionChange)="onVariantChange($event)"
              style="margin-bottom:16px"
            >
              @for (edge of p.variants.edges; track edge.node.id) {
                <ion-select-option
                  [value]="edge.node.id"
                  [disabled]="!edge.node.availableForSale"
                >
                  {{ edge.node.title }}{{ !edge.node.availableForSale ? ' (Sold out)' : '' }}
                </ion-select-option>
              }
            </ion-select>
          }

          <!-- Add to cart button -->
          <ion-button
            expand="block"
            [disabled]="!variant?.availableForSale || addingToCart()"
            (click)="addToCart()"
            style="margin-bottom:16px"
          >
            @if (addingToCart()) {
              <ion-spinner name="crescent" slot="start"></ion-spinner>
            }
            {{ !variant?.availableForSale ? 'Sold Out' : 'Add to Cart' }}
          </ion-button>

          <!-- Description -->
          @if (p.descriptionHtml) {
            <div
              [innerHTML]="p.descriptionHtml"
              style="font-size:14px;line-height:1.6;color:var(--ion-color-medium)"
            ></div>
          } @else if (p.description) {
            <p style="font-size:14px;line-height:1.6;color:var(--ion-color-medium)">
              {{ p.description }}
            </p>
          }
        </div>
      }
    </ion-content>
  `,
})
export class ProductDetailPage implements OnInit {
  readonly shopify = inject(ShopifyService);
  private readonly cartService = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly toastCtrl = inject(ToastController);

  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);
  readonly addingToCart = signal(false);

  selectedVariantId = '';

  readonly selectedVariant = computed<ProductVariant | null>(() => {
    const p = this.product();
    if (!p) return null;
    return (
      p.variants.edges.find((e) => e.node.id === this.selectedVariantId)?.node ??
      p.variants.edges[0]?.node ??
      null
    );
  });

  ngOnInit() {
    const handle = this.route.snapshot.paramMap.get('handle') || '';
    this.shopify.getProduct(handle).subscribe({
      next: (p) => {
        this.product.set(p);
        this.selectedVariantId = p.variants.edges[0]?.node.id ?? '';
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onVariantChange(event: Event) {
    const detail = (event as CustomEvent<{ value: string }>).detail;
    this.selectedVariantId = detail.value;
  }

  async addToCart() {
    const variant = this.selectedVariant();
    if (!variant) return;

    this.addingToCart.set(true);
    this.cartService.addItem(variant.id, 1).subscribe({
      next: async () => {
        this.addingToCart.set(false);
        const toast = await this.toastCtrl.create({
          message: 'Added to cart',
          duration: 1500,
          position: 'bottom',
          color: 'success',
        });
        await toast.present();
      },
      error: async () => {
        this.addingToCart.set(false);
        const toast = await this.toastCtrl.create({
          message: 'Failed to add to cart',
          duration: 2000,
          position: 'bottom',
          color: 'danger',
        });
        await toast.present();
      },
    });
  }
}
