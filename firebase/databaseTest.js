import { database } from './config';
import { ref, set, get } from 'firebase/database';

// Test database connection and basic operations
export const testDatabase = async () => {
    try {
        console.log("Testing Firebase Database connection...");
        
        // Test write operation
        const testData = {
            test: "Hello Database!",
            timestamp: Date.now()
        };
        
        const testRef = ref(database, 'test/connection');
        await set(testRef, testData);
        console.log("Test data written successfully");
        
        // Test read operation
        const snapshot = await get(testRef);
        if (snapshot.exists()) {
            console.log("Test data read successfully:", snapshot.val());
            return { 
                success: true, 
                message: "Database connection and operations working!" 
            };
        } else {
            return { 
                success: false, 
                message: "Database test failed: No data found" 
            };
        }
    } catch (error) {
        console.error("Database test error:", error);
        return { 
            success: false, 
            message: "Database test failed: " + error.message,
            error: error
        };
    }
};

// Export for use in the app
export default testDatabase; 