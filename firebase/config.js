import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
// Lütfen bu değerleri Firebase console'dan aldığınız gerçek değerlerle değiştirin
// https://console.firebase.google.com/ adresinden projenizi oluşturup, Web uygulaması ekleyin
// Sonra Project Settings > General > Your apps > Firebase SDK snippet > Config seçeneğinden alabilirsiniz
const firebaseConfig = {
    apiKey: "AIzaSyDFjrJjBBtov-PDRg1u0DGcmzLjMdazK6k",
    authDomain: "healthapp-ba6b2.firebaseapp.com",
    databaseURL: "https://healthapp-ba6b2-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "healthapp-ba6b2",
    storageBucket: "healthapp-ba6b2.appspot.com",
    messagingSenderId: "653543625303",
    appId: "1:653543625303:web:60fc809f867eaf7cfac912"
};

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
const database = getDatabase(app);

console.log("Firebase app initialized:", !!app);
console.log("Firebase auth initialized:", !!auth);
console.log("Firebase database initialized:", !!database);

export { auth, database }
