// filepath: c:\Users\vizid\Desktop\Angular\beadando\src\app\Services\Product.service.ts
import { Injectable } from '@angular/core';
import { Observable, from, map, of } from 'rxjs';
import { Product } from '../models/product.model';
import { FilterOptions } from '../models/filteroptions.model';
import { Firestore, collection, collectionData, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter, getDocs, setDoc } from '@angular/fire/firestore'; // Ensure all are imported

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // private productsCollection; // Ezt a sort távolítsd el vagy kommentezd ki

  constructor(private firestore: Firestore) {
    // this.productsCollection = collection(this.firestore, 'products'); // Ezt a sort távolítsd el vagy kommentezd ki
    // this.seedProducts(); // Ha használtad a seedelést, győződj meg róla, hogy a this.firestore elérhető
  }

  // CREATE
  addProduct(product: Product): Observable<Product> {
    const productsCollectionRef = collection(this.firestore, 'products'); // Hozd létre itt
    const newProduct = { ...product };
    // Fontos: A Firestore dokumentum ID-k stringek. Ha a Product modelled 'id'-je szám,
    // akkor itt konverziós problémák lehetnek, vagy a modellt kell string ID-re módosítani.
    // Az egyszerűség kedvéért feltételezzük, hogy a Firestore generálja az ID-t.
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
          ...newProduct, // Ez tartalmazhatja az eredeti, ideiglenes ID-t
          id: docRef.id // Ez a Firestore által generált string ID
        } as unknown as Product; // Figyelj a típuskonverzióra, ha a Product.id szám
      })
    );
  }

  // READ
  getProducts(): Observable<Product[]> {
    const productsCollectionRef = collection(this.firestore, 'products'); // Hozd létre itt
    return collectionData(productsCollectionRef, { idField: 'id' }) as Observable<Product[]>;
  }

  getProduct(id: number | string): Observable<Product | undefined> { // Az ID lehet string is
    const productDocRef = doc(this.firestore, `products/${id}`);
    return from(getDoc(productDocRef)).pipe(
      map(docSnapshot => {
        if (docSnapshot.exists()) {
          // Ha a Product.id szám, de a docSnapshot.id string, konvertálni kell, vagy a modellt módosítani
          return { id: docSnapshot.id, ...docSnapshot.data() } as unknown as Product;
        }
        return undefined;
      })
    );
  }

  // UPDATE
  updateProduct(product: Product): Observable<void> {
    // Győződj meg róla, hogy product.id string, ha a Firestore dokumentum ID-jével dolgozol
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

  // DELETE
  deleteProduct(id: number | string): Observable<void> { // Az ID lehet string is
    const productDocRef = doc(this.firestore, `products/${id}`);
    return from(deleteDoc(productDocRef));
  }

  // COMPLEX QUERY 1: Get products by category with ordering
  getProductsByCategory(categoryId: number): Observable<Product[]> {
    const productsCollectionRef = collection(this.firestore, 'products'); // Hozd létre itt
    const q = query(
      productsCollectionRef,
      where('categoryId', '==', categoryId),
      orderBy('price', 'asc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Product[]>;
  }

  // COMPLEX QUERY 2: Filtered products with multiple conditions
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

  // COMPLEX QUERY 3: Get paginated products
  getPaginatedProducts(pageSize: number, lastVisible?: any): Observable<{products: Product[], lastVisible: any}> {
    const productsCollectionRef = collection(this.firestore, 'products'); // Hozd létre itt
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
        snapshot.forEach(docSnapshot => { // Renamed 'doc' to 'docSnapshot'
          products.push({ id: docSnapshot.id, ...docSnapshot.data() } as unknown as Product);
        });
        return { products, lastVisible: lastDoc };
      })
    );
  }

  // COMPLEX QUERY 4: Get products with price range and sort order
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