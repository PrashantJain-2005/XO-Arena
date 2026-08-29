import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";


const firebaseConfig = {
  apiKey: "AIzaSyD4UKmtsgTl3_Y46coSL_LLhr7ytkuGSDI",
  authDomain: "xo-arena-ce0db.firebaseapp.com",
  projectId: "xo-arena-ce0db",  
  storageBucket: "xo-arena-ce0db.firebasestorage.app",
  messagingSenderId: "1037900636526",
  appId: "1:1037900636526:web:614eefdcfc1cb4f297e17f",
  measurementId: "G-VPNQ69QD1M"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);


export {app, database};