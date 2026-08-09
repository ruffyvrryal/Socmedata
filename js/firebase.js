// =====================================
// SOCMEDATA FIREBASE
// =====================================

// Firebase SDK
import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import { getFirestore } from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// =====================================
// FIREBASE CONFIGURATION
// =====================================

const firebaseConfig = {

    apiKey:
        "AIzaSyCutj7vXu9mW210FGxPO8_z_kn0B-5hSRQ",

    authDomain:
        "socmedata-bbe9f.firebaseapp.com",

    projectId:
        "socmedata-bbe9f",

    storageBucket:
        "socmedata-bbe9f.firebasestorage.app",

    messagingSenderId:
        "441937796314",

    appId:
        "1:441937796314:web:4f321930d30fa32d8719e3",

    measurementId:
        "G-9LJLVXJW9S"

};


// =====================================
// INITIALIZE FIREBASE
// =====================================

const app =
    initializeApp(
        firebaseConfig
    );


// =====================================
// INITIALIZE FIRESTORE
// =====================================

export const db =
    getFirestore(
        app
    );


// =====================================
// INITIALIZATION CONFIRMATION
// =====================================

console.log(
    "Firebase initialized successfully."
);

console.log(
    "Firestore initialized successfully.",
    db
);