import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { Review } from '../../models/review.model';
import { ReviewService } from '../../services/review.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { catchError, finalize, of } from 'rxjs';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

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
    MatSelectModule,
    MatDialogModule,
    ReactiveFormsModule,
  ],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  product: Product | undefined;
  category: Category | undefined;
  reviews: Review[] = [];
  isLoading = true;
  hasError = false;
  errorMessage = '';
  showReviewForm = false;
  reviewForm!: FormGroup;
  isSubmittingReview = false;
  currentUserId: string | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private categoryService: CategoryService,
    private reviewService: ReviewService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.handleError('Hiányzó termék azonosító');
      return;
    }
    
    console.log('Termék lekérdezése ID alapján:', id);
    
    this.productService.getProduct(id).pipe(
      catchError(err => {
        console.error('Hiba történt a termék betöltése közben', err);
        this.handleError('Nem sikerült betölteni a terméket. Próbálja újra később.');
        return of(undefined);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(product => {
      if (product) {
        this.product = product;
        console.log('Betöltött termék:', product);
        
        if (product.categoryId) {
          this.loadCategory(product.categoryId);
        }
        
        this.loadReviews(product.id.toString());
      } else if (!this.hasError) {
        this.handleError('A keresett termék nem található');
      }
    });
    
    this.initReviewForm();
    
    this.currentUserId = this.authService.getCurrentUser()?.id || null;
  }
  
  private handleError(message: string): void {
    this.hasError = true;
    this.errorMessage = message;
    this.isLoading = false;
  }
  
  private loadCategory(categoryId: number): void {
    this.categoryService.getCategory(categoryId).subscribe({
      next: (category) => {
        this.category = category;
      },
      error: (err) => {
        console.error('Hiba történt a kategória betöltése közben', err);
      }
    });
  }
  
  private loadReviews(productId: string): void {
    this.reviewService.getReviewsByProduct(productId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
      },
      error: (err) => {
        console.error('Hiba történt az értékelések betöltése közben', err);
      }
    });
  }
  
  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0).map((_, i) => i);
  }
  
  getEmptyStarArray(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0).map((_, i) => i);
  }
  
  editProduct(): void {
    if (this.product) {
      this.router.navigate(['/products/edit', this.product.id]);
    }
  }
  
  confirmDelete(): void {
    if (!this.product) return;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Termék törlése',
        message: `Biztosan törölni szeretné a(z) "${this.product.name}" terméket?`,
        confirmText: 'Törlés',
        cancelText: 'Mégsem'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.product) {
        this.deleteProduct(this.product.id);
      }
    });
  }
  
  deleteProduct(id: string): void {
    this.isLoading = true;
    
    this.productService.deleteProduct(id).pipe(
      catchError(err => {
        console.error('Hiba történt a termék törlése közben', err);
        this.handleError('A termék törlése sikertelen. Próbálja újra később.');
        return of(null);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(() => {
      this.router.navigate(['/home']);
    });
  }
  
  initReviewForm(): void {
    this.reviewForm = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(3)]]
    });
  }
  
  toggleReviewForm(): void {
    if (!this.currentUserId) {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: `/products/${this.product?.id}` } 
      });
      return;
    }
    
    this.showReviewForm = !this.showReviewForm;
    if (this.showReviewForm) {
      this.initReviewForm();
    }
  }
  
  submitReview(): void {
    if (this.reviewForm.invalid || !this.product || !this.currentUserId) {
      return;
    }
    
    this.isSubmittingReview = true;
    
    const currentUser = this.authService.getCurrentUser();
    
    const newReview: Review = {
      id: '',
      productId: this.product.id,
      userId: this.currentUserId,
      userName: currentUser?.name || 'Névtelen felhasználó',
      rating: this.reviewForm.value.rating,
      comment: this.reviewForm.value.comment,
      date: new Date()
    };
    
    console.log('Submitting review:', newReview);
    
    this.reviewService.addReview(newReview).pipe(
      catchError(err => {
        console.error('Hiba történt az értékelés elküldése közben', err);
        return of(null);
      }),
      finalize(() => {
        this.isSubmittingReview = false;
      })
    ).subscribe(review => {
      if (review) {
        console.log('Review added successfully:', review);
        this.reviews = [review, ...this.reviews];
        this.showReviewForm = false;
        this.initReviewForm();
      } else {
        console.error('Failed to add review - returned null');
      }
    });
  }
  
  cancelReview(): void {
    this.showReviewForm = false;
  }
}
