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
  productId?: string;
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
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productId = id;
      this.pageTitle = 'Termék szerkesztése';
      this.loadProduct(id);
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
  
  loadProduct(id: string): void { 
    console.log('Loading product with ID:', id);
    this.productService.getProduct(id).subscribe(product => {
      if (product) {
        console.log('Product loaded successfully:', product);
        this.productForm.patchValue({
          name: product.name,
          description: product.description,
          price: product.price,
          categoryId: product.categoryId,
          imageUrl: product.imageUrl
        });
      } else {
        console.error('Product not found with ID:', id);
      }
    });
  }
  
  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }
    
    const formValue = this.productForm.value;
    
    console.log('Form submission - Edit mode:', this.isEditMode);
    console.log('Product ID:', this.productId);
    
    if (this.isEditMode && this.productId) {
      const product: Product = {
        id: this.productId,
        name: formValue.name,
        description: formValue.description,
        price: formValue.price,
        categoryId: formValue.categoryId,
        imageUrl: formValue.imageUrl
      };
      
      console.log('Updating product:', product);
      this.productService.updateProduct(product).subscribe({
        next: () => {
          console.log('Product updated successfully');
          this.router.navigate(['/products', this.productId]);
        },
        error: (err) => {
          console.error('Error updating product', err);
        }
      });
    } else {
      const product: Product = {
        id: '',
        name: formValue.name,
        description: formValue.description,
        price: formValue.price,
        categoryId: formValue.categoryId,
        imageUrl: formValue.imageUrl
      };
      
      console.log('Adding new product:', product);
      this.productService.addProduct(product).subscribe({
        next: (newProduct) => {
          console.log('Product added successfully:', newProduct);
          this.router.navigate(['/products', newProduct.id]);
        },
        error: (err) => {
          console.error('Error adding product', err);
        }
      });
    }
  }
}
