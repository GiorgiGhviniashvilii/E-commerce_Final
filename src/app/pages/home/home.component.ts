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
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected readonly featuredProducts$: Observable<Product[]>;
  protected readonly reviews: Review[] = [
    {
      name: 'Amelia R.',
      title: 'Love the quality',
      rating: 5,
      body: 'Every item feels premium and the delivery was fast. Will shop again.',
    },
    {
      name: 'Jordan K.',
      title: 'Stylish and comfy',
      rating: 4,
      body: 'Great materials and the colors match the photos perfectly.',
    },
    {
      name: 'Priya S.',
      title: 'Highly recommend',
      rating: 5,
      body: 'Customer support helped me choose the right size. Super easy.',
    },
    {
      name: 'Leo M.',
      title: 'Worth the price',
      rating: 4,
      body: 'Nice fit and fabric. The packaging was a nice touch too.',
    },
    {
      name: 'Nina P.',
      title: 'Fast delivery',
      rating: 5,
      body: 'Arrived in two days and looks even better in person.',
    },
  ];
  protected reviewIndex = 0;

  constructor(private readonly productService: ProductService) {
    this.featuredProducts$ = this.productService
      .getProducts()
      .pipe(map((products) => products.slice(0, 4)));
  }

  getStars(rate: number): number[] {
    return [1, 2, 3, 4, 5];
  }

  getVisibleReviews(): Review[] {
    const visibleCount = 3;
    const items: Review[] = [];
    for (let i = 0; i < visibleCount; i += 1) {
      items.push(this.reviews[(this.reviewIndex + i) % this.reviews.length]);
    }
    return items;
  }

  nextReview(): void {
    this.reviewIndex = (this.reviewIndex + 1) % this.reviews.length;
  }

  prevReview(): void {
    this.reviewIndex =
      (this.reviewIndex - 1 + this.reviews.length) % this.reviews.length;
  }
}

interface Review {
  name: string;
  title: string;
  rating: number;
  body: string;
}
