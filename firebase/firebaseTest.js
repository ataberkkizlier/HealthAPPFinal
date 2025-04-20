import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword 
} from 'firebase/auth';

// Direct Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFjrJtBBtoy-PDRgJuDGcmZljMdazK6k",
  authDomain: "healthapp-bab62.firebaseapp.com",
  projectId: "healthapp-bab62",
  storageBucket: "healthapp-bab62.appspot.com",
  messagingSenderId: "653543625303",
  appId: "1:653543625303:web:60fc809f867eaf7cfac912"
};

// Test Firebase initialization
export const testFirebase = async () => {
  try {
    console.log("Testing Firebase initialization...");
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig, "TEST_APP");
    console.log("Firebase app initialized:", !!app);
    
    // Get auth
    const auth = getAuth(app);
    console.log("Firebase auth initialized:", !!auth);
    
    // Try to create a test user
    try {
      console.log("Attempting to create test user...");
      const testEmail = "test" + Date.now() + "@example.com";
      const testPassword = "Test123456!";
      
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        testEmail, 
        testPassword
      );
      
      console.log("Test user created successfully:", userCredential.user.uid);
      return { success: true, message: "Firebase configuration is working!" };
    } catch (authError) {
      console.error("Firebase auth test failed:", authError.code, authError.message);
      return { 
        success: false, 
        message: "Firebase auth test failed: " + authError.message,
        error: authError
      };
    }
  } catch (error) {
    console.error("Firebase test error:", error);
    return { 
      success: false, 
      message: "Firebase test failed: " + error.message,
      error: error
    };
  }
};

// Export for use in the app
export default testFirebase; 