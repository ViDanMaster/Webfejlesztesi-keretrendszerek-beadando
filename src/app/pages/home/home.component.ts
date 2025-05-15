import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class HomeComponent implements OnChanges {
  @Input() selectedCategory: number | null = null;
  @Input() products: Product[] = [];
  
  displayedProducts: Product[] = [];

  constructor(private productService: ProductService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['products'] && changes['products'].currentValue) {
      this.displayedProducts = changes['products'].currentValue;
    } 
    else if (changes['selectedCategory']) {
      this.loadProductsByCategory();
    }
  }

  private loadProductsByCategory(): void {
    if (this.selectedCategory === null) {
      this.productService.getProducts().subscribe(products => {
        this.displayedProducts = products;
      });
    } else {
      this.productService.getProductsByCategory(this.selectedCategory).subscribe(products => {
        this.displayedProducts = products;
      });
    }
  }
}