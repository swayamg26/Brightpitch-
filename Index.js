// index.js

// Import the required Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAawens10WggF4KTK2XtJNq6aTxNG2e2ek",
  authDomain: "bright-pitch-75038.firebaseapp.com",
  projectId: "bright-pitch-75038",
  storageBucket: "bright-pitch-75038.firebasestorage.app",
  messagingSenderId: "621027462883",
  appId: "1:621027462883:web:51f9e09c875a03f233ffd6",
  measurementId: "G-7MS0VXJTQF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export for use in other files
export { app, analytics, auth, db, storage };
