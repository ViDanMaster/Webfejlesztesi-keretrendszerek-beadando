import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage = '';
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }
  
  passwordMatchValidator(group: FormGroup): {[key: string]: boolean} | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    if (password && confirmPassword && password !== confirmPassword) {
      return { 'passwordMismatch': true };
    }
    
    return null;
  }
  
  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }
    
    const name = this.registerForm.value.name;
    const email = this.registerForm.value.email;
    const password = this.registerForm.value.password;
    
    this.authService.register(email, password, name).subscribe({
      next: (user) => {
        console.log('Registration successful:', user);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Registration error details:', error);
        
        // More specific error handling
        if (error.code) {
          switch(error.code) {
            case 'auth/email-already-in-use':
              this.errorMessage = 'Ez az email cím már regisztrálva van.';
              break;
            case 'auth/invalid-email':
              this.errorMessage = 'Érvénytelen email cím.';
              break;
            case 'auth/weak-password':
              this.errorMessage = 'A jelszó túl gyenge. Legalább 6 karakter legyen.';
              break;
            case 'auth/network-request-failed':
              this.errorMessage = 'Hálózati hiba történt. Kérjük, ellenőrizze az internetkapcsolatot.';
              break;
            default:
              this.errorMessage = 'Hiba történt a regisztráció során. Kérjük, próbálja újra később.';
          }
        } else if (error.message) {
          if (error.message.includes('Email already in use')) {
            this.errorMessage = 'Ez az email cím már regisztrálva van.';
          } else {
            this.errorMessage = 'Hiba történt a regisztráció során: ' + error.message;
          }
        } else {
          this.errorMessage = 'Hiba történt a regisztráció során. Kérjük, próbálja újra később.';
        }
      }
    });
  }
}
