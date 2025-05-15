import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { Product } from '../../models/product.model';
import { Review } from '../../models/review.model';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { ReviewService } from '../../services/review.service';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatDividerModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  product: Product | undefined;
  category: Category | undefined;
  reviews: Review[] = [];
  
  newReview = {
    rating: 5,
    comment: ''
  };
  
  isLoggedIn = false;
  currentUserId = 1; // This would come from authentication service
  
  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private categoryService: CategoryService,
    private reviewService: ReviewService
  ) {}
  
  ngOnInit(): void {
    // Check if user is logged in
    this.isLoggedIn = localStorage.getItem('currentUser') !== null;
    
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadProduct(id);
      this.loadReviews(id);
    }
  }
  
  loadProduct(id: number): void {
    this.productService.getProduct(id).subscribe(product => {
      this.product = product;
      if (product) {
        this.loadCategory(product.categoryId);
      }
    });
  }
  
  loadCategory(categoryId: number): void {
    this.categoryService.getCategory(categoryId).subscribe(category => {
      this.category = category;
    });
  }
  
  loadReviews(productId: number): void {
    this.reviewService.getReviewsByProduct(productId).subscribe(reviews => {
      this.reviews = reviews;
    });
  }
  
  addReview(): void {
    if (!this.product || !this.isLoggedIn) return;
    
    const review: Partial<Review> = {
      productId: this.product.id,
      userId: this.currentUserId,
      rating: this.newReview.rating,
      comment: this.newReview.comment,
      date: new Date()
    };
    
    this.reviewService.addReview(review as Review).subscribe(newReview => {
      this.reviews.unshift(newReview);
      this.newReview = { rating: 5, comment: '' };
    });
  }
  
  getStarArray(rating: number): number[] {
    return Array(rating).fill(0);
  }
  
  getEmptyStarArray(rating: number): number[] {
    return Array(5 - rating).fill(0);
  }
}
