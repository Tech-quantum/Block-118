import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDwojnNPEpQKADXEXLNI4avDdtDlu9s5qw",
  authDomain: "block-118-f2918.firebaseapp.com",
  projectId: "block-118-f2918",
  storageBucket: "block-118-f2918.firebasestorage.app",
  messagingSenderId: "334717614788",
  appId: "1:334717614788:web:3ac340ab0c1ab098392791",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
