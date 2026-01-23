import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface CartState {
  items: Record<number, number>;
}

@Injectable({ providedIn: 'root' })
export class StoreService {
  private readonly favoritesKey = 'ecommerce_favorites';
  private readonly cartKey = 'ecommerce_cart';

  private readonly favoritesSubject = new BehaviorSubject<number[]>(
    this.loadFavorites()
  );
  private readonly cartSubject = new BehaviorSubject<CartState>(
    this.loadCart()
  );
  private readonly searchSubject = new BehaviorSubject<string>('');

  readonly favorites$ = this.favoritesSubject.asObservable();
  readonly cart$ = this.cartSubject.asObservable();
  readonly search$ = this.searchSubject.asObservable();

  toggleFavorite(productId: number): void {
    const favorites = new Set(this.favoritesSubject.value);
    if (favorites.has(productId)) {
      favorites.delete(productId);
    } else {
      favorites.add(productId);
    }
    const list = Array.from(favorites);
    this.favoritesSubject.next(list);
    localStorage.setItem(this.favoritesKey, JSON.stringify(list));
  }

  isFavorite(productId: number): boolean {
    return this.favoritesSubject.value.includes(productId);
  }

  addToCart(productId: number): void {
    const cart = { ...this.cartSubject.value };
    cart.items = { ...cart.items };
    cart.items[productId] = (cart.items[productId] ?? 0) + 1;
    this.cartSubject.next(cart);
    localStorage.setItem(this.cartKey, JSON.stringify(cart));
  }

  toggleCartItem(productId: number): void {
    if (this.isInCart(productId)) {
      this.removeItemFromCart(productId);
      return;
    }
    this.addToCart(productId);
  }

  isInCart(productId: number): boolean {
    return Boolean(this.cartSubject.value.items[productId]);
  }

  removeFromCart(productId: number): void {
    const cart = { ...this.cartSubject.value };
    cart.items = { ...cart.items };
    if (cart.items[productId]) {
      cart.items[productId] -= 1;
      if (cart.items[productId] <= 0) {
        delete cart.items[productId];
      }
      this.cartSubject.next(cart);
      localStorage.setItem(this.cartKey, JSON.stringify(cart));
    }
  }

  removeItemFromCart(productId: number): void {
    const cart = { ...this.cartSubject.value };
    cart.items = { ...cart.items };
    if (cart.items[productId]) {
      delete cart.items[productId];
      this.cartSubject.next(cart);
      localStorage.setItem(this.cartKey, JSON.stringify(cart));
    }
  }

  getCartCount(): number {
    return Object.values(this.cartSubject.value.items).reduce(
      (sum, qty) => sum + qty,
      0
    );
  }

  getFavoritesCount(): number {
    return this.favoritesSubject.value.length;
  }

  setSearchTerm(term: string): void {
    this.searchSubject.next(term);
  }

  clearStore(): void {
    this.favoritesSubject.next([]);
    this.cartSubject.next({ items: {} });
    this.searchSubject.next('');
    localStorage.removeItem(this.favoritesKey);
    localStorage.removeItem(this.cartKey);
  }

  private loadFavorites(): number[] {
    const raw = localStorage.getItem(this.favoritesKey);
    return raw ? (JSON.parse(raw) as number[]) : [];
  }

  private loadCart(): CartState {
    const raw = localStorage.getItem(this.cartKey);
    return raw ? (JSON.parse(raw) as CartState) : { items: {} };
  }
}
