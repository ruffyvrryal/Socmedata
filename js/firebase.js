// =====================================
// SOCMEDATA FIREBASE CONFIGURATION
// =====================================

// Firebase App
import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

// Firestore
import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Firebase Authentication
import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// =====================================
// FIREBASE CONFIGURATION
// =====================================

const firebaseConfig = {
    apiKey: "AIzaSyCutj7vXu9mW210FGxPO8_z_kn0B-5hSRQ",
    authDomain: "socmedata-bbe9f.firebaseapp.com",
    projectId: "socmedata-bbe9f",
    storageBucket: "socmedata-bbe9f.firebasestorage.app",
    messagingSenderId: "441937796314",
    appId: "1:441937796314:web:4f321930d30fa32d8719e3",
    measurementId: "G-9LJLVXJW9S"
};


// =====================================
// INITIALIZE FIREBASE
// =====================================

const app =
    initializeApp(
        firebaseConfig
    );

console.log(
    "Firebase initialized successfully."
);


// =====================================
// INITIALIZE FIRESTORE
// =====================================

const db =
    getFirestore(
        app
    );

console.log(
    "Firestore initialized successfully.",
    db
);


// =====================================
// INITIALIZE FIREBASE AUTHENTICATION
// =====================================

const auth =
    getAuth(
        app
    );

console.log(
    "Firebase Authentication initialized successfully."
);


// =====================================
// EXPORT FIREBASE SERVICES
// =====================================

export {
    app,
    db,
    auth
};