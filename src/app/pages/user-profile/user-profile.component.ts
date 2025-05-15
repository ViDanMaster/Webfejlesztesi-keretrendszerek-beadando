import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Auth } from '@angular/fire/auth';

import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { ReviewService } from '../../services/review.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  topRatedProducts: {product: Product, rating: number}[] = [];
  
  constructor(
    private router: Router,
    private userService: UserService,
    private reviewService: ReviewService,
    private productService: ProductService,
    private auth: Auth
  ) {}
  
  ngOnInit(): void {
    // Check Firebase auth state first
    const currentAuthUser = this.auth.currentUser;
    
    if (!currentAuthUser) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Get user data
    this.userService.getUserById(currentAuthUser.uid).subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
        } else {
          this.router.navigate(['/login']);
        }
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
    
    // Get top rated products
    this.reviewService.getTopRatedProducts(5).subscribe(ratings => {
      ratings.forEach(rating => {
        this.productService.getProduct(rating.productId).subscribe(product => {
          if (product) {
            this.topRatedProducts.push({
              product: product,
              rating: rating.averageRating
            });
          }
        });
      });
    });
  }
  
  getStarArray(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }
  
  getEmptyStarArray(rating: number): number[] {
    return Array(5 - Math.round(rating)).fill(0);
  }
}
