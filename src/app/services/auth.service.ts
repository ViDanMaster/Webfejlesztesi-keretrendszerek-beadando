import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser = this.currentUserSubject.asObservable();
  
  private users: User[] = [];
  
  constructor() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
    
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      this.users = JSON.parse(storedUsers);
    }
  }
  
  register(user: User): Observable<User> {
    if (this.users.find(u => u.email === user.email)) {
      return throwError(() => new Error('Email already registered'));
    }
    
    const newUser: User = {
      ...user,
      id: Date.now().toString()
    };
    
    const { password, ...userWithoutPassword } = newUser;
    
    this.users.push(newUser);
    
    this.saveUsers();
    
    return of(userWithoutPassword as User).pipe(
      tap(() => console.log('User registered:', userWithoutPassword))
    );
  }
  
  login(email: string, password: string): Observable<User> {
    const user = this.users.find(u => u.email === email);
    
    if (!user) {
      return throwError(() => new Error('User not found'));
    }
    
    if (user.password !== password) {
      return throwError(() => new Error('Invalid password'));
    }
    
    const { password: pwd, ...userWithoutPassword } = user;
    
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    
    this.currentUserSubject.next(userWithoutPassword);
    
    return of(userWithoutPassword).pipe(
      tap(() => console.log('User logged in:', userWithoutPassword))
    );
  }
  
  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
  
  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }
  
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
  
  private saveUsers(): void {
    localStorage.setItem('users', JSON.stringify(this.users));
  }
}