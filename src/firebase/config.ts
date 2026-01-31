// Import the functions you need from the SDKs you need
import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyD2ogNoY9sP_xFk1sExA0EylsEkxzvh1k8',
  authDomain: 'muni-18091app.firebaseapp.com',
  projectId: 'muni-18091app',
  storageBucket: 'muni-18091app.firebasestorage.app',
  messagingSenderId: '1035235368194',
  appId: '1:1035235368194:web:98656856f934dbfd5cb61b',
  measurementId: 'G-XXXXXXXXXX', // Will be detected if enabled
};

// Verificar que la configuración sea válida
if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId
) {
  throw new Error('Firebase configuration is missing required fields');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics solo en el cliente
export const analytics =
  typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
