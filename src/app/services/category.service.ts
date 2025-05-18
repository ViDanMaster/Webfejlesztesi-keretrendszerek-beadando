import { Injectable } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { Category } from '../models/category.model';
import { Firestore, CollectionReference, DocumentData, collection, collectionData, doc, setDoc, addDoc, deleteDoc, updateDoc, getDoc, query, orderBy } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private categoriesCollection: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    this.categoriesCollection = collection(this.firestore, 'categories');
  }

  addCategory(category: Category): Observable<Category> {
    const newCategory = { ...category };
    const categoryData = {
        name: newCategory.name,
        description: newCategory.description
    };
    return from(addDoc(this.categoriesCollection, categoryData)).pipe(
      map(docRef => {
        return {
          ...newCategory,
          id: docRef.id
        } as unknown as Category;
      })
    );
  }

  getCategories(): Observable<Category[]> {
    const q = query(this.categoriesCollection, orderBy('name'));
    return collectionData(q, { idField: 'id' }) as Observable<Category[]>;
  }

  getCategory(id: number | string): Observable<Category | undefined> {
    const categoryDocRef = doc(this.firestore, `categories/${id}`);
    return from(getDoc(categoryDocRef)).pipe(
      map(docSnapshot => {
        if (docSnapshot.exists()) {
          return { id: docSnapshot.id, ...docSnapshot.data() } as unknown as Category;
        }
        return undefined;
      })
    );
  }

  updateCategory(category: Category): Observable<void> {
    const categoryDocRef = doc(this.firestore, `categories/${category.id}`);
    const categoryData = {
        name: category.name,
        description: category.description
    };
    return from(updateDoc(categoryDocRef, categoryData));
  }

  deleteCategory(id: number | string): Observable<void> {
    const categoryDocRef = doc(this.firestore, `categories/${id}`);
    return from(deleteDoc(categoryDocRef));
  }
}