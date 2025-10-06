// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA2EnjUNfKVXoYppIlLXdrik9_cGw_sXIA",
  authDomain: "hackovation-prototype.firebaseapp.com",
  projectId: "hackovation-prototype",
  storageBucket: "hackovation-prototype.firebasestorage.app",
  messagingSenderId: "425418675128",
  appId: "1:425418675128:web:03803a83a2c821e475b54d"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
