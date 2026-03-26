import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku?: string;
  availableForSale: boolean;
  quantityAvailable?: number;
  price: ShopifyMoney;
  compareAtPrice?: ShopifyMoney;
  selectedOptions?: { name: string; value: string }[];
}

export interface ProductBadge {
  type: 'yellow' | 'dark' | 'teal' | 'pink';
  label: string;
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description?: string;
  descriptionHtml?: string;
  totalInventory?: number;
  tags?: string[];
  vendor?: string;
  featuredImage?: { url: string; altText?: string; width?: number; height?: number };
  images?: { edges: { node: { url: string; altText?: string } }[] };
  priceRange: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice: ShopifyMoney;
  };
  variants: { edges: { node: ProductVariant }[] };
  options?: { id: string; name: string; values: string[] }[];
  metafields?: ({ namespace: string; key: string; value: string } | null)[];
}

export interface Collection {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image?: { url: string; altText?: string };
  products: {
    pageInfo: { hasNextPage: boolean; endCursor: string };
    edges: { node: Product }[];
  };
}

export interface CartLine {
  id: string;
  quantity: number;
  cost: { totalAmount: ShopifyMoney };
  merchandise: {
    id: string;
    title: string;
    price: ShopifyMoney;
    product: { id: string; title: string; handle: string; featuredImage?: { url: string; altText?: string } };
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: ShopifyMoney;
    totalAmount: ShopifyMoney;
    totalTaxAmount?: ShopifyMoney;
  };
  lines: { edges: { node: CartLine }[] };
}

export interface Order {
  id: string;
  orderNumber: number;
  processedAt: string;
  financialStatus?: string;
  fulfillmentStatus?: string;
  currentTotalPrice: ShopifyMoney;
  lineItems?: { edges: { node: { title: string; quantity: number } }[] };
}

@Injectable({ providedIn: 'root' })
export class ShopifyService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  // Products
  getProduct(handle: string) {
    return this.http.get<Product>(`${this.base}/api/products/${handle}`);
  }

  // Collections
  getCollectionProducts(handle: string, first = 24, after?: string) {
    let params = new HttpParams().set('first', first);
    if (after) params = params.set('after', after);
    return this.http.get<Collection>(`${this.base}/api/collections/${handle}/products`, { params });
  }

  // Cart
  createCart(input?: object) {
    return this.http.post<Cart>(`${this.base}/api/cart`, input || {});
  }

  getCart(cartId: string) {
    return this.http.get<Cart>(`${this.base}/api/cart/${cartId}`);
  }

  addCartLines(cartId: string, lines: { merchandiseId: string; quantity: number }[]) {
    return this.http.post<Cart>(`${this.base}/api/cart/${cartId}/lines`, { lines });
  }

  updateCartLines(cartId: string, lines: { id: string; quantity: number }[]) {
    return this.http.put<Cart>(`${this.base}/api/cart/${cartId}/lines`, { lines });
  }

  removeCartLine(cartId: string, lineId: string) {
    return this.http.delete<Cart>(`${this.base}/api/cart/${cartId}/lines/${lineId}`);
  }

  updateCartBuyer(cartId: string, buyerIdentity: object) {
    return this.http.put<Cart>(`${this.base}/api/cart/${cartId}/buyer`, { buyerIdentity });
  }

  getCheckoutUrl(cartId: string) {
    return this.http.get<{ checkoutUrl: string }>(
      `${this.base}/api/cart/${cartId}/checkout-url`
    );
  }

  // Customer orders
  getOrders() {
    return this.http.get<{ edges: { node: Order }[] }>(`${this.base}/api/customer/orders`);
  }

  getOrder(id: string) {
    return this.http.get<Order>(`${this.base}/api/customer/orders/${id}`);
  }

  // Badge helpers
  getBadges(product: Product): ProductBadge[] {
    const badges: ProductBadge[] = [];
    const tags = product.tags || [];

    if (tags.includes('exclusive-early-access')) {
      badges.push({ type: 'yellow', label: 'EXCLUSIVE EARLY ACCESS' });
    } else if (tags.includes('pre-order')) {
      badges.push({ type: 'yellow', label: 'PRE-ORDER' });
    }

    if (tags.includes('digital-collectible')) {
      badges.push({ type: 'dark', label: 'DIGITAL COLLECTIBLE' });
    }
    if (tags.includes('virtual-vinyl')) {
      badges.push({ type: 'dark', label: 'VIRTUAL VINYL\u2122' });
    }
    if (tags.includes('wearable')) {
      badges.push({ type: 'dark', label: 'WEARABLE' });
    }

    const availabilityMeta = product.metafields?.find(
      (m) => m && m.namespace === 'custom' && m.key === 'availability_tier'
    );
    if (availabilityMeta?.value === 'devotee') {
      badges.push({ type: 'pink', label: 'DEVOTEE' });
    }

    const inventory = product.totalInventory ?? 0;
    const maxInventory =
      product.variants.edges.reduce(
        (sum, e) => sum + (e.node.quantityAvailable ?? 0),
        0
      );
    if (inventory > 0) {
      badges.push({ type: 'teal', label: `${inventory} OF ${maxInventory || inventory} AVAILABLE` });
    }

    return badges;
  }
}
