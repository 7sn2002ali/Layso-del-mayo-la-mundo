
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, push, onValue, off, remove, update } from "firebase/database";
import { StudentSubmission } from "./types";

const firebaseConfig = {
  apiKey: "AIzaSyCN4GK74KOUoPZ4nwIlwXQX9SU8_U1V7Kc",
  authDomain: "abroadify-8a886.firebaseapp.com",
  databaseURL: "https://abroadify-8a886-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "abroadify-8a886",
  storageBucket: "abroadify-8a886.firebasestorage.app",
  messagingSenderId: "235270859236",
  appId: "1:235270859236:web:5bcdb2b835a379a5063ff1",
  measurementId: "G-GFH6QZTLNM"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

export const submitApplication = async (data: StudentSubmission): Promise<void> => {
  try {
    const submissionsRef = ref(db, 'submissions');
    await push(submissionsRef, data);
  } catch (error) {
    console.error("Error submitting form:", error);
    throw error;
  }
};

export const updateSubmission = async (id: string, data: Partial<StudentSubmission>): Promise<void> => {
  try {
    const submissionRef = ref(db, `submissions/${id}`);
    await update(submissionRef, data);
  } catch (error) {
    console.error("Error updating submission:", error);
    throw error;
  }
};

export const deleteSubmission = async (id: string): Promise<void> => {
  try {
    const submissionRef = ref(db, `submissions/${id}`);
    await remove(submissionRef);
  } catch (error) {
    console.error("Error deleting submission:", error);
    throw error;
  }
}

export const batchSaveSubmissions = async (submissions: StudentSubmission[]): Promise<void> => {
  try {
     const submissionsRef = ref(db, 'submissions');
     const promises = submissions.map(sub => push(submissionsRef, sub));
     await Promise.all(promises);
  } catch (error) {
    console.error("Error batch saving:", error);
    throw error;
  }
}

export const subscribeToSubmissions = (callback: (data: StudentSubmission[]) => void) => {
  const submissionsRef = ref(db, 'submissions');
  const listener = onValue(submissionsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const formattedData: StudentSubmission[] = Object.entries(data).map(([key, value]: [string, any]) => ({
        id: key,
        ...value
      }));
      // Sort by timestamp descending
      formattedData.sort((a, b) => b.timestamp - a.timestamp);
      callback(formattedData);
    } else {
      callback([]);
    }
  });
  
  // Return unsubscribe function
  return () => off(submissionsRef, 'value', listener);
};
