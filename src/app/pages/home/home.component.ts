import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { PriceFormatPipe } from '../../shared/pipes/price-format.pipe';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { FavoriteService } from '../../services/favorite.service';
import { FilterOptions } from '../../models/filteroptions.model';
import { Subscription } from 'rxjs';
import { FilterSidebarComponent } from '../../shared/filter-sidebar/filter-sidebar.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    CommonModule, 
    PriceFormatPipe, 
    MatCard, 
    MatCardContent, 
    MatCardHeader, 
    MatCardTitle, 
    MatCardActions, 
    MatIcon,
    FilterSidebarComponent
  ],
})
export class HomeComponent implements OnInit, OnDestroy {
  selectedCategory: number | null = null;
  displayedProducts: Product[] = [];
  onlyFavoritesActive = false;
  currentSearchTerm: string | null = null;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private productService: ProductService,
    private favoriteService: FavoriteService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const routeSub = this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['category'] ? Number(params['category']) : null;
      this.currentSearchTerm = params['searchTerm'] || null;
      this.onlyFavoritesActive = params['onlyFavorites'] === 'true';
      const minPrice = params['minPrice'] ? Number(params['minPrice']) : null;
      const maxPrice = params['maxPrice'] ? Number(params['maxPrice']) : null;
      
      const filters: FilterOptions = {
        categoryId: this.selectedCategory,
        minPrice: minPrice,
        maxPrice: maxPrice,
        searchTerm: this.currentSearchTerm,
        onlyFavorites: this.onlyFavoritesActive
      };
      
      const hasActiveFilters = this.selectedCategory !== null || 
                               this.currentSearchTerm !== null || 
                               this.onlyFavoritesActive || 
                               minPrice !== null || 
                               maxPrice !== null;
      
      if (!hasActiveFilters) {
        console.log('Loading all products - no active filters');
        const prodSub = this.productService.getProducts().subscribe(products => {
          this.displayedProducts = products;
          this.updateFavorites();
        });
        this.subscriptions.push(prodSub);
      } else {
        console.log('Loading filtered products', filters);
        const filteredSub = this.productService.getFilteredProducts(filters).subscribe(products => {
          this.displayedProducts = products;
          this.updateFavorites();
        });
        this.subscriptions.push(filteredSub);
      }
    });
    this.subscriptions.push(routeSub);
  
    const favSub = this.favoriteService.getFavorites().subscribe(() => {
      this.updateFavorites();
    });
    this.subscriptions.push(favSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleFavorite(event: Event, id: number): void {
    event.stopPropagation();
    this.favoriteService.toggleFavorite(id);
  }

  onFiltersChanged(filters: FilterOptions): void {
    this.selectedCategory = filters.categoryId;
    this.currentSearchTerm = filters.searchTerm;
    
    this.productService.getFilteredProducts(filters).subscribe(products => {
      this.displayedProducts = products;
      this.updateFavorites();
      this.updateRouteWithFilters(filters);
    });
  }

  private updateRouteWithFilters(filters: FilterOptions): void {
    const queryParams: any = {
      category: filters.categoryId,
      searchTerm: filters.searchTerm,
      onlyFavorites: filters.onlyFavorites,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice
    };
    
    Object.keys(queryParams).forEach(key => {
      console.log(queryParams)
      if (queryParams[key] === null || queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });
    
    const navigationExtras: NavigationExtras = {
      queryParams
    };
    
    this.router.navigate(['/home'], navigationExtras);
  }

  private updateFavorites(): void {
    const favSub = this.favoriteService.getFavorites().subscribe(favorites => {
      this.displayedProducts.forEach(product => {
        product.isFavorite = favorites.has(product.id);
      });
    });
    this.subscriptions.push(favSub);
  }
}