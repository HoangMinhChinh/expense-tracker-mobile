// config/firebase.js
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAofb4dbQAF0vsyzUAKRZT-AXItcCeN9wE",
  authDomain: "ltdnt-2056c.firebaseapp.com",
  projectId: "ltdnt-2056c",
  storageBucket: "ltdnt-2056c.firebasestorage.app",
  messagingSenderId: "210473680593",
  appId: "1:210473680593:web:c43088f1dbb9e8e11e0ff0",
  measurementId: "G-DS1CSVNWS4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { auth, db};
