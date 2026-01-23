import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { map, Observable, switchMap } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';
import { StoreService } from '../../services/store.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [RouterLink, AsyncPipe, NgIf, NgFor],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
})
export class ProductComponent {
  protected readonly product$: Observable<Product>;
  protected readonly reviews: Review[] = [
    {
      name: 'Chloe D.',
      rating: 5,
      body: 'Fits perfectly and the material feels premium. Love it!',
      date: '1 week ago',
    },
    {
      name: 'Marcus L.',
      rating: 4,
      body: 'Great quality for the price. Color is spot on.',
      date: '2 weeks ago',
    },
    {
      name: 'Elena V.',
      rating: 5,
      body: 'Super comfortable and fast delivery. Highly recommend.',
      date: '3 weeks ago',
    },
    {
      name: 'Amelia R.',
      rating: 5,
      body: 'Every item feels premium and the delivery was fast. Will shop again.',
      date: '1 week ago',
    },
    {
      name: 'Jordan K.',
      rating: 4,
      body: 'Great materials and the colors match the photos perfectly.',
      date: '2 weeks ago',
    },
    {
      name: 'Priya S.',
      rating: 5,
      body: 'Customer support helped me choose the right size. Super easy.',
      date: '3 weeks ago',
    },
    {
      name: 'Leo M.',
      rating: 4,
      body: 'Nice fit and fabric. The packaging was a nice touch too.',
      date: '4 weeks ago',
    },
    {
      name: 'Nina P.',
      rating: 5,
      body: 'Arrived in two days and looks even better in person.',
      date: '1 month ago',
    },
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly productService: ProductService,
    private readonly storeService: StoreService
  ) {
    this.product$ = this.route.paramMap.pipe(
      map((params) => Number(params.get('id') ?? 1)),
      switchMap((id) => this.productService.getProductById(id))
    );
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
}

interface Review {
  name: string;
  rating: number;
  body: string;
  date: string;
}
