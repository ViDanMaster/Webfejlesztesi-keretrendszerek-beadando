import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Category } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  displayedColumns: string[] = ['id', 'name', 'description', 'actions'];
  
  categoryForm: FormGroup;
  isEditMode = false;
  currentCategoryId: number | null = null;
  isLoading = false;
  
  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required]
    });
  }
  
  ngOnInit(): void {
    this.loadCategories();
  }
  
  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.showMessage('Hiba történt a kategóriák betöltésekor');
        this.isLoading = false;
      }
    });
  }
  
  onSubmit(): void {
    if (this.categoryForm.invalid) {
      return;
    }
    
    const formValue = this.categoryForm.value;
    
    if (this.isEditMode && this.currentCategoryId !== null) {
      // Update
      const category: Category = {
        id: this.currentCategoryId,
        name: formValue.name,
        description: formValue.description
      };
      
      this.categoryService.updateCategory(category).subscribe({
        next: () => {
          this.resetForm();
          this.loadCategories();
          this.showMessage('Kategória sikeresen frissítve');
        },
        error: (err) => {
          console.error('Error updating category', err);
          this.showMessage('Hiba történt a kategória frissítésekor');
        }
      });
    } else {
      // Create
      const category: Category = {
        id: 0, // Temporary, will be set by Firestore
        name: formValue.name,
        description: formValue.description
      };
      
      this.categoryService.addCategory(category).subscribe({
        next: () => {
          this.resetForm();
          this.loadCategories();
          this.showMessage('Kategória sikeresen létrehozva');
        },
        error: (err) => {
          console.error('Error adding category', err);
          this.showMessage('Hiba történt a kategória létrehozásakor');
        }
      });
    }
  }
  
  editCategory(category: Category): void {
    this.isEditMode = true;
    this.currentCategoryId = category.id;
    
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description
    });
  }
  
  deleteCategory(id: number): void {
    if (confirm('Biztosan törölni szeretné ezt a kategóriát?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.loadCategories();
          this.showMessage('Kategória sikeresen törölve');
        },
        error: (err) => {
          console.error('Error deleting category', err);
          this.showMessage('Hiba történt a kategória törlésekor');
        }
      });
    }
  }
  
  resetForm(): void {
    this.isEditMode = false;
    this.currentCategoryId = null;
    this.categoryForm.reset();
  }
  
  private showMessage(message: string): void {
    this.snackBar.open(message, 'Bezár', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}
