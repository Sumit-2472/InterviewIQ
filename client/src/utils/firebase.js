
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
console.log("API KEY:", import.meta.env.VITE_FIREBASE_APIKEY);
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewiq-82332.firebaseapp.com",
  projectId: "interviewiq-82332",
  storageBucket: "interviewiq-82332.firebasestorage.app",
  messagingSenderId: "248717141899",
  appId: "1:248717141899:web:54ac39e9a0bd50ce73f18e"
};

const app = initializeApp(firebaseConfig);

const auth=getAuth(app);

const provider=new GoogleAuthProvider()

export {auth,provider} 

