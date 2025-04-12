import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../models/product.model';
import { FilterOptions } from '../models/filteroptions.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private products: Product[] = [
    new Product(1, 'Samsung Galaxy S21', 'Okostelefon 8GB RAM-mal', 250000, 1, 'assets/samsung-galaxy-s21.jpg'),
    new Product(4, 'Sony TV', '55 inches 4K UHD televízió', 100000, 1, 'assets/sony-tv.jpg'),
    new Product(7, 'Apple MacBook Air', 'M2 chip, 256GB SSD, 8GB RAM', 450000, 1, 'assets/macbook-air.jpg'),
    new Product(8, 'JBL Bluetooth hangszóró', 'Vezeték nélküli hangszóró erőteljes hangzással', 30000, 1, 'assets/jbl-speaker.jpg'),
    new Product(26, 'Laptoptáska', 'Divatos táska laptophoz', 15000, 1, 'assets/laptoptaska.jpg'),
  
    new Product(2, 'Nike Air Max', 'Kényelmes futócipő', 35000, 2, 'assets/nike-air-max.jpg'),
    new Product(9, 'Adidas melegítő', 'Kényelmes szett sportoláshoz', 28000, 2, 'assets/adidas-melegito.jpg'),
    new Product(10, 'Téli kabát', 'Meleg, vízálló kabát hideg napokra', 40000, 2, 'assets/teli-kabat.jpg'),
    new Product(18, 'Farmer nadrág', 'Klasszikus kék farmer', 15000, 2, 'assets/farmer.jpg'),
    new Product(19, 'Napszemüveg', 'UV szűrős divatos napszemüveg', 7000, 2, 'assets/napszemuveg.jpg'),
  
    new Product(11, 'Bio alma', 'Friss, ropogós bio alma (1kg)', 800, 3, 'assets/bio-alma.jpg'),
    new Product(12, 'Kávé kapszula', 'Intenzív ízű eszpresszó kapszulák (10db)', 1500, 3, 'assets/kave-kapszula.jpg'),
    new Product(20, 'Teljes kiőrlésű kenyér', 'Egészséges, friss pékáru (500g)', 600, 3, 'assets/kenyer.jpg'),
    new Product(21, 'Narancslé', '100%-os gyümölcslé, 1L', 900, 3, 'assets/narancsle.jpg'),
    new Product(27, 'Mozzarella sajt', 'Olasz mozzarella, 125g', 1100, 3, 'assets/mozzarella.jpg'),
  
    new Product(5, 'Asztal', 'Modern étkezőasztal', 50000, 4, 'assets/asztal.jpg'),
    new Product(13, 'Állólámpa', 'Modern dizájn, meleg fény', 20000, 4, 'assets/allolampa.jpg'),
    new Product(14, 'Ágynemű garnitúra', '4 részes pamut ágynemű szett', 12000, 4, 'assets/agynemu.jpg'),
    new Product(22, 'Függöny szett', 'Elegáns sötétítő függönyök (2db)', 18000, 4, 'assets/fuggony.jpg'),
    new Product(23, 'Konyhai robotgép', 'Többfunkciós konyhai segédeszköz', 35000, 4, 'assets/robotgep.jpg'),
  
    new Product(6, 'Futball labda', 'Tökéletes focizáshoz', 10000, 5, 'assets/futball-labda.jpg'),
    new Product(15, 'Jógamatrac', 'Csúszásmentes és kényelmes', 6000, 5, 'assets/jogamatrac.jpg'),
    new Product(16, 'Kerékpáros sisak', 'Könnyű és biztonságos fejvédő', 18000, 5, 'assets/kerekparos-sisak.jpg'),
    new Product(24, 'Súlyzókészlet', 'Kézi súlyzók, 2x5kg', 12000, 5, 'assets/sulyzok.jpg'),
    new Product(25, 'Futóóra', 'Pulzusmérős, GPS-es okosóra', 27000, 5, 'assets/futora.jpg'),
  ];
  

  constructor() {}

  getProducts(): Observable<Product[]> {
    return of(this.products);
  }

  getProductsByCategory(categoryId: number): Observable<Product[]> {
    return of(this.products.filter(product => product.categoryId === categoryId));
  }

  getFilteredProducts(filters: FilterOptions): Observable<Product[]> {
    let filteredProducts = [...this.products];
    
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase().trim();
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(term) || 
        product.description.toLowerCase().includes(term)
      );
    }
    
    if (filters.categoryId !== null) {
      filteredProducts = filteredProducts.filter(product => 
        product.categoryId === filters.categoryId
      );
    }
    
    if (filters.minPrice !== null) {
      filteredProducts = filteredProducts.filter(product => 
        product.price >= filters.minPrice!
      );
    }
    
    if (filters.maxPrice !== null) {
      filteredProducts = filteredProducts.filter(product => 
        product.price <= filters.maxPrice!
      );
    }
    
    return of(filteredProducts);
  }
}