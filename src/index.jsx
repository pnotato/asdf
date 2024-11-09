// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCx643Qb8ZSC9zwOps_cUVrGYvfxCIfaeQ",
  authDomain: "hackthechange2024.firebaseapp.com",
  projectId: "hackthechange2024",
  storageBucket: "hackthechange2024.firebasestorage.app",
  messagingSenderId: "847642885284",
  appId: "1:847642885284:web:b659766d5bf3870d9dfa31",
  measurementId: "G-7MQ2RHQ5F8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const firestore = firebase.firestore();