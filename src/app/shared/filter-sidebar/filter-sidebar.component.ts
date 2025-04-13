import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Category } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';
import { FilterOptions } from '../../models/filteroptions.model';
import { B } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-filter-sidebar',
  imports: [CommonModule, RouterModule, FormsModule],
  standalone: true,
  templateUrl: './filter-sidebar.component.html',
  styleUrl: './filter-sidebar.component.css'
})
export class FilterSidebarComponent implements OnInit {
  categories: Category[] = [];

  filters: FilterOptions = {
    categoryId: null,
    minPrice: null,
    maxPrice: null,
    searchTerm: null,
    onlyFavorites: false
  };
  
  @Input() set searchTerm(value: string | null) {
    if (value !== this.filters.searchTerm) {
      this.filters.searchTerm = value;
    }
  }

  @Input() set onlyFavorites(value: Boolean) {
    if (value !== undefined) {
      this.filters.onlyFavorites = value;
    } else {
      this.filters.onlyFavorites = false;
    }
    console.log('FilterSidebarComponent onlyFavorites:', this.filters.onlyFavorites);
  }
  
  @Output() filtersChanged = new EventEmitter<FilterOptions>();
  
  constructor(
    private categoryService: CategoryService,
  ) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }
  
  onCategoryClick(event: Event, categoryId: number | null): void {
    event.preventDefault();
    this.filters.categoryId = categoryId;
    this.emitFilters();
  }
  
  onPriceFilterChange(): void {
    if (this.filters.minPrice !== null && this.filters.maxPrice !== null) {
      if (this.filters.minPrice > this.filters.maxPrice) {
        this.filters.maxPrice = this.filters.minPrice;
      }
    }
    this.emitFilters();
  }
  
  clearAllFilters(): void {
    this.filters = {
      categoryId: null,
      minPrice: null,
      maxPrice: null,
      searchTerm: null,
      onlyFavorites: Boolean(false)
    };
    this.emitFilters();
  }
  
  private emitFilters(): void {
    this.filtersChanged.emit({...this.filters});
  }
}