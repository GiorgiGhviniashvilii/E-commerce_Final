import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { map, Observable } from 'rxjs';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, AsyncPipe, NgIf, NgFor],
  template: `
    <section class="hero">
      <div class="container hero-grid">
        <div class="hero-copy">
          <span class="badge">New collection</span>
          <h1>Modern essentials for your everyday moments.</h1>
          <p>
            Discover curated pieces designed to elevate your space. Minimal,
            refined, and crafted for a calm lifestyle.
          </p>
          <div class="hero-actions">
            <button class="btn primary">Shop now</button>
            <button class="btn ghost">Explore lookbook</button>
          </div>
          <div class="hero-stats">
            <div>
              <h3>12k+</h3>
              <span>Happy customers</span>
            </div>
            <div>
              <h3>350+</h3>
              <span>Exclusive products</span>
            </div>
            <div>
              <h3>24/7</h3>
              <span>Premium support</span>
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-card">
            <span class="pill">Trending</span>
            <h4>Soft Lounge Chair</h4>
            <p>$189.00</p>
            <button class="btn dark">Add to cart</button>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>Shop by category</h2>
          <span class="pill">Updated weekly</span>
        </div>
        <div class="grid-4">
          <div class="card category-card">
            <h4>Living room</h4>
            <p>12 products</p>
          </div>
          <div class="card category-card">
            <h4>Kitchen</h4>
            <p>18 products</p>
          </div>
          <div class="card category-card">
            <h4>Workspace</h4>
            <p>9 products</p>
          </div>
          <div class="card category-card">
            <h4>Outdoor</h4>
            <p>14 products</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2>Featured products</h2>
          <a routerLink="/shop" class="pill">View all</a>
        </div>
        <div class="grid-4" *ngIf="featuredProducts$ | async as products; else loadingTpl">
          <div class="card product-card" *ngFor="let product of products">
            <div class="product-image">
              <img [src]="product.image" [alt]="product.title" />
            </div>
            <div class="product-info">
              <h4>{{ product.title }}</h4>
              <span>$ {{ product.price }}</span>
            </div>
          </div>
        </div>
        <ng-template #loadingTpl>
          <div class="grid-4">
            <div class="card product-card loading" *ngFor="let _ of [1,2,3,4]">
              <div class="product-image"></div>
              <div class="product-info">
                <h4>Loading...</h4>
                <span>--</span>
              </div>
            </div>
          </div>
        </ng-template>
      </div>
    </section>

    <section class="section promo">
      <div class="container promo-grid">
        <div>
          <span class="badge">Member perks</span>
          <h2>Join our loyalty club for 15% off your first order.</h2>
          <p>
            Exclusive drops, early access, and curated guides. Earn points with
            every purchase.
          </p>
          <button class="btn dark">Become a member</button>
        </div>
        <div class="promo-card">
          <h3>Next day delivery</h3>
          <p>Free shipping for orders over $150.</p>
          <div class="promo-pill">Express</div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .hero {
        background: #fef6f1;
        padding: 72px 0;
      }

      .hero-grid {
        display: grid;
        grid-template-columns: 1.1fr 0.9fr;
        gap: 48px;
        align-items: center;
      }

      .hero-copy h1 {
        font-size: 48px;
        margin: 16px 0;
      }

      .hero-copy p {
        font-size: 16px;
        color: #666666;
        line-height: 1.6;
      }

      .hero-actions {
        display: flex;
        gap: 16px;
        margin: 24px 0 32px;
      }

      .hero-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;

        h3 {
          margin: 0;
          font-size: 22px;
        }

        span {
          color: #777777;
          font-size: 13px;
        }
      }

      .hero-visual {
        position: relative;
        height: 420px;
        border-radius: 24px;
        background: linear-gradient(140deg, #ffcfb9, #ffd9b5, #fff1e6);
        display: flex;
        align-items: flex-end;
        justify-content: center;
        padding: 24px;
      }

      .hero-card {
        width: 280px;
        background: #ffffff;
        border-radius: 20px;
        padding: 20px;
        display: grid;
        gap: 12px;
      }

      .category-card {
        height: 160px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        background: linear-gradient(135deg, #f2f2f2, #ffffff);
      }

      .product-card {
        display: grid;
        gap: 16px;
      }

      .product-image {
        height: 180px;
        border-radius: 14px;
        background: linear-gradient(135deg, #ffe5d6, #ffccb3);
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

      .product-image.alt {
        background: linear-gradient(135deg, #f5f0ff, #dcd2ff);
      }

      .product-info {
        display: flex;
        justify-content: space-between;
        font-weight: 600;
        gap: 12px;

        h4 {
          font-size: 14px;
          margin: 0;
          flex: 1;
        }
      }

      .product-card.loading {
        opacity: 0.6;
      }

      .promo {
        background: #ffffff;
      }

      .promo-grid {
        display: grid;
        grid-template-columns: 1.1fr 0.9fr;
        gap: 32px;
        align-items: center;
      }

      .promo-card {
        background: #111111;
        color: #ffffff;
        padding: 32px;
        border-radius: 24px;
      }

      .promo-pill {
        margin-top: 20px;
        display: inline-block;
        padding: 6px 14px;
        border-radius: 999px;
        background: #ff8a5b;
        font-size: 12px;
        font-weight: 600;
      }
    `,
  ],
})
export class HomeComponent {
  protected readonly featuredProducts$: Observable<Product[]>;

  constructor(private readonly productService: ProductService) {
    this.featuredProducts$ = this.productService
      .getProducts()
      .pipe(map((products) => products.slice(0, 4)));
  }
}
