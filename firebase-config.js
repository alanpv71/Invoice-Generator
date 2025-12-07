// type="module"
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBsaAUWc2vZDRw3ES-2DxgEgw8r4YzVYYs",
  authDomain: "invoice-generator-25c10.firebaseapp.com",
  databaseURL: "https://invoice-generator-25c10-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "invoice-generator-25c10",
  storageBucket: "invoice-generator-25c10.appspot.com",
  messagingSenderId: "208288114344",
  appId: "1:208288114344:web:c6eac8ef0ea19112d5c49d",
  measurementId: "G-GJS9DL9YYV"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, push, set };
