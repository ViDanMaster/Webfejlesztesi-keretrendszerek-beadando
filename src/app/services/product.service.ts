import { Injectable } from '@angular/core';
import { Observable, from, map, of } from 'rxjs';
import { Product } from '../models/product.model';
import { FilterOptions } from '../models/filteroptions.model';
import { Firestore, collection, collectionData, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter, getDocs, setDoc } from '@angular/fire/firestore'; // Ensure all are imported

@Injectable({
  providedIn: 'root',
})
export class ProductService {

  constructor(private firestore: Firestore) {}

  addProduct(product: Product): Observable<Product> {
    const productsCollectionRef = collection(this.firestore, 'products');
    const newProduct = { ...product };
    const productData = {
      name: newProduct.name,
      description: newProduct.description,
      price: newProduct.price,
      categoryId: newProduct.categoryId,
      imageUrl: newProduct.imageUrl
    };
    return from(addDoc(productsCollectionRef, productData)).pipe(
      map(docRef => {
        return {
          ...newProduct,
          id: docRef.id
        } as unknown as Product;
      })
    );
  }

  getProducts(): Observable<Product[]> {
    const productsCollectionRef = collection(this.firestore, 'products');
    return collectionData(productsCollectionRef, { idField: 'id' }) as Observable<Product[]>;
  }

  getProduct(id: number | string): Observable<Product | undefined> {
    const productDocRef = doc(this.firestore, `products/${id}`);
    return from(getDoc(productDocRef)).pipe(
      map(docSnapshot => {
        if (docSnapshot.exists()) {
          return { id: docSnapshot.id, ...docSnapshot.data() } as unknown as Product;
        }
        return undefined;
      })
    );
  }

  updateProduct(product: Product): Observable<void> {
    const productDocRef = doc(this.firestore, `products/${product.id}`);
    const productData = {
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: product.categoryId,
        imageUrl: product.imageUrl
    };
    return from(updateDoc(productDocRef, productData));
  }

  deleteProduct(id: number | string): Observable<void> { 
    const productDocRef = doc(this.firestore, `products/${id}`);
    return from(deleteDoc(productDocRef));
  }

  getProductsByCategory(categoryId: number): Observable<Product[]> {
    const productsCollectionRef = collection(this.firestore, 'products');
    const q = query(
      productsCollectionRef,
      where('categoryId', '==', categoryId),
      orderBy('price', 'asc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Product[]>;
  }

  getFilteredProducts(filters: FilterOptions): Observable<Product[]> {
    const productsCollectionRef = collection(this.firestore, 'products'); // Hozd létre itt
    let q = query(productsCollectionRef);

    if (filters.categoryId !== null) {
      q = query(q, where('categoryId', '==', filters.categoryId));
    }
    if (filters.minPrice !== null) {
      q = query(q, where('price', '>=', filters.minPrice));
    }
    if (filters.maxPrice !== null) {
      q = query(q, where('price', '<=', filters.maxPrice));
    }
    q = query(q, orderBy('price', 'asc'));

    return collectionData(q, { idField: 'id' }).pipe(
      map(products => {
        let result = products as Product[];
        if (filters.searchTerm) {
          const term = filters.searchTerm.toLowerCase().trim();
          result = result.filter(product =>
            product.name.toLowerCase().includes(term) ||
            product.description.toLowerCase().includes(term)
          );
        }
        return result;
      })
    );
  }

  getPaginatedProducts(pageSize: number, lastVisible?: any): Observable<{products: Product[], lastVisible: any}> {
    const productsCollectionRef = collection(this.firestore, 'products');
    let q;
    if (lastVisible) {
      q = query(
        productsCollectionRef,
        orderBy('name'),
        startAfter(lastVisible),
        limit(pageSize)
      );
    } else {
      q = query(
        productsCollectionRef,
        orderBy('name'),
        limit(pageSize)
      );
    }
    return from(getDocs(q)).pipe(
      map(snapshot => {
        const products: Product[] = [];
        const lastDoc = snapshot.docs[snapshot.docs.length - 1];
        snapshot.forEach(docSnapshot => {
          products.push({ id: docSnapshot.id, ...docSnapshot.data() } as unknown as Product);
        });
        return { products, lastVisible: lastDoc };
      })
    );
  }

  getProductsInPriceRangeWithSort(
    minPrice: number,
    maxPrice: number,
    sortField: string = 'price',
    sortDirection: 'asc' | 'desc' = 'asc',
    limitCount: number = 10
  ): Observable<Product[]> {
    const productsCollectionRef = collection(this.firestore, 'products'); // Hozd létre itt
    const q = query(
      productsCollectionRef,
      where('price', '>=', minPrice),
      where('price', '<=', maxPrice),
      orderBy(sortField, sortDirection),
      limit(limitCount)
    );
    return collectionData(q, { idField: 'id' }) as Observable<Product[]>;
  }


}