import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzfGthFV7EStOy7OQTbvfDHP-WqGZRpBY",
  authDomain: "algolia-sku-status-tool.firebaseapp.com",
  projectId: "algolia-sku-status-tool",
  storageBucket: "algolia-sku-status-tool.firebasestorage.app",
  messagingSenderId: "739679424512",
  appId: "1:739679424512:web:7166285b57e87d79b7c8e5",
  measurementId: "G-ZX09JXNPRT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
