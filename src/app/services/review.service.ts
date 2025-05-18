import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  DocumentData,
  collectionData,
  doc,
  updateDoc,
  deleteDoc
} from '@angular/fire/firestore';
import { User } from '../models/user.model';
import { Review } from '../models/review.model';
import { Observable, from, map, switchMap, of, forkJoin } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {}

  addReview(review: Review): Observable<Review> {
    const user = this.authService.getCurrentUser();
    
    if (!user) {
      return of(null as unknown as Review);
    }
    
    const reviewWithUser: Review = {
      ...review,
      userName: user.name || 'Névtelen felhasználó'
    };
    
    const reviewData = {
      productId: reviewWithUser.productId,
      userId: reviewWithUser.userId,
      userName: reviewWithUser.userName,
      rating: reviewWithUser.rating,
      comment: reviewWithUser.comment,
      date: serverTimestamp()
    };
    
    console.log('Saving review to Firestore:', reviewData);
    
    const reviewsCollection = collection(this.firestore, 'reviews');
    return from(addDoc(reviewsCollection, reviewData)).pipe(
      map(docRef => {
        console.log('Review saved with ID:', docRef.id);
        return {
          ...reviewWithUser,
          id: docRef.id,
          date: new Date()
        };
      })
    );
  }

  getReviewsByProduct(productId: string): Observable<Review[]> {
    console.log('Fetching reviews for product:', productId);
    
    const reviewsCollection = collection(this.firestore, 'reviews');
    const reviewsQuery = query(
      reviewsCollection,
      where('productId', '==', productId),
      orderBy('date', 'desc')
    );
    
    return from(getDocs(reviewsQuery)).pipe(
      map(snapshot => {
        const reviews = snapshot.docs.map(doc => {
          const data = doc.data();
          const review: Review = {
            id: doc.id,
            productId: data['productId'],
            userId: data['userId'],
            userName: data['userName'] || 'Névtelen felhasználó',
            rating: data['rating'],
            comment: data['comment'],
            date: data['date']?.toDate() || new Date()
          };
          console.log('Loaded review:', review);
          return review;
        });
        
        console.log(`Loaded ${reviews.length} reviews for product ${productId}`);
        return reviews;
      })
    );
  }

  getReviewsByUser(userId: string): Observable<Review[]> {
    console.log('Fetching reviews for user:', userId);
    
    const reviewsCollection = collection(this.firestore, 'reviews');
    const reviewsQuery = query(
      reviewsCollection,
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    
    return from(getDocs(reviewsQuery)).pipe(
      map(snapshot => {
        const reviews = snapshot.docs.map(doc => {
          const data = doc.data();
          const review: Review = {
            id: doc.id,
            productId: data['productId'],
            userId: data['userId'],
            userName: data['userName'] || 'Névtelen felhasználó',
            rating: data['rating'],
            comment: data['comment'],
            date: data['date']?.toDate() || new Date()
          };
          return review;
        });
        
        console.log(`Loaded ${reviews.length} reviews for user ${userId}`);
        return reviews;
      })
    );
  }

  updateReview(review: Review): Observable<void> {
    const reviewDoc = doc(this.firestore, `reviews/${review.id}`);
    
    return from(updateDoc(reviewDoc, {
      rating: review.rating,
      comment: review.comment,
    })).pipe(
      map(() => void 0)
    );
  }

  deleteReview(reviewId: string): Observable<void> {
    const reviewDoc = doc(this.firestore, `reviews/${reviewId}`);
    
    return from(deleteDoc(reviewDoc)).pipe(
      map(() => void 0)
    );
  }
}
