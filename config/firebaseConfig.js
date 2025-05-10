// config/firebase.js
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAofb4dbQAF0vsyzUAKRZT-AXItcCeN9wE",
  authDomain: "ltdnt-2056c.firebaseapp.com",
  projectId: "ltdnt-2056c",
  storageBucket: "ltdnt-2056c.appspot.com", // ✅ đúng domain
  messagingSenderId: "210473608593",
  appId: "1:210473608593:web:c43088df1dbb9e81e1e8f0",
  measurementId: "G-DS1CSVNWS4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { auth, db};
