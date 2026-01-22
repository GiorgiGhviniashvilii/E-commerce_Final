import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';
import { map, Observable, switchMap } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [RouterLink, AsyncPipe, NgIf],
  template: `
    <section class="section" *ngIf="product$ | async as product; else loadingTpl">
      <div class="container product-layout">
        <div class="product-gallery">
          <div class="main-image">
            <img [src]="product.image" [alt]="product.title" />
          </div>
          <div class="thumbs">
            <div class="thumb"></div>
            <div class="thumb alt"></div>
            <div class="thumb"></div>
          </div>
        </div>
        <div class="product-details">
          <span class="pill">SKU {{ product.id }}</span>
          <h1>{{ product.title }}</h1>
          <p class="price">$ {{ product.price }}</p>
          <p class="description">{{ product.description }}</p>
          <div class="options">
            <div>
              <h4>Color</h4>
              <div class="swatches">
                <span class="swatch"></span>
                <span class="swatch alt"></span>
                <span class="swatch dark"></span>
              </div>
            </div>
            <div>
              <h4>Quantity</h4>
              <div class="qty">
                <button>-</button>
                <span>1</span>
                <button>+</button>
              </div>
            </div>
          </div>
          <div class="actions">
            <button class="btn primary">Add to cart</button>
            <button class="btn ghost">Add to wishlist</button>
          </div>
          <div class="shipping">
            <div>
              <strong>Free shipping</strong>
              <p>Orders over $150 qualify for next-day delivery.</p>
            </div>
            <div>
              <strong>Easy returns</strong>
              <p>30-day return policy on all items.</p>
            </div>
          </div>
          <a routerLink="/shop" class="pill link">Back to shop</a>
        </div>
      </div>
    </section>
    <ng-template #loadingTpl>
      <section class="section">
        <div class="container product-layout">
          <div class="product-gallery">
            <div class="main-image loading"></div>
          </div>
          <div class="product-details">
            <span class="pill">Loading...</span>
            <h1>Loading product</h1>
            <p class="price">--</p>
            <p class="description">Fetching product details.</p>
          </div>
        </div>
      </section>
    </ng-template>
  `,
  styles: [
    `
      .product-layout {
        display: grid;
        grid-template-columns: 1.1fr 0.9fr;
        gap: 40px;
      }

      .product-gallery {
        display: grid;
        gap: 20px;
      }

      .main-image {
        height: 420px;
        border-radius: 24px;
        background: linear-gradient(140deg, #ffe2d2, #ffd1bb);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }

      .main-image.loading {
        opacity: 0.5;
      }

      .thumbs {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
      }

      .thumb {
        height: 100px;
        border-radius: 14px;
        background: linear-gradient(140deg, #f4f4f4, #ffffff);
      }

      .thumb.alt {
        background: linear-gradient(140deg, #e8ecff, #cfd7ff);
      }

      .product-details h1 {
        margin: 12px 0;
        font-size: 36px;
      }

      .price {
        font-size: 22px;
        font-weight: 700;
      }

      .description {
        color: #6d6d6d;
        line-height: 1.6;
      }

      .options {
        display: grid;
        gap: 16px;
        margin: 24px 0;

        h4 {
          margin: 0 0 10px;
        }
      }

      .swatches {
        display: flex;
        gap: 10px;
      }

      .swatch {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: #ffceb6;
        border: 1px solid #f0f0f0;
      }

      .swatch.alt {
        background: #e3d6c8;
      }

      .swatch.dark {
        background: #3b3b3b;
      }

      .qty {
        display: inline-flex;
        gap: 12px;
        align-items: center;
        background: #f7f7f7;
        padding: 8px 16px;
        border-radius: 999px;

        button {
          border: none;
          background: transparent;
          font-size: 18px;
          cursor: pointer;
        }
      }

      .actions {
        display: flex;
        gap: 12px;
        margin-bottom: 24px;
      }

      .shipping {
        display: grid;
        gap: 12px;
        margin-bottom: 20px;

        p {
          margin: 4px 0 0;
          color: #777777;
        }
      }

      .link {
        text-decoration: none;
        color: #111111;
      }
    `,
  ],
})
export class ProductComponent {
  protected readonly product$: Observable<Product>;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly productService: ProductService
  ) {
    this.product$ = this.route.paramMap.pipe(
      map((params) => Number(params.get('id') ?? 1)),
      switchMap((id) => this.productService.getProductById(id))
    );
  }
}
