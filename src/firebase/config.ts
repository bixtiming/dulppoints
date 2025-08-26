import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCC24QLD79lcFgw9SMuLcUwm-iUJVRjgG0",
  authDomain: "dulp-point-d6ce9.firebaseapp.com",
  projectId: "dulp-point-d6ce9",
  storageBucket: "dulp-point-d6ce9.appspot.com",
  messagingSenderId: "438559440158",
  appId: "1:438559440158:web:163e01666f7a6c3c639d0f",
  measurementId: "G-D4WPGYQ1ST",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;