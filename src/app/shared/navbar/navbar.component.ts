import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core'; // Add OnInit, OnDestroy
import { MatToolbar } from '@angular/material/toolbar';
import { SearchFormComponent } from '../search-form/search-form.component';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FavoriteService } from '../../services/favorite.service';
import { MatBadgeModule } from '@angular/material/badge';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs'; // Import Subscription

@Component({
  selector: 'app-navbar',
  imports: [MatToolbar, RouterLink, SearchFormComponent, MatIcon, MatButtonModule, MatBadgeModule, MatMenuTrigger, CommonModule, MatMenu],
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy { // Implement OnInit, OnDestroy
  @Output() search = new EventEmitter<string>();
  @Output() toggleFavoritesFilter = new EventEmitter<Boolean>();
  showingFavorites = false;
  currentUser: User | null = null;
  isOnHomePage: boolean = false; // Új tulajdonság
  private routerSubscription: Subscription | undefined; // Feliratkozás tárolása

  constructor(
    private favoriteService: FavoriteService,
    private authService: AuthService,
    public router : Router
  ) {}

  favoriteCount = 0;

  ngOnInit(): void {
    this.favoriteService.getFavoriteCount().subscribe(count => {
      this.favoriteCount = count;
    });

    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });

    this.routerSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isOnHomePage = event.urlAfterRedirects === '/' || event.urlAfterRedirects.startsWith('/home');
      console.log('NavigationEnd:', event.urlAfterRedirects, 'isOnHomePage:', this.isOnHomePage); // Debug log
    });

    this.isOnHomePage = this.router.url === '/' || this.router.url.startsWith('/home');
    console.log('Initial check:', this.router.url, 'isOnHomePage:', this.isOnHomePage); // Debug log
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  onSearch(searchTerm: string): void {
    console.log('NavbarComponent forwarding search term:', searchTerm);
    this.search.emit(searchTerm);
  }

  onFavoritesClick(): void {
    this.showingFavorites = !this.showingFavorites;
    this.toggleFavoritesFilter.emit(this.showingFavorites);
    console.log('Favorites toggled to:', this.showingFavorites);
  }

  logout(): void {
    this.authService.logout();
  }

}