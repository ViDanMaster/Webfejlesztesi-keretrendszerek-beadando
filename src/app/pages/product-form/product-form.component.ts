import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    RouterModule
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  categories: Category[] = [];
  isEditMode = false;
  productId?: number;
  pageTitle = 'Új termék hozzáadása';
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}
  
  ngOnInit(): void {
    this.createForm();
    this.loadCategories();
    
    // Check if we're in edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productId = Number(id);
      this.pageTitle = 'Termék szerkesztése';
      this.loadProduct(Number(id));
    }
  }
  
  createForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(1)]],
      categoryId: [null, Validators.required],
      imageUrl: ['', Validators.required]
    });
  }
  
  loadCategories(): void {
    this.categoryService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }
  
  loadProduct(id: number): void {
    this.productService.getProduct(id).subscribe(product => {
      if (product) {
        this.productForm.patchValue({
          name: product.name,
          description: product.description,
          price: product.price,
          categoryId: product.categoryId,
          imageUrl: product.imageUrl
        });
      }
    });
  }
  
  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }
    
    const formValue = this.productForm.value;
    
    if (this.isEditMode && this.productId) {
      // Update existing product
      const product: Product = {
        id: this.productId?.toString() || '', // Konvertálás string-gé
        name: formValue.name,
        description: formValue.description,
        price: formValue.price,
        categoryId: formValue.categoryId,
        imageUrl: formValue.imageUrl
      };
      
      this.productService.updateProduct(product).subscribe({
        next: () => {
          this.router.navigate(['/products', this.productId]);
        },
        error: (err) => {
          console.error('Error updating product', err);
        }
      });
    } else {
      // Create new product with temporary ID (will be replaced by Firestore)
      const product: Product = {
        id: '', // Üres string, ami majd felülíródik a Firestore által generált ID-val
        name: formValue.name,
        description: formValue.description,
        price: formValue.price,
        categoryId: formValue.categoryId,
        imageUrl: formValue.imageUrl
      };
      
      this.productService.addProduct(product).subscribe({
        next: (newProduct) => {
          this.router.navigate(['/products', newProduct.id]);
        },
        error: (err) => {
          console.error('Error adding product', err);
        }
      });
    }
  }
}
