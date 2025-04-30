import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get } from 'firebase/database';

// Direct Firebase configuration - same as in config.js
const firebaseConfig = {
  apiKey: "AIzaSyDFjrJjBBtov-PDRg1u0DGcmzLjMdazK6k",
  authDomain: "healthapp-ba6b2.firebaseapp.com",
  databaseURL: "https://healthapp-ba6b2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "healthapp-ba6b2",
  storageBucket: "healthapp-ba6b2.appspot.com",
  messagingSenderId: "653543625303",
  appId: "1:653543625303:web:60fc809f867eaf7cfac912"
};

// Test database in isolation
export const runSimpleDatabaseTest = async () => {
  try {
    console.log("Starting simple database test...");
    console.log("Using configuration:", JSON.stringify(firebaseConfig, null, 2));
    
    // Initialize Firebase directly (not using the shared config)
    const app = initializeApp(firebaseConfig, "SIMPLE_TEST_APP");
    console.log("Firebase app initialized:", !!app);
    
    // Get database reference
    const database = getDatabase(app);
    console.log("Database initialized:", !!database);
    console.log("Database URL:", database._repoInfo.databaseURL);
    
    // Try to read the root to check permissions
    console.log("Checking database rules by reading root...");
    try {
      const rootRef = ref(database, '/');
      const rootSnapshot = await get(rootRef);
      console.log("Root read success:", rootSnapshot.exists());
      console.log("Root data:", rootSnapshot.val());
    } catch (readError) {
      console.error("Root read failed - likely a permissions issue:", readError.code, readError.message);
      return {
        success: false,
        message: `Database permissions error: ${readError.message}`,
        suggestion: "Check your Firebase Realtime Database rules in the Firebase console."
      };
    }
    
    // Write test data
    const testPath = "test_data";
    const testData = {
      message: "Test successful",
      timestamp: Date.now()
    };
    
    console.log("Writing test data...");
    const testRef = ref(database, testPath);
    await set(testRef, testData);
    console.log("Test data written successfully");
    
    // Read test data back
    console.log("Reading test data...");
    const snapshot = await get(testRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log("Test data read successfully:", data);
      return {
        success: true,
        message: "Database test successful! Data was written and read correctly.",
        data
      };
    } else {
      console.log("No test data found!");
      return {
        success: false,
        message: "Database write succeeded but read found no data."
      };
    }
  } catch (error) {
    console.error("Simple database test error:", error.code, error.message);
    
    // Provide specific recommendations based on error
    let recommendation = "";
    if (error.code === "auth/api-key-not-valid") {
      recommendation = "Your Firebase API key is not valid. Please check your Firebase console > Project Settings > General tab > Your apps section for the correct Web API Key.";
    } else if (error.code === "app/duplicate-app") {
      recommendation = "There's already a Firebase app initialized with this name. This is usually not a problem.";
    } else if (error.code?.includes("permission-denied")) {
      recommendation = "You don't have permission to access the database. Check your Realtime Database Rules in Firebase Console.";
    }
    
    return {
      success: false,
      message: `Database test failed: ${error.message}`,
      error: {
        code: error.code,
        message: error.message
      },
      recommendation
    };
  }
};

export default runSimpleDatabaseTest; 