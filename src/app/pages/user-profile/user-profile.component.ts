import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ReviewService } from '../../services/review.service';
import { ProductService } from '../../services/product.service';
import { User } from '../../models/user.model';
import { Product } from '../../models/product.model';
import { Review } from '../../models/review.model';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    ReactiveFormsModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit, OnDestroy {
  user: User | null = null;
  topRatedProducts: {product: Product, rating: number}[] = [];
  userReviews: (Review & {product?: Product})[] = []; // Add product data to reviews
  private authSubscription?: Subscription;
  isLoading = true;
  isLoadingReviews = false;
  editReviewForm?: FormGroup;
  editingReviewId?: string;
  
  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private reviewService: ReviewService,
    private productService: ProductService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {}
  
  ngOnInit(): void {
    this.isLoading = true;
    
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user = user;
        this.isLoading = false;
        
        this.loadUserReviews();
        
      } else {
        setTimeout(() => {
          if (!this.user) {
            this.router.navigate(['/login']);
          }
        }, 500);
      }
    });
  }
  
  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
  
  loadUserReviews(): void {
    if (!this.user?.id) return;
    
    this.isLoadingReviews = true;
    
    this.reviewService.getReviewsByUser(this.user.id).subscribe({
      next: (reviews) => {
        this.userReviews = [];
        
        if (reviews.length === 0) {
          this.isLoadingReviews = false;
          return;
        }
        
        let loadedCount = 0;
        reviews.forEach(review => {
          this.productService.getProduct(review.productId).subscribe({
            next: (product) => {
              if (product) {
                this.userReviews.push({...review, product});
              } else {
                this.userReviews.push(review);
              }
              
              loadedCount++;
              if (loadedCount === reviews.length) {
                this.isLoadingReviews = false;
              }
            },
            error: () => {
              this.userReviews.push(review);
              loadedCount++;
              if (loadedCount === reviews.length) {
                this.isLoadingReviews = false;
              }
            }
          });
        });
      },
      error: (err) => {
        console.error('Error loading user reviews', err);
        this.isLoadingReviews = false;
      }
    });
  }
  
  getStarArray(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }
  
  getEmptyStarArray(rating: number): number[] {
    return Array(5 - Math.round(rating)).fill(0);
  }
  
  startEditReview(review: Review): void {
    this.editReviewForm = this.fb.group({
      rating: [review.rating, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: [review.comment, [Validators.required, Validators.minLength(3)]]
    });
    this.editingReviewId = review.id;
  }
  
  cancelEditReview(): void {
    this.editingReviewId = undefined;
    this.editReviewForm = undefined;
  }
  
  saveReview(): void {
    if (!this.editReviewForm || !this.editingReviewId || this.editReviewForm.invalid) return;
    
    const review = this.userReviews.find(r => r.id === this.editingReviewId);
    if (!review) return;
    
    const updatedReview: Review = {
      ...review,
      rating: this.editReviewForm.value.rating,
      comment: this.editReviewForm.value.comment
    };
    
    this.reviewService.updateReview(updatedReview).subscribe({
      next: () => {
        const index = this.userReviews.findIndex(r => r.id === this.editingReviewId);
        if (index !== -1) {
          this.userReviews[index] = {...this.userReviews[index], ...updatedReview};
        }
        this.cancelEditReview();
      },
      error: (err) => {
        console.error('Error updating review', err);
      }
    });
  }
  
  confirmDeleteReview(review: Review): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Értékelés törlése',
        message: 'Biztosan törölni szeretné ezt az értékelést?',
        confirmText: 'Törlés',
        cancelText: 'Mégsem'
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteReview(review.id);
      }
    });
  }
  
  deleteReview(reviewId: string): void {
    this.reviewService.deleteReview(reviewId).subscribe({
      next: () => {
        this.userReviews = this.userReviews.filter(r => r.id !== reviewId);
      },
      error: (err) => {
        console.error('Error deleting review', err);
      }
    });
  }
}
