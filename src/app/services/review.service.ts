import { Injectable } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { Review } from '../models/review.model';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc,  
  addDoc, 
  deleteDoc, 
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private reviewsCollection;

  constructor(private firestore: Firestore) {
    this.reviewsCollection = collection(this.firestore, 'reviews');
  }

  // CREATE
  addReview(review: Review): Observable<Review> {
    const newReview = { 
      ...review,
      date: new Date() 
    };
    
    return from(addDoc(this.reviewsCollection, newReview)).pipe(
      map(docRef => {
        return {
          ...newReview,
          id: docRef.id
        } as unknown as Review;
      })
    );
  }

  // READ
  getReviewsByProduct(productId: number): Observable<Review[]> {
    const q = query(
      this.reviewsCollection,
      where('productId', '==', productId),
      orderBy('date', 'desc')
    );
    
    return collectionData(q) as Observable<Review[]>;
  }

  // UPDATE
  updateReview(reviewId: string, review: Partial<Review>): Observable<void> {
    const reviewDoc = doc(this.firestore, `reviews/${reviewId}`);
    return from(updateDoc(reviewDoc, { ...review }));
  }

  // DELETE
  deleteReview(reviewId: string): Observable<void> {
    const reviewDoc = doc(this.firestore, `reviews/${reviewId}`);
    return from(deleteDoc(reviewDoc));
  }

  // COMPLEX QUERY: Get top rated products based on reviews
  getTopRatedProducts(limit: number = 5): Observable<{productId: number, averageRating: number}[]> {
    // This requires a more complex query that can be implemented with:
    // 1. Get all reviews
    // 2. Group them by productId
    // 3. Calculate average rating for each product
    // 4. Sort by average rating
    // 5. Take the top N
    
    return from(getDocs(this.reviewsCollection)).pipe(
      map(snapshot => {
        const reviews: Review[] = [];
        snapshot.forEach(doc => {
          reviews.push({ id: doc.id, ...doc.data() } as unknown as Review);
        });
        
        // Group reviews by product
        const productReviews = reviews.reduce((acc, review) => {
          if (!acc[review.productId]) {
            acc[review.productId] = [];
          }
          acc[review.productId].push(review);
          return acc;
        }, {} as { [key: number]: Review[] });
        
        // Calculate average ratings
        const productRatings = Object.keys(productReviews).map(productId => {
          const productReviewsList = productReviews[Number(productId)];
          const totalRating = productReviewsList.reduce((sum, review) => sum + review.rating, 0);
          const averageRating = totalRating / productReviewsList.length;
          
          return {
            productId: Number(productId),
            averageRating
          };
        });
        
        // Sort by rating and limit
        return productRatings
          .sort((a, b) => b.averageRating - a.averageRating)
          .slice(0, limit);
      })
    );
  }
}
