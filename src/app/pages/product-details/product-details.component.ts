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
import { catchError, finalize, of } from 'rxjs';

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
  isLoading = true;
  hasError = false;
  errorMessage = '';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private categoryService: CategoryService,
    private reviewService: ReviewService
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
        
        // Kategória betöltése
        if (product.categoryId) {
          this.loadCategory(product.categoryId);
        }
        
        // Értékelések betöltése
        this.loadReviews(product.id.toString());
      } else if (!this.hasError) {
        this.handleError('A keresett termék nem található');
      }
    });
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
}
