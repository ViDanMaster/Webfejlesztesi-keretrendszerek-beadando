import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private favoriteProductIds: Set<number> = new Set<number>();
  private favoritesSubject = new BehaviorSubject<Set<number>>(this.favoriteProductIds);
  private favoriteProductsSubject = new BehaviorSubject<Product[]>([]);

  constructor() {
    const savedFavorites = localStorage.getItem('favoriteProducts');
    if (savedFavorites) {
      this.favoriteProductIds = new Set<number>(JSON.parse(savedFavorites));
      this.favoritesSubject.next(this.favoriteProductIds);
    }
  }

  toggleFavorite(productId: number): void {
    if (this.favoriteProductIds.has(productId)) {
      this.favoriteProductIds.delete(productId);
    } else {
      this.favoriteProductIds.add(productId);
    }
    
    this.favoritesSubject.next(this.favoriteProductIds);
    this.saveToLocalStorage();
  }

  isFavorite(productId: number): boolean {
    return this.favoriteProductIds.has(productId);
  }

  getFavorites(): Observable<Set<number>> {
    return this.favoritesSubject.asObservable();
  }

  getFavoriteProducts(): Observable<Product[]> {
    return this.favoriteProductsSubject.asObservable();
  }

  updateFavoriteProducts(allProducts: Product[]): void {
    const favoriteProducts = allProducts.filter(product => 
      this.favoriteProductIds.has(product.id)
    );
    this.favoriteProductsSubject.next(favoriteProducts);
  }

  getFavoriteCount(): Observable<number> {
    return new Observable<number>(observer => {
      this.favoritesSubject.subscribe(favorites => {
        observer.next(favorites.size);
      });
    });
  }

  getFavoriteProductIds(): number[] {
    return this.favoriteProductIds ? Array.from(this.favoriteProductIds) : [];
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('favoriteProducts', JSON.stringify([...this.favoriteProductIds]));
  }
}