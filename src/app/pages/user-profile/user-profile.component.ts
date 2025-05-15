import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Auth } from '@angular/fire/auth';

import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { ReviewService } from '../../services/review.service';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatTabsModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  userForm: FormGroup;
  topRatedProducts: {product: Product, rating: number}[] = [];
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private reviewService: ReviewService,
    private productService: ProductService,
    private auth: Auth,
    private authService: AuthService
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }
  
  ngOnInit(): void {
    // Check Firebase auth state first
    const currentAuthUser = this.auth.currentUser;
    console.log('Current Firebase auth user:', currentAuthUser);
    
    if (!currentAuthUser) {
      console.error('Firebase auth user not found - redirecting to login');
      this.router.navigate(['/login']);
      return;
    }
    
    // Get user data from service instead of localStorage for consistency
    this.userService.getUserById(currentAuthUser.uid).subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
          this.userForm.patchValue({
            name: user.name,
            email: user.email
          });
          // Update localStorage to keep it in sync
          localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
          console.error('No user data found for:', currentAuthUser.uid);
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        console.error('Error fetching user data:', err);
        this.router.navigate(['/login']);
      }
    });
    
    // Get top rated products
    this.reviewService.getTopRatedProducts(5).subscribe(ratings => {
      ratings.forEach(rating => {
        this.productService.getProduct(rating.productId).subscribe(product => {
          if (product) {
            this.topRatedProducts.push({
              product: product,
              rating: rating.averageRating
            });
          }
        });
      });
    });
  }
  
  saveProfile(): void {
    if (this.userForm.invalid || !this.user) {
      return;
    }
    
    // Log detailed state for debugging
    console.log('Current auth state before save:', {
      currentAuthUser: this.auth.currentUser,
      authUid: this.auth.currentUser?.uid,
      user: this.user
    });
    
    // Make sure you're authenticated
    if (!this.auth.currentUser) {
      console.error('Not authenticated!');
      this.router.navigate(['/login']);
      return;
    }
    
    // Make sure the document ID matches the auth UID
    if (this.auth.currentUser.uid !== this.user.id) {
      console.error('Auth UID does not match user ID', {
        authUid: this.auth.currentUser?.uid,
        userId: this.user.id
      });
      alert('Azonosítási hiba. Jelentkezzen be újra.');
      this.logout();
      return;
    }
    
    const updatedUser: User = {
      ...this.user,
      name: this.userForm.value.name,
      email: this.userForm.value.email
    };
    
    this.userService.updateUser(updatedUser).subscribe({
      next: () => {
        // Update localStorage
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        this.user = updatedUser;
        alert('Profil sikeresen frissítve!');
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        alert('Hiba történt a profil frissítése során.');
      }
    });
  }
  
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout error:', err);
        // Still clear local storage as fallback
        localStorage.removeItem('currentUser');
        this.router.navigate(['/login']);
      }
    });
  }
  
  getStarArray(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }
  
  getEmptyStarArray(rating: number): number[] {
    return Array(5 - Math.round(rating)).fill(0);
  }
}
