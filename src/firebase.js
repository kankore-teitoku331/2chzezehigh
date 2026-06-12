import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCoE8kyWdO2N4cV4yikT88lEAdirdnTdDU",
  authDomain: "chzezehighschool.firebaseapp.com",
  projectId: "chzezehighschool",
  storageBucket: "chzezehighschool.firebasestorage.app",
  messagingSenderId: "797044594809",
  appId: "1:797044594809:web:16a484c273f66027749ca8"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);