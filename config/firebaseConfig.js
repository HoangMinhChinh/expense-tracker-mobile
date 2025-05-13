import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAofb4dbQAF0vsyzUAKRZT-AXItcCeN9wE",
  authDomain: "ltdnt-2056c.firebaseapp.com",
  databaseURL: "https://ltdnt-2056c-default-rtdb.asia-southeast1.firebasedatabase.app", // ✅ thêm dòng này
  projectId: "ltdnt-2056c",
  storageBucket: "ltdnt-2056c.appspot.com",
  messagingSenderId: "210473680593",
  appId: "1:210473680593:web:c43088f1dbb9e8e11e0ff0",
  measurementId: "G-DS1CSVNWS4"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getDatabase(app); // ✅ dùng realtime database thay vì firestore

export { auth, db, app };
