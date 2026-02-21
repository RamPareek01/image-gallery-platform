// website/src/lib/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "image-gallery-platform.firebaseapp.com",
  projectId: "image-gallery-platform",
  storageBucket: "image-gallery-platform.firebasestorage.app",
  messagingSenderId: "533698366061",
  appId: "1:533698366061:web:a624d0669756eab4b3cd64",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();