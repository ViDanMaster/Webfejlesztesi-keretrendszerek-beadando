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
    this.isLoggedIn$ = this.currentUser$.pipe(
      map(user => !!user)
    );

    onAuthStateChanged(this.auth, (firebaseUser) => {
      if (firebaseUser) {
        this.getUserProfile(firebaseUser.uid).subscribe(user => {
          if (user) {
            this.currentUserSubject.next(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
          } else {
            console.error('No user data found in Firestore for:', firebaseUser.uid);
          }
        });
      } else {
        this.currentUserSubject.next(null);
        localStorage.removeItem('currentUser');
      }
    });

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
        
        const newUser: User = {
          id: firebaseUser.uid,
          name: name,
          email: firebaseUser.email || email,
        };
        
        const userDocRef = doc(this.firestore, `users/${newUser.id}`);
        return from(setDoc(userDocRef, {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email.toLowerCase()
        })).pipe(
          map(() => newUser),
          catchError(error => {
            console.error('Error creating user in Firestore:', error);
            credential.user.delete();
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

  login(email: string, password: string): Observable<User | null> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(() => {
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

  getCurrentUser(): User | null {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  }

  getUserProfile(userId: string): Observable<User | null> {
    return this.userService.getUserById(userId).pipe(
      map(user => user === undefined ? null : user)
    );
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  updateUserEmail(newEmail: string) {
    return new Observable<void>((observer) => {
      if (!this.auth.currentUser) {
        observer.error('No authenticated user found');
        return;
      }

      const user = this.auth.currentUser;
      
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
