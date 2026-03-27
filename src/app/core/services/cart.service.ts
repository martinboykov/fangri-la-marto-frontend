import { Injectable, signal, computed, inject } from '@angular/core';
import { ShopifyService, Cart } from './shopify.service';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

const CART_ID_KEY = 'fangrila_cart_id';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly shopify = inject(ShopifyService);
  private readonly _cart = signal<Cart | null>(null);

  readonly cart = this._cart.asReadonly();
  readonly itemCount = computed(() => this._cart()?.totalQuantity ?? 0);
  readonly cartId = computed(() => this._cart()?.id ?? localStorage.getItem(CART_ID_KEY));

  loadCart(): Observable<Cart | null> {
    const storedId = localStorage.getItem(CART_ID_KEY);
    if (!storedId) return of(null);

    return this.shopify.getCart(storedId).pipe(
      tap((cart) => this._cart.set(cart)),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404) {
          // Stale/expired cart — clear it silently
          localStorage.removeItem(CART_ID_KEY);
        }
        return of(null);
      })
    );
  }

  ensureCart(): Observable<Cart> {
    const existing = this._cart();
    if (existing) return of(existing);

    const storedId = localStorage.getItem(CART_ID_KEY);
    if (storedId) {
      return this.shopify.getCart(storedId).pipe(
        tap((cart) => this._cart.set(cart)),
        catchError((err: HttpErrorResponse) => {
          if (err.status === 404) {
            // Cart has expired on Shopify — clear stale ID and create a fresh one
            localStorage.removeItem(CART_ID_KEY);
          }
          return this.shopify.createCart().pipe(
            tap((cart) => {
              localStorage.setItem(CART_ID_KEY, cart.id);
              this._cart.set(cart);
            })
          );
        })
      );
    }

    return this.shopify.createCart().pipe(
      tap((cart) => {
        localStorage.setItem(CART_ID_KEY, cart.id);
        this._cart.set(cart);
      })
    );
  }

  addItem(merchandiseId: string, quantity = 1): Observable<Cart> {
    return this.ensureCart().pipe(
      switchMap((cart) =>
        this.shopify.addCartLines(cart.id, [{ merchandiseId, quantity }]).pipe(
          tap((updated) => this._cart.set(updated))
        )
      )
    );
  }

  updateItem(lineId: string, quantity: number): Observable<Cart> {
    return this.ensureCart().pipe(
      switchMap((cart) =>
        this.shopify.updateCartLines(cart.id, [{ id: lineId, quantity }]).pipe(
          tap((updated) => this._cart.set(updated))
        )
      )
    );
  }

  removeItem(lineId: string): Observable<Cart> {
    return this.ensureCart().pipe(
      switchMap((cart) =>
        this.shopify.removeCartLine(cart.id, lineId).pipe(
          tap((updated) => this._cart.set(updated))
        )
      )
    );
  }

  updateBuyer(buyerIdentity: object): Observable<Cart> {
    return this.ensureCart().pipe(
      switchMap((cart) =>
        this.shopify.updateCartBuyer(cart.id, buyerIdentity).pipe(
          tap((updated) => this._cart.set(updated))
        )
      )
    );
  }

  getCheckoutUrl(): Observable<{ checkoutUrl: string }> {
    return this.ensureCart().pipe(
      switchMap((cart) => this.shopify.getCheckoutUrl(cart.id))
    );
  }

  clearCart(): void {
    localStorage.removeItem(CART_ID_KEY);
    this._cart.set(null);
  }
}
