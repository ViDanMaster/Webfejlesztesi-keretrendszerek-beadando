import { Injectable } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  UserCredential,
  updateEmail
} from '@angular/fire/auth';
import { doc, setDoc, Firestore } from '@angular/fire/firestore';
import { Observable, from, of, BehaviorSubject, catchError } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { UserService } from './user.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  isLoggedIn$: Observable<boolean>;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private userService: UserService,
    private router: Router
  ) {
    // Initialize the auth state
    this.isLoggedIn$ = this.currentUser$.pipe(
      map(user => !!user)
    );

    // Monitor the authentication state
    onAuthStateChanged(this.auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, get their profile from Firestore
        this.getUserProfile(firebaseUser.uid).subscribe(user => {
          if (user) {
            this.currentUserSubject.next(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
          } else {
            console.error('No user data found in Firestore for:', firebaseUser.uid);
          }
        });
      } else {
        // User is signed out
        this.currentUserSubject.next(null);
        localStorage.removeItem('currentUser');
      }
    });

    // Check if user exists in localStorage for backward compatibility
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem('currentUser');
      }
    }
  }

  register(email: string, password: string, name: string): Observable<User> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((credential: UserCredential) => {
        const firebaseUser = credential.user;
        
        // Felhasználói adatok létrehozása
        const newUser: User = {
          id: firebaseUser.uid,
          name: name,
          email: firebaseUser.email || email,
        };
        
        // Dokumentum létrehozása a felhasználó uid-jével
        const userDocRef = doc(this.firestore, `users/${newUser.id}`);
        return from(setDoc(userDocRef, {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email.toLowerCase()
        })).pipe(
          map(() => newUser),
          catchError(error => {
            console.error('Error creating user in Firestore:', error);
            credential.user.delete(); // Töröld az auth fiókot, ha a Firestore doc létrehozása hibás
            throw error;
          })
        );
      }),
      tap(user => {
        this.currentUserSubject.next(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      }),
      catchError(error => {
        console.error('Registration error:', error);
        throw error;
      })
    );
  }

  // Sign in an existing user
  login(email: string, password: string): Observable<User | null> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((credential: UserCredential) => {
        // For this app, we'll just search for users by email
        return this.userService.findUsersByEmail(email).pipe(
          map(users => users.length > 0 ? users[0] : null),
          catchError(error => {
            console.error('Error finding user by email:', error);
            throw error;
          })
        );
      }),
      tap(user => {
        if (user) {
          this.currentUserSubject.next(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  // Sign out the current user
  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        localStorage.removeItem('currentUser');
        this.router.navigate(['/login']);
      }),
      catchError(error => {
        console.error('Logout error:', error);
        throw error;
      })
    );
  }

  // Get the current auth state
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Get the user profile from Firestore based on Firebase UID
  getUserProfile(userId: string): Observable<User | null> {
    return this.userService.getUserById(userId).pipe(
      map(user => user === undefined ? null : user)
    );
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  updateUserEmail(newEmail: string) {
    return new Observable<void>((observer) => {
      if (!this.auth.currentUser) {
        observer.error('No authenticated user found');
        return;
      }
      
      // First, verify the user's current credentials (optional but recommended)
      // This would require getting the password from the user

      // Send verification email to the new email address
      const user = this.auth.currentUser;
      
      // Using verifyBeforeUpdateEmail instead of updateEmail
      // This sends a verification email to the new address
      import('firebase/auth').then(({ verifyBeforeUpdateEmail }) => {
        verifyBeforeUpdateEmail(user, newEmail)
          .then(() => {
            observer.next();
            observer.complete();
          })
          .catch((error) => {
            observer.error(error);
          });
      }).catch(error => {
        observer.error(error);
      });
    });
  }
}
