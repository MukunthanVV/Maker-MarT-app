import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB6OAcX5NDhfYsoW3Vn8b3IRHAI7GhQWyE",
  authDomain: "skctmart.firebaseapp.com",
  projectId: "skctmart",
  storageBucket: "skctmart.firebasestorage.app",
  messagingSenderId: "841209598569",
  appId: "1:841209598569:web:9c12191f4d45dae31d08f8",
  measurementId: "G-3ZMX2716MP"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}
