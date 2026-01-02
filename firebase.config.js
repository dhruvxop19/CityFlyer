import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBg4AcujbKNc2eirrbmVvsWG0LjwVaLGI8",
  authDomain: "city-flyers-c4bcf.firebaseapp.com",
  projectId: "city-flyers-c4bcf",
  storageBucket: "city-flyers-c4bcf.firebasestorage.app",
  messagingSenderId: "638184082384",
  appId: "1:638184082384:web:df8d1401e944deb23407d5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);

export default app;