import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';

import { routes } from './app.routes';

const firebaseConfig = {
  apiKey: "AIzaSyA1vBtQ87lUbbdP7ClntrgVcoPrvgh5MQw",
  authDomain: "angular-beadando.firebaseapp.com",
  projectId: "angular-beadando",
  storageBucket: "angular-beadando.firebasestorage.app",
  messagingSenderId: "324434040325",
  appId: "1:324434040325:web:dea11423ff245db1be6e6c",
  measurementId: "G-LL9WX2NV3S"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth())
  ]
};
