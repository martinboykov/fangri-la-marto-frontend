import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';

export interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

const TOKEN_KEY = 'fangrila_auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly _customer = signal<Customer | null>(null);

  readonly token = this._token.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());
  readonly customer = this._customer.asReadonly();

  register(email: string, password: string, firstName?: string, lastName?: string) {
    return this.http
      .post<{ customer: Customer; token?: string; expiresAt?: string }>(
        `${environment.apiUrl}/api/auth/register`,
        { email, password, firstName, lastName }
      )
      .pipe(
        tap((res) => {
          if (res.token) {
            localStorage.setItem(TOKEN_KEY, res.token);
            this._token.set(res.token);
          }
        })
      );
  }

  login(email: string, password: string) {
    return this.http
      .post<{ token: string; expiresAt: string }>(`${environment.apiUrl}/api/auth/login`, {
        email,
        password,
      })
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.token);
          this._token.set(res.token);
        })
      );
  }

  logout() {
    return this.http.delete(`${environment.apiUrl}/api/auth/logout`).pipe(
      tap(() => {
        localStorage.removeItem(TOKEN_KEY);
        this._token.set(null);
        this._customer.set(null);
      })
    );
  }

  loadProfile() {
    return this.http
      .get<Customer>(`${environment.apiUrl}/api/auth/me`)
      .pipe(tap((customer) => this._customer.set(customer)));
  }
}
