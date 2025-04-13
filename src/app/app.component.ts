import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationExtras } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NavbarComponent } from "./shared/navbar/navbar.component";
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatBadgeModule,
    MatListModule,
    MatFormFieldModule,
    MatIconModule,
    NavbarComponent,
    RouterOutlet
  ],
  standalone: true,
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'Arukereso';
  currentSearchTerm: string | null = null;
  onlyFavoritesActive = false;

  constructor(
    private router: Router
  ) {}

  onSearch(searchTerm: string): void {
    console.log('AppComponent received search term:', searchTerm);
    this.currentSearchTerm = searchTerm;
    
    const queryParams = {
      searchTerm
    };
    
    this.router.navigate(['/home'], { 
      queryParams, 
      queryParamsHandling: 'merge' 
    });
  }

  onToggleFavoritesFilter(): void {
    this.onlyFavoritesActive = !this.onlyFavoritesActive;
  
    const queryParams = {
      onlyFavorites: this.onlyFavoritesActive
    };
    
    this.router.navigate(['/home'], { 
      queryParams, 
      queryParamsHandling: 'merge' 
    });
  }
}