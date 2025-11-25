import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBYjq_lz8yJN1JN7jQiAPjubm-qf1hCSY0",
  authDomain: "database-del-layso.firebaseapp.com",
  databaseURL: "https://database-del-layso-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "database-del-layso",
  storageBucket: "database-del-layso.firebasestorage.app",
  messagingSenderId: "307917416298",
  appId: "1:307917416298:web:08e8e4ff35fd2db003e713",
  measurementId: "G-5YD9XDBD99"
};

let db: any = null;

try {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  
  // Initialize Cloud Firestore and get a reference to the service
  db = getFirestore(app);
  
  console.log("Firebase initialized successfully");

} catch (error) {
  console.error("Error initializing Firebase:", error);
}

export { db };
