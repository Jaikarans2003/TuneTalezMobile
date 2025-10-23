// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB7byiynZrjiqAo8NDIurtBg-MVBolYSjY",
  authDomain: "tune-tales-7bc34.firebaseapp.com",
  projectId: "tune-tales-7bc34",
  storageBucket: "tune-tales-7bc34.appspot.com",
  messagingSenderId: "73380609988",
  appId: "1:73380609988:web:deb202818f8a602f73ee91",
  measurementId: "G-54939GDQH8"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

export { app, db, auth };