import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCNe3u-i-WfgSDAJJRHESWljxjzI7yrY5g",
  authDomain: "stakke-1aa99.firebaseapp.com",
  projectId: "stakke-1aa99",
  storageBucket: "stakke-1aa99.appspot.com",
  messagingSenderId: "61261937260",
  appId: "1:61261937260:web:f9ed5c9a37c6f325343649",
  measurementId: "G-62GWXX5JR2"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
