import { Injectable, inject } from '@angular/core';
import { Observable, from, map, catchError, throwError, switchMap } from 'rxjs';
import { User } from '../models/user.model';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  getDoc,
  query,
  where,
  limit
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);
  private usersCollection = collection(this.firestore, 'users');

  addUser(user: User): Observable<User> {
    return this.findUsersByEmail(user.email).pipe(
      map(existingUsers => {
        if (existingUsers.length > 0) {
          throw new Error('Email already in use');
        }
        return user;
      }),
      switchMap(newUser => {
        const userDocRef = doc(this.firestore, `users/${newUser.id}`);
        return from(setDoc(userDocRef, {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email.toLowerCase()
        })).pipe(
          map(() => newUser),
          catchError(error => {
            console.error('Error adding user to Firestore:', error);
            throw error;
          })
        );
      })
    );
  }

  // READ
  getUsers(): Observable<User[]> {
    return collectionData(this.usersCollection, { idField: 'id' }) as Observable<User[]>;
  }

  getUserById(id: string): Observable<User | null> {
    console.log('Getting user with ID:', id);
    console.log('Auth state:', this.auth.currentUser?.uid);
    
    const userDocRef = doc(this.firestore, `users/${id}`);
    
    return from(getDoc(userDocRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          const userData = docSnap.data() as User;
          return userData;
        } else {
          console.log('No user document found with ID:', id);
          return null;
        }
      })
    );
  }

  findUsersByName(nameFragment: string): Observable<User[]> {
    return this.getUsers().pipe(
      map(users => users.filter(user => 
        user.name.toLowerCase().includes(nameFragment.toLowerCase())
      ))
    );
  }

  findUsersByEmail(email: string): Observable<User[]> {
    const q = query(
      this.usersCollection,
      where('email', '==', email.toLowerCase())
    );
    return collectionData(q, { idField: 'id' }) as Observable<User[]>;
  }

  updateUser(user: User): Observable<void> {
    console.log('Updating user with ID:', user.id);
    console.log('Current auth state:', this.auth.currentUser?.uid);
    
    if (!this.auth.currentUser) {
      console.error('No authenticated user!');
      return throwError(() => new Error('No authenticated user'));
    }
    
    if (this.auth.currentUser.uid !== user.id) {
      console.error('Auth UID does not match document ID', {
        authUid: this.auth.currentUser.uid,
        docId: user.id
      });
      return throwError(() => new Error('Auth UID does not match document ID'));
    }
    
    const userDocRef = doc(this.firestore, `users/${user.id}`);
    
    return from(updateDoc(userDocRef, {
      name: user.name,
      email: user.email
    }));
  }

  // DELETE
  deleteUser(id: number): Observable<void> {
    const userDoc = doc(this.firestore, `users/${id}`);
    return from(deleteDoc(userDoc));
  }
}
