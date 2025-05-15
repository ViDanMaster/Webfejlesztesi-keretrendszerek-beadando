import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { SearchFormComponent } from '../search-form/search-form.component';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    MatToolbar, 
    SearchFormComponent, 
    MatIcon, 
    MatButtonModule,
    MatTooltipModule,
    RouterModule
  ],
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  @Output() search = new EventEmitter<string>();
  isLoggedIn = false;
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}
  
  ngOnInit() {
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });
  }
  
  onSearch(searchTerm: string): void {
    console.log('NavbarComponent forwarding search term:', searchTerm);
    this.search.emit(searchTerm);
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}
