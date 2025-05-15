import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { Category } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    RouterModule
  ],
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit {
  categoryForm!: FormGroup;
  isEditMode = false;
  categoryId?: number;
  pageTitle = 'Új kategória hozzáadása';
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService
  ) {}
  
  ngOnInit(): void {
    this.createForm();
    
    // Check if we're in edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.categoryId = Number(id);
      this.pageTitle = 'Kategória szerkesztése';
      this.loadCategory(Number(id));
    }
  }
  
  createForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required]
    });
  }
  
  loadCategory(id: number): void {
    this.categoryService.getCategory(id).subscribe(category => {
      if (category) {
        this.categoryForm.patchValue({
          name: category.name,
          description: category.description
        });
      }
    });
  }
  
  onSubmit(): void {
    if (this.categoryForm.invalid) {
      return;
    }
    
    const formValue = this.categoryForm.value;
    
    if (this.isEditMode && this.categoryId) {
      // Update existing category
      const category: Category = {
        id: this.categoryId,
        name: formValue.name,
        description: formValue.description
      };
      
      this.categoryService.updateCategory(category).subscribe({
        next: () => {
          this.router.navigate(['/categories']);
        },
        error: (err) => {
          console.error('Error updating category', err);
        }
      });
    } else {
      // Create new category with temporary ID (will be replaced by Firestore)
      const category: Category = {
        id: 0, // Temporary, will be set by Firestore
        name: formValue.name,
        description: formValue.description
      };
      
      this.categoryService.addCategory(category).subscribe({
        next: (newCategory) => {
          this.router.navigate(['/categories']);
        },
        error: (err) => {
          console.error('Error adding category', err);
        }
      });
    }
  }
}
