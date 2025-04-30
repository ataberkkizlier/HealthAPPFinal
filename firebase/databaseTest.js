import { database } from './config';
import { ref, set, get } from 'firebase/database';

// Test database connection and basic operations
export const testDatabase = async () => {
    try {
        console.log("Testing Firebase Database connection...");
        console.log("Database instance:", !!database);
        
        // Test write operation at the root level
        const testData = {
            testConnection: {
                message: "Hello Database!",
                timestamp: Date.now()
            }
        };
        
        // Write directly to root
        console.log("Attempting to write to root...");
        const rootRef = ref(database, '/');
        await set(rootRef, testData);
        console.log("Root data written successfully");
        
        // Test read operation
        console.log("Attempting to read data...");
        const snapshot = await get(rootRef);
        if (snapshot.exists()) {
            console.log("Test data read successfully:", snapshot.val());
            return { 
                success: true, 
                message: "Database connection and operations working!",
                data: snapshot.val()
            };
        } else {
            console.log("No data found in database");
            return { 
                success: false, 
                message: "Database test failed: No data found" 
            };
        }
    } catch (error) {
        console.error("Database test error:", error.code, error.message);
        return { 
            success: false, 
            message: "Database test failed: " + error.message,
            error: error
        };
    }
};

// Export for use in the app
export default testDatabase; 