import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Your web app's Firebase configuration
// Lütfen bu değerleri Firebase console'dan aldığınız gerçek değerlerle değiştirin
// https://console.firebase.google.com/ adresinden projenizi oluşturup, Web uygulaması ekleyin
// Sonra Project Settings > General > Your apps > Firebase SDK snippet > Config seçeneğinden alabilirsiniz
const firebaseConfig = {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_AUTH_DOMAIN',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_STORAGE_BUCKET',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

export { auth }
