import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: REPLACE THIS WITH YOUR FIREBASE CONFIG FROM THE CONSOLE
// Go to Firebase Console -> Project Settings -> General -> Your Apps -> SDK Setup and Config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

let db: any = null;

try {
  // We check if the config is still the placeholder to avoid crashing immediately
  if (firebaseConfig.apiKey !== "YOUR_API_KEY_HERE") {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase initialized successfully");
  } else {
    console.warn("Firebase Config missing. Running in Offline/Demo Mode.");
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

export { db };
