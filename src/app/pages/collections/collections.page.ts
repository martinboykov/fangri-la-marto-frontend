import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonImg,
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  InfiniteScrollCustomEvent,
} from '@ionic/angular/standalone';
import { ShopifyService, Product, Collection } from '../../core/services/shopify.service';

const COLLECTION_HANDLE = 'all';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonImg,
    IonSpinner,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Shop</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      @if (loading()) {
        <div style="display:flex;justify-content:center;padding:2rem">
          <ion-spinner name="crescent"></ion-spinner>
        </div>
      } @else {
        <ion-grid>
          <ion-row>
            @for (product of products(); track product.id) {
              <ion-col size="6" size-md="4" size-lg="3">
                <ion-card
                  [routerLink]="['/product', product.handle]"
                  style="cursor:pointer;margin:4px"
                >
                  @if (product.featuredImage) {
                    <ion-img
                      [src]="product.featuredImage.url"
                      [alt]="product.featuredImage.altText || product.title"
                      style="aspect-ratio:1;object-fit:cover"
                    ></ion-img>
                  }
                  <ion-card-content style="padding:8px">
                    <p style="font-size:13px;font-weight:600;margin:0 0 4px">{{ product.title }}</p>
                    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:4px">
                      @for (badge of shopify.getBadges(product); track badge.label) {
                        <span [class]="'badge badge--' + badge.type">{{ badge.label }}</span>
                      }
                    </div>
                    <p style="font-size:12px;color:var(--ion-color-medium);margin:0">
                      {{ product.priceRange.minVariantPrice.currencyCode }}
                      {{ product.priceRange.minVariantPrice.amount | number:'1.2-2' }}
                    </p>
                  </ion-card-content>
                </ion-card>
              </ion-col>
            }
          </ion-row>
        </ion-grid>

        @if (hasNextPage()) {
          <ion-infinite-scroll (ionInfinite)="loadMore($event)">
            <ion-infinite-scroll-content loadingSpinner="crescent"></ion-infinite-scroll-content>
          </ion-infinite-scroll>
        }
      }
    </ion-content>
  `,
})
export class CollectionsPage implements OnInit {
  readonly shopify = inject(ShopifyService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly hasNextPage = signal(false);
  private cursor: string | undefined;

  ngOnInit() {
    this.fetchProducts();
  }

  private fetchProducts() {
    this.shopify.getCollectionProducts(COLLECTION_HANDLE, 24, this.cursor).subscribe({
      next: (collection: Collection) => {
        this.products.update((prev) => [
          ...prev,
          ...collection.products.edges.map((e) => e.node),
        ]);
        this.hasNextPage.set(collection.products.pageInfo.hasNextPage);
        this.cursor = collection.products.pageInfo.endCursor;
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadMore(event: InfiniteScrollCustomEvent) {
    this.fetchProducts();
    setTimeout(() => event.target.complete(), 500);
  }
}
