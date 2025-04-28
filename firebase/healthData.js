import { database } from './config';
import { ref, set, get, update, remove, push, query, orderByChild, equalTo } from 'firebase/database';

// Debug function to fix Firebase path
const sanitizeUserId = (userId) => {
    if (!userId) {
        console.error("CRITICAL ERROR: Trying to use undefined userId");
        return "unknown_user"; // Fallback to prevent database errors
    }
    
    // Sometimes Firebase UIDs have dots or special characters causing issues
    console.log("Sanitizing userId:", userId);
    return userId.toString().replace(/[.#$\[\]]/g, "_");
};

// User health data operations
export const healthDataOperations = {
    // Save user health data
    saveHealthData: async (userId, data) => {
        try {
            // Ensure userId is valid and sanitized
            const sanitizedUserId = sanitizeUserId(userId);
            console.log(`saveHealthData: Saving data for user: ${sanitizedUserId}`, data);
            
            const healthRef = ref(database, `users/${sanitizedUserId}/healthData`);
            
            // Log what's already in the database at this location
            const existingSnapshot = await get(healthRef);
            if (existingSnapshot.exists()) {
                console.log(`Existing data for user ${sanitizedUserId}:`, existingSnapshot.val());
            } else {
                console.log(`No existing data for user ${sanitizedUserId}`);
            }
            
            // Make sure we have a clean data object
            const cleanData = {
                ...data,
                lastUpdated: Date.now()
            };
            
            // Use set (not update) to replace all data
            await set(healthRef, cleanData);
            
            // Verify the data was saved correctly
            const verifySnapshot = await get(healthRef);
            if (verifySnapshot.exists()) {
                console.log(`Verified data for user ${sanitizedUserId}:`, verifySnapshot.val());
            }
            
            return { success: true, message: 'Health data saved successfully' };
        } catch (error) {
            console.error('Error saving health data:', error);
            return { success: false, error: error.message };
        }
    },

    // Get user health data
    getHealthData: async (userId) => {
        try {
            // Ensure userId is valid and sanitized
            const sanitizedUserId = sanitizeUserId(userId);
            console.log(`getHealthData: Getting data for user: ${sanitizedUserId}`);
            
            const healthRef = ref(database, `users/${sanitizedUserId}/healthData`);
            const snapshot = await get(healthRef);
            
            if (snapshot.exists()) {
                console.log(`Found data for user ${sanitizedUserId}:`, snapshot.val());
                return { success: true, data: snapshot.val() };
            }
            
            console.log(`No data found for user ${sanitizedUserId}`);
            return { success: false, message: 'No health data found' };
        } catch (error) {
            console.error('Error getting health data:', error);
            return { success: false, error: error.message };
        }
    },

    // Update specific health data fields
    updateHealthData: async (userId, data) => {
        try {
            // Ensure userId is valid and sanitized
            const sanitizedUserId = sanitizeUserId(userId);
            console.log(`updateHealthData: Updating data for user: ${sanitizedUserId}`, data);
            
            const healthRef = ref(database, `users/${sanitizedUserId}/healthData`);
            
            // Include the lastUpdated timestamp
            const updateData = {
                ...data,
                lastUpdated: Date.now()
            };
            
            await update(healthRef, updateData);
            
            // Verify the update
            const verifySnapshot = await get(healthRef);
            if (verifySnapshot.exists()) {
                console.log(`Verified updated data for user ${sanitizedUserId}:`, verifySnapshot.val());
            }
            
            return { success: true, message: 'Health data updated successfully' };
        } catch (error) {
            console.error('Error updating health data:', error);
            return { success: false, error: error.message };
        }
    },

    // Add health record
    addHealthRecord: async (userId, record) => {
        try {
            // Ensure userId is valid and sanitized
            const sanitizedUserId = sanitizeUserId(userId);
            console.log(`addHealthRecord: Adding record for user: ${sanitizedUserId}`, record);
            
            const recordsRef = ref(database, `users/${sanitizedUserId}/healthRecords`);
            const newRecordRef = push(recordsRef);
            
            await set(newRecordRef, {
                ...record,
                timestamp: Date.now()
            });
            
            return { success: true, key: newRecordRef.key, message: 'Health record added successfully' };
        } catch (error) {
            console.error('Error adding health record:', error);
            return { success: false, error: error.message };
        }
    },

    // Get health records
    getHealthRecords: async (userId) => {
        try {
            // Ensure userId is valid and sanitized
            const sanitizedUserId = sanitizeUserId(userId);
            console.log(`getHealthRecords: Getting records for user: ${sanitizedUserId}`);
            
            const recordsRef = ref(database, `users/${sanitizedUserId}/healthRecords`);
            const snapshot = await get(recordsRef);
            
            if (snapshot.exists()) {
                return { success: true, data: snapshot.val() };
            }
            
            return { success: false, message: 'No health records found' };
        } catch (error) {
            console.error('Error getting health records:', error);
            return { success: false, error: error.message };
        }
    }
};

export default healthDataOperations; 