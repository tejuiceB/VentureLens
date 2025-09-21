
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "studio-7464297256-ea848",
  "appId": "1:500487980857:web:5f56bd737633bac75bcae8",
  "apiKey": "AIzaSyCwq7sAuDcKpbdI8m4FWm-grGRjgz8fssQ",
  "authDomain": "studio-7464297256-ea848.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "500487980857"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);

export { app, db };
