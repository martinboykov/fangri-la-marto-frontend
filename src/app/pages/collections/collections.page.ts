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
  templateUrl: './collections.page.html',
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
