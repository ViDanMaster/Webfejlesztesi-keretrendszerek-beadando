import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private categories: Category[] = [
    new Category(1, 'Elektronika', 'Mindenféle elektronikai termék'),
    new Category(2, 'Ruha', 'Divatos ruhák és kiegészítők'),
    new Category(3, 'Élelmiszer', 'Friss élelmiszerek és italok'),
    new Category(4, 'Otthon', 'Bútorok és lakberendezési termékek'),
    new Category(5, 'Sport', 'Sporteszközök és ruházat'),
  ];

  constructor() {}

  getCategories(): Observable<Category[]> {
    return of(this.categories);
  }

  addCategory(category: Category): void {
    this.categories.push(category);
  }

  deleteCategory(id: number): void {
    this.categories = this.categories.filter(cat => cat.id !== id);
  }
}