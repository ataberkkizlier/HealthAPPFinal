import { 
    ref, 
    set, 
    get, 
    update, 
    remove, 
    push,
    query,
    orderByChild,
    equalTo
} from 'firebase/database';
import { database } from './config';

// Create or update data at a specific path
export const writeData = async (path, data) => {
    try {
        const dbRef = ref(database, path);
        await set(dbRef, data);
        return { success: true, message: 'Data written successfully' };
    } catch (error) {
        console.error('Error writing data:', error);
        return { success: false, error: error.message };
    }
};

// Read data from a specific path
export const readData = async (path) => {
    try {
        const dbRef = ref(database, path);
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            return { success: true, data: snapshot.val() };
        } else {
            return { success: false, message: 'No data available' };
        }
    } catch (error) {
        console.error('Error reading data:', error);
        return { success: false, error: error.message };
    }
};

// Update specific fields at a path
export const updateData = async (path, data) => {
    try {
        const dbRef = ref(database, path);
        await update(dbRef, data);
        return { success: true, message: 'Data updated successfully' };
    } catch (error) {
        console.error('Error updating data:', error);
        return { success: false, error: error.message };
    }
};

// Delete data at a specific path
export const deleteData = async (path) => {
    try {
        const dbRef = ref(database, path);
        await remove(dbRef);
        return { success: true, message: 'Data deleted successfully' };
    } catch (error) {
        console.error('Error deleting data:', error);
        return { success: false, error: error.message };
    }
};

// Add new data with auto-generated key
export const pushData = async (path, data) => {
    try {
        const dbRef = ref(database, path);
        const newRef = push(dbRef);
        await set(newRef, data);
        return { success: true, key: newRef.key, message: 'Data pushed successfully' };
    } catch (error) {
        console.error('Error pushing data:', error);
        return { success: false, error: error.message };
    }
};

// Query data with filters
export const queryData = async (path, field, value) => {
    try {
        const dbRef = ref(database, path);
        const q = query(dbRef, orderByChild(field), equalTo(value));
        const snapshot = await get(q);
        if (snapshot.exists()) {
            return { success: true, data: snapshot.val() };
        } else {
            return { success: false, message: 'No data found' };
        }
    } catch (error) {
        console.error('Error querying data:', error);
        return { success: false, error: error.message };
    }
}; 