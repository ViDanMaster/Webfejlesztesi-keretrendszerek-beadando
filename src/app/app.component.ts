import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NavbarComponent } from "./shared/navbar/navbar.component";
import { MatIconModule } from '@angular/material/icon';
import { HomeComponent } from './pages/home/home.component';
import { FilterSidebarComponent } from './shared/filter-sidebar/filter-sidebar.component';
import { Product } from './models/product.model';
import { ProductService } from './services/product.service';
import { FilterOptions } from './models/filteroptions.model';

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.css'],
  imports: [
    CommonModule,
    RouterOutlet,
    ReactiveFormsModule,
    MatButtonModule,
    MatBadgeModule,
    MatListModule,
    MatFormFieldModule,
    MatIconModule,
    FilterSidebarComponent,
    NavbarComponent,
    HomeComponent
  ],
  standalone: true,
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'beadando';
  filteredProducts: Product[] = [];
  selectedCategory: number | null = null;
  currentSearchTerm: string | null = null;
  
  currentFilters: FilterOptions = {
    categoryId: null,
    minPrice: null,
    maxPrice: null,
    searchTerm: null
  };

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {
    this.loadAllProducts();
  }

  private loadAllProducts(): void {
    this.productService.getProducts().subscribe(products => {
      this.filteredProducts = products;
    });
  }

  onFiltersChanged(filters: FilterOptions): void {
    this.selectedCategory = filters.categoryId;
    this.currentSearchTerm = filters.searchTerm;
    this.currentFilters = { ...filters };
    
    this.productService.getFilteredProducts(filters).subscribe(products => {
      this.filteredProducts = products;
    });

    console.log('Filters changed:', filters);
  }

  onSearch(searchTerm: string): void {
    console.log('AppComponent received search term:', searchTerm);
    this.currentSearchTerm = searchTerm;
    
    const updatedFilters: FilterOptions = {
      ...this.currentFilters,
      searchTerm: searchTerm
    };
    
    this.onFiltersChanged(updatedFilters);
    this.cdr.detectChanges();
  }

  onCategorySelect(categoryId: number | null): void {
    this.selectedCategory = categoryId;
    
    const filters: FilterOptions = {
      categoryId: categoryId,
      minPrice: null,
      maxPrice: null,
      searchTerm: this.currentSearchTerm
    };
    
    this.onFiltersChanged(filters);
  }
}