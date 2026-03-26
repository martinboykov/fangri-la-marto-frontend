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
  ],
  templateUrl: './product-detail.page.html',
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
