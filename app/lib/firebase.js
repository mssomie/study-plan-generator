// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDtGSLTZchpjFMV1NWScD6jO_YRffCkpzs",
  authDomain: "athena-8749c.firebaseapp.com",
  projectId: "athena-8749c",
  storageBucket: "athena-8749c.firebasestorage.app",
  messagingSenderId: "812115098338",
  appId: "1:812115098338:web:78dfbad4e9ac37807b3cbb",
  measurementId: "G-1BSG99JC75"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app)

export {db, auth}

// Enable auto-logiun on app load
signInAnonymously(auth)
.then(userCredential => {
    console.log("Guest UID: ", userCredential.user.uid);

}).catch(error => {
    console.error("Anonymous auth failed: ", error);
})