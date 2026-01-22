import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
import { Product } from '../../models/product';
import { AuthUser } from '../../models/auth-user';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [RouterLink, AsyncPipe, NgFor, NgIf],
  template: `
    <section class="shop-hero">
      <div class="container">
        <span class="badge">Shop</span>
        <h1>Curated essentials for modern living</h1>
        <p>Browse our full collection of furniture, decor, and lifestyle pieces.</p>
      </div>
    </section>

    <section class="section">
      <div class="container shop-grid">
        <aside class="filters">
          <h3>Filters</h3>
          <div class="filter-group">
            <h4>Category</h4>
            <label><input type="checkbox" /> Living room</label>
            <label><input type="checkbox" /> Workspace</label>
            <label><input type="checkbox" /> Lighting</label>
            <label><input type="checkbox" /> Accessories</label>
          </div>
          <div class="filter-group">
            <h4>Price</h4>
            <label><input type="radio" name="price" /> Under $50</label>
            <label><input type="radio" name="price" /> $50 - $150</label>
            <label><input type="radio" name="price" /> $150 - $300</label>
          </div>
          <button class="btn dark">Apply filters</button>
        </aside>
        <div class="products">
          <div class="products-header">
            <h2>All products</h2>
            <div class="pill" *ngIf="products$ | async as products">
              {{ products.length }} items
            </div>
          </div>
          <div class="admin-panel" *ngIf="(user$ | async)?.role === 'admin'">
            <strong>Admin access</strong>
            <p>You can manage inventory and track orders.</p>
            <button class="btn dark">Open dashboard</button>
          </div>
          <div class="grid-3" *ngIf="products$ | async as products; else loadingTpl">
            <div class="card product-card" *ngFor="let product of products">
              <div class="product-thumb">
                <img [src]="product.image" [alt]="product.title" />
              </div>
              <h4>{{ product.title }}</h4>
              <p>$ {{ product.price }}</p>
              <a class="pill link" [routerLink]="['/product', product.id]">
                View details
              </a>
            </div>
          </div>
          <ng-template #loadingTpl>
            <div class="grid-3">
              <div class="card product-card loading" *ngFor="let _ of [1,2,3,4,5,6]">
                <div class="product-thumb"></div>
                <h4>Loading...</h4>
                <p>--</p>
                <span class="pill">Please wait</span>
              </div>
            </div>
          </ng-template>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .shop-hero {
        background: #ffffff;
        padding: 60px 0;
        border-bottom: 1px solid #ececec;
      }

      .shop-hero h1 {
        margin: 12px 0;
        font-size: 40px;
      }

      .shop-hero p {
        color: #6d6d6d;
      }

      .shop-grid {
        display: grid;
        grid-template-columns: 260px 1fr;
        gap: 32px;
      }

      .filters {
        background: #ffffff;
        border-radius: 20px;
        padding: 24px;
        height: fit-content;
        display: grid;
        gap: 20px;
      }

      .filter-group {
        display: grid;
        gap: 10px;
        font-size: 14px;

        label {
          display: flex;
          gap: 8px;
          align-items: center;
        }
      }

      .products-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .product-card {
        display: grid;
        gap: 10px;
      }

      .product-thumb {
        height: 160px;
        border-radius: 14px;
        background: linear-gradient(140deg, #ffe3d6, #ffc8b0);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 12px;

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }

      .product-thumb.alt {
        background: linear-gradient(140deg, #e8ecff, #cfd7ff);
      }

      .link {
        display: inline-block;
        text-decoration: none;
        color: #111111;
      }

      .admin-panel {
        margin-bottom: 24px;
        padding: 16px 20px;
        border-radius: 16px;
        background: #fff2ec;
        display: flex;
        justify-content: space-between;
        align-items: center;

        p {
          margin: 4px 0 0;
          color: #6d6d6d;
        }
      }

      .product-card.loading {
        opacity: 0.6;
      }
    `,
  ],
})
export class ShopComponent {
  protected readonly products$: Observable<Product[]>;
  protected readonly user$: Observable<AuthUser | null>;

  constructor(
    private readonly productService: ProductService,
    private readonly authService: AuthService
  ) {
    this.products$ = this.productService.getProducts();
    this.user$ = this.authService.user$;
  }
}
