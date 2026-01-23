import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { Product } from '../../models/product';
import { AuthUser } from '../../models/auth-user';
import { StoreService } from '../../services/store.service';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [RouterLink, AsyncPipe, NgFor, NgIf],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
})
export class ShopComponent {
  protected readonly products$: Observable<Product[]>;
  protected readonly categories$: Observable<string[]>;
  protected readonly user$: Observable<AuthUser | null>;
  protected readonly filteredProducts$: Observable<Product[]>;
  private readonly selectedCategoriesSubject = new BehaviorSubject<string[]>([]);
  private readonly priceFilterSubject = new BehaviorSubject<PriceFilter | null>(
    null
  );
  protected priceFilter: PriceFilter | null = null;

  constructor(
    private readonly productService: ProductService,
    private readonly authService: AuthService,
    private readonly storeService: StoreService
  ) {
    this.products$ = this.productService.getProducts();
    this.categories$ = this.productService.getCategories();
    this.user$ = this.authService.user$;
    this.filteredProducts$ = combineLatest([
      this.products$,
      this.selectedCategoriesSubject,
      this.storeService.search$,
      this.priceFilterSubject,
    ]).pipe(
      map(([products, categories, searchTerm, priceFilter]) => {
        const term = searchTerm.toLowerCase().trim();
        return products.filter((product) => {
          const matchesCategory =
            categories.length === 0 || categories.includes(product.category);
          const matchesSearch =
            term.length === 0 ||
            product.title.toLowerCase().includes(term) ||
            product.description.toLowerCase().includes(term);
          const matchesPrice = this.matchesPriceFilter(product.price, priceFilter);
          return matchesCategory && matchesSearch && matchesPrice;
        });
      })
    );
  }

  toggleCategory(category: string): void {
    const selected = new Set(this.selectedCategoriesSubject.value);
    if (selected.has(category)) {
      selected.delete(category);
    } else {
      selected.add(category);
    }
    this.selectedCategoriesSubject.next(Array.from(selected));
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategoriesSubject.value.includes(category);
  }

  setPriceFilter(filter: PriceFilter | null): void {
    this.priceFilter = filter;
    this.priceFilterSubject.next(filter);
  }

  resetFilters(): void {
    this.selectedCategoriesSubject.next([]);
    this.setPriceFilter(null);
  }

  toggleCart(productId: number): void {
    this.storeService.toggleCartItem(productId);
  }

  toggleFavorite(productId: number): void {
    this.storeService.toggleFavorite(productId);
  }

  isFavorite(productId: number): boolean {
    return this.storeService.isFavorite(productId);
  }

  isInCart(productId: number): boolean {
    return this.storeService.isInCart(productId);
  }

  getStars(rate: number): number[] {
    return [1, 2, 3, 4, 5];
  }

  private matchesPriceFilter(
    price: number,
    filter: PriceFilter | null
  ): boolean {
    if (!filter) {
      return true;
    }
    if (filter === 'under-50') {
      return price < 50;
    }
    if (filter === '50-150') {
      return price >= 50 && price <= 150;
    }
    return price > 150 && price <= 300;
  }
}

type PriceFilter = 'under-50' | '50-150' | '150-300';
