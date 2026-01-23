import { Component } from '@angular/core';
import { AsyncPipe, CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { combineLatest, map, Observable } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { StoreService } from '../../services/store.service';
import { Product } from '../../models/product';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, CurrencyPipe, RouterLink],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  protected readonly cartItems$: Observable<CartLineItem[]>;
  protected readonly subtotal$: Observable<number>;
  protected readonly discount$: Observable<number>;
  protected readonly total$: Observable<number>;
  protected readonly deliveryFee = 15;

  constructor(
    private readonly productService: ProductService,
    private readonly storeService: StoreService
  ) {
    const products$ = this.productService.getProducts();
    this.cartItems$ = combineLatest([products$, this.storeService.cart$]).pipe(
      map(([products, cart]) =>
        Object.entries(cart.items)
          .map(([id, qty]) => {
            const product = products.find((item) => item.id === Number(id));
            if (!product) {
              return null;
            }
            return {
              product,
              quantity: qty,
              subtotal: product.price * qty,
            };
          })
          .filter((item): item is CartLineItem => item !== null)
      )
    );

    this.subtotal$ = this.cartItems$.pipe(
      map((items) => items.reduce((sum, item) => sum + item.subtotal, 0))
    );
    this.discount$ = this.subtotal$.pipe(
      map((subtotal) => (subtotal > 0 ? subtotal * 0.2 : 0))
    );
    this.total$ = combineLatest([this.subtotal$, this.discount$]).pipe(
      map(
        ([subtotal, discount]) =>
          Math.max(subtotal - discount + this.deliveryFee, 0)
      )
    );
  }

  increase(productId: number): void {
    this.storeService.addToCart(productId);
  }

  decrease(productId: number): void {
    this.storeService.removeFromCart(productId);
  }

  remove(productId: number): void {
    this.storeService.removeItemFromCart(productId);
  }
}

interface CartLineItem {
  product: Product;
  quantity: number;
  subtotal: number;
}
