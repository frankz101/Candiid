// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPM0QNiTMAcri98j4DLTuwYevL0L6odCI",
  authDomain: "memories-app-fa831.firebaseapp.com",
  projectId: "memories-app-fa831",
  storageBucket: "memories-app-fa831.appspot.com",
  messagingSenderId: "596697220881",
  appId: "1:596697220881:web:2f34ad97f5cb8397db2eb0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
