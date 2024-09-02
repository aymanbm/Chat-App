import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-fd696.firebaseapp.com",
  projectId: "reactchat-fd696",
  storageBucket: "reactchat-fd696.appspot.com",
  messagingSenderId: "678777595347",
  appId: "1:678777595347:web:10dd073841f578e32bfb26"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();