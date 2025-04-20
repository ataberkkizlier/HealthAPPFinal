import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getApps, initializeApp as initializeFirebaseApp } from 'firebase/app';

// Your web app's Firebase configuration
// Lütfen bu değerleri Firebase console'dan aldığınız gerçek değerlerle değiştirin
// https://console.firebase.google.com/ adresinden projenizi oluşturup, Web uygulaması ekleyin
// Sonra Project Settings > General > Your apps > Firebase SDK snippet > Config seçeneğinden alabilirsiniz
const firebaseConfig = {
    apiKey: "AIzaSyDFjrJjBBtov-PDRg1u0DGcmzLjMdazK6k",
    authDomain: "healthapp-ba6b2.firebaseapp.com",
    projectId: "healthapp-ba6b2",
    storageBucket: "healthapp-ba6b2.firebasestorage.app",
    messagingSenderId: "653543625303",
    appId: "1:653543625303:web:60fc809f867eaf7cfac912"
  };

// Debugging Firebase initialization
console.log("Initializing Firebase with config:", JSON.stringify(firebaseConfig));

// Check if Firebase is already initialized
let app;
try {
    const apps = getApps();
    if (apps.length === 0) {
        console.log("No existing Firebase app, initializing now");
        app = initializeApp(firebaseConfig);
    } else {
        console.log("Firebase app already exists, using existing app");
        app = apps[0];
    }
} catch (error) {
    console.error("Error initializing Firebase:", error);
    app = initializeApp(firebaseConfig);
}

const auth = getAuth(app)

console.log("Firebase app initialized:", !!app);
console.log("Firebase auth initialized:", !!auth);

export { auth }
