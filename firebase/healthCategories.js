import { database } from './config';
import { ref, set, get, update, push, remove, query, orderByChild, equalTo } from 'firebase/database';

// Debug function to sanitize user IDs
const sanitizeUserId = (userId) => {
    if (!userId) {
        console.error("CRITICAL ERROR: Trying to use undefined userId");
        return "unknown_user"; // Fallback to prevent database errors
    }
    return userId.toString().replace(/[.#$\[\]]/g, "_");
};

// ============ NUTRITION FUNCTIONS ============
export const nutritionOperations = {
    // Save nutrition data
    saveNutritionData: async (userId, data) => {
        try {
            const sanitizedUserId = sanitizeUserId(userId);
            console.log(`saveNutritionData: User ${sanitizedUserId}`, data);
            
            const nutritionRef = ref(database, `users/${sanitizedUserId}/nutrition`);
            await set(nutritionRef, {
                ...data,
                lastUpdated: Date.now()
            });
            
            return { success: true, message: 'Nutrition data saved successfully' };
        } catch (error) {
            console.error('Error saving nutrition data:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Get nutrition data
    getNutritionData: async (userId) => {
        try {
            const sanitizedUserId = sanitizeUserId(userId);
            console.log(`getNutritionData: User ${sanitizedUserId}`);
            
            const nutritionRef = ref(database, `users/${sanitizedUserId}/nutrition`);
            const snapshot = await get(nutritionRef);
            
            if (snapshot.exists()) {
                return { success: true, data: snapshot.val() };
            }
            
            return { success: false, message: 'No nutrition data found' };
        } catch (error) {
            console.error('Error getting nutrition data:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Add meal record
    addMealRecord: async (userId, mealData) => {
        try {
            const sanitizedUserId = sanitizeUserId(userId);
            console.log(`addMealRecord: User ${sanitizedUserId}`, mealData);
            
            const mealsRef = ref(database, `users/${sanitizedUserId}/meals`);
            const newMealRef = push(mealsRef);
            
            await set(newMealRef, {
                ...mealData,
                timestamp: Date.now()
            });
            
            return { 
                success: true, 
                key: newMealRef.key,
                message: 'Meal record added successfully' 
            };
        } catch (error) {
            console.error('Error adding meal record:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Get meal records
    getMeals: async (userId) => {
        try {
            const sanitizedUserId = sanitizeUserId(userId);
            console.log(`getMeals: User ${sanitizedUserId}`);
            
            const mealsRef = ref(database, `users/${sanitizedUserId}/meals`);
            const snapshot = await get(mealsRef);
            
            if (snapshot.exists()) {
                return { success: true, data: snapshot.val() };
            }
            
            return { success: false, message: 'No meal records found' };
        } catch (error) {
            console.error('Error getting meal records:', error);
            return { success: false, error: error.message };
        }
    }
};

// ============ WORKOUT FUNCTIONS ============
export const workoutOperations = {
    // Save workout data
    saveWorkoutData: async (userId, data) => {
        try {
            const sanitizedUserId = sanitizeUserId(userId);
            console.log(`saveWorkoutData: User ${sanitizedUserId}`, data);
            
            const workoutRef = ref(database, `users/${sanitizedUserId}/workout`);
            await set(workoutRef, {
                ...data,
                lastUpdated: Date.now()
            });
            
            return { success: true, message: 'Workout data saved successfully' };
        } catch (error) {
            console.error('Error saving workout data:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Get workout data
    getWorkoutData: async (userId) => {
        try {
            const sanitizedUserId = sanitizeUserId(userId);
            console.log(`getWorkoutData: User ${sanitizedUserId}`);
            
            const workoutRef = ref(database, `users/${sanitizedUserId}/workout`);
            const snapshot = await get(workoutRef);
            
            if (snapshot.exists()) {
                return { success: true, data: snapshot.val() };
            }
            
            return { success: false, message: 'No workout data found' };
        } catch (error) {
            console.error('Error getting workout data:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Add workout session
    addWorkoutSession: async (userId, workoutData) => {
        try {
            const sanitizedUserId = sanitizeUserId(userId);
            console.log(`addWorkoutSession: User ${sanitizedUserId}`, workoutData);
            
            const workoutsRef = ref(database, `users/${sanitizedUserId}/workoutSessions`);
            const newWorkoutRef = push(workoutsRef);
            
            await set(newWorkoutRef, {
                ...workoutData,
                timestamp: Date.now()
            });
            
            return { 
                success: true, 
                key: newWorkoutRef.key,
                message: 'Workout session added successfully' 
            };
        } catch (error) {
            console.error('Error adding workout session:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Get workout sessions
    getWorkoutSessions: async (userId) => {
        try {
            const sanitizedUserId = sanitizeUserId(userId);
            console.log(`getWorkoutSessions: User ${sanitizedUserId}`);
            
            const workoutsRef = ref(database, `users/${sanitizedUserId}/workoutSessions`);
            const snapshot = await get(workoutsRef);
            
            if (snapshot.exists()) {
                return { success: true, data: snapshot.val() };
            }
            
            return { success: false, message: 'No workout sessions found' };
        } catch (error) {
            console.error('Error getting workout sessions:', error);
            return { success: false, error: error.message };
        }
    }
};

// ============ MENTAL HEALTH FUNCTIONS ============
export const mentalHealthOperations = {
    // Save mental health data
    saveMentalHealthData: async (userId, data) => {
        try {
            const sanitizedUserId = sanitizeUserId(userId);
            console.log(`saveMentalHealthData: User ${sanitizedUserId}`, data);
            
            const mentalHealthRef = ref(database, `users/${sanitizedUserId}/mentalHealth`);
            await set(mentalHealthRef, {
                ...data,
                lastUpdated: Date.now()
            });
            
            return { success: true, message: 'Mental health data saved successfully' };
        } catch (error) {
            console.error('Error saving mental health data:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Get mental health data
    getMentalHealthData: async (userId) => {
        try {
            const sanitizedUserId = sanitizeUserId(userId);
            console.log(`getMentalHealthData: User ${sanitizedUserId}`);
            
            const mentalHealthRef = ref(database, `users/${sanitizedUserId}/mentalHealth`);
            const snapshot = await get(mentalHealthRef);
            
            if (snapshot.exists()) {
                return { success: true, data: snapshot.val() };
            }
            
            return { success: false, message: 'No mental health data found' };
        } catch (error) {
            console.error('Error getting mental health data:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Add mood record
    addMoodRecord: async (userId, moodData) => {
        try {
            const sanitizedUserId = sanitizeUserId(userId);
            console.log(`addMoodRecord: User ${sanitizedUserId}`, moodData);
            
            const moodsRef = ref(database, `users/${sanitizedUserId}/moods`);
            const newMoodRef = push(moodsRef);
            
            await set(newMoodRef, {
                ...moodData,
                timestamp: Date.now()
            });
            
            return { 
                success: true, 
                key: newMoodRef.key,
                message: 'Mood record added successfully' 
            };
        } catch (error) {
            console.error('Error adding mood record:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Get mood records
    getMoodRecords: async (userId) => {
        try {
            const sanitizedUserId = sanitizeUserId(userId);
            console.log(`getMoodRecords: User ${sanitizedUserId}`);
            
            const moodsRef = ref(database, `users/${sanitizedUserId}/moods`);
            const snapshot = await get(moodsRef);
            
            if (snapshot.exists()) {
                return { success: true, data: snapshot.val() };
            }
            
            return { success: false, message: 'No mood records found' };
        } catch (error) {
            console.error('Error getting mood records:', error);
            return { success: false, error: error.message };
        }
    }
};

// ============ SLEEP FUNCTIONS ============
export const sleepOperations = {
    // Save sleep data
    saveSleepData: async (userId, data) => {
        try {
            const sanitizedUserId = sanitizeUserId(userId);
            console.log(`saveSleepData: User ${sanitizedUserId}`, data);
            
            const sleepRef = ref(database, `users/${sanitizedUserId}/sleep`);
            await set(sleepRef, {
                ...data,
                lastUpdated: Date.now()
            });
            
            return { success: true, message: 'Sleep data saved successfully' };
        } catch (error) {
            console.error('Error saving sleep data:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Get sleep data
    getSleepData: async (userId) => {
        try {
            const sanitizedUserId = sanitizeUserId(userId);
            console.log(`getSleepData: User ${sanitizedUserId}`);
            
            const sleepRef = ref(database, `users/${sanitizedUserId}/sleep`);
            const snapshot = await get(sleepRef);
            
            if (snapshot.exists()) {
                return { success: true, data: snapshot.val() };
            }
            
            return { success: false, message: 'No sleep data found' };
        } catch (error) {
            console.error('Error getting sleep data:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Add sleep record
    addSleepRecord: async (userId, sleepData) => {
        try {
            const sanitizedUserId = sanitizeUserId(userId);
            console.log(`addSleepRecord: User ${sanitizedUserId}`, sleepData);
            
            const sleepRecordsRef = ref(database, `users/${sanitizedUserId}/sleepRecords`);
            const newSleepRef = push(sleepRecordsRef);
            
            await set(newSleepRef, {
                ...sleepData,
                timestamp: Date.now()
            });
            
            return { 
                success: true, 
                key: newSleepRef.key,
                message: 'Sleep record added successfully' 
            };
        } catch (error) {
            console.error('Error adding sleep record:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Get sleep records
    getSleepRecords: async (userId) => {
        try {
            const sanitizedUserId = sanitizeUserId(userId);
            console.log(`getSleepRecords: User ${sanitizedUserId}`);
            
            const sleepRecordsRef = ref(database, `users/${sanitizedUserId}/sleepRecords`);
            const snapshot = await get(sleepRecordsRef);
            
            if (snapshot.exists()) {
                return { success: true, data: snapshot.val() };
            }
            
            return { success: false, message: 'No sleep records found' };
        } catch (error) {
            console.error('Error getting sleep records:', error);
            return { success: false, error: error.message };
        }
    }
};

// ============ STEPS FUNCTIONS ============
export const stepsOperations = {
    // Save steps data
    saveStepsData: async (userId, data) => {
        try {
            const sanitizedUserId = sanitizeUserId(userId);
            console.log(`saveStepsData: User ${sanitizedUserId}`, data);
            
            const stepsRef = ref(database, `users/${sanitizedUserId}/steps`);
            await set(stepsRef, {
                ...data,
                lastUpdated: Date.now()
            });
            
            return { success: true, message: 'Steps data saved successfully' };
        } catch (error) {
            console.error('Error saving steps data:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Get steps data
    getStepsData: async (userId) => {
        try {
            const sanitizedUserId = sanitizeUserId(userId);
            console.log(`getStepsData: User ${sanitizedUserId}`);
            
            const stepsRef = ref(database, `users/${sanitizedUserId}/steps`);
            const snapshot = await get(stepsRef);
            
            if (snapshot.exists()) {
                return { success: true, data: snapshot.val() };
            }
            
            return { success: false, message: 'No steps data found' };
        } catch (error) {
            console.error('Error getting steps data:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Add daily steps record
    addDailySteps: async (userId, date, steps) => {
        try {
            const sanitizedUserId = sanitizeUserId(userId);
            console.log(`addDailySteps: User ${sanitizedUserId}`, date, steps);
            
            // Convert date to a safe string format (YYYY-MM-DD)
            let dateStr = date;
            if (date instanceof Date) {
                dateStr = date.toISOString().split('T')[0];
            }
            
            const dailyStepsRef = ref(database, `users/${sanitizedUserId}/dailySteps/${dateStr}`);
            await set(dailyStepsRef, {
                steps: steps,
                timestamp: Date.now()
            });
            
            return { 
                success: true,
                message: 'Daily steps added successfully' 
            };
        } catch (error) {
            console.error('Error adding daily steps:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Get daily steps
    getDailySteps: async (userId, startDate, endDate) => {
        try {
            const sanitizedUserId = sanitizeUserId(userId);
            console.log(`getDailySteps: User ${sanitizedUserId}`, startDate, endDate);
            
            const dailyStepsRef = ref(database, `users/${sanitizedUserId}/dailySteps`);
            const snapshot = await get(dailyStepsRef);
            
            if (snapshot.exists()) {
                const allSteps = snapshot.val();
                
                // If date range specified, filter results
                if (startDate && endDate) {
                    const startDateStr = startDate instanceof Date ? 
                        startDate.toISOString().split('T')[0] : startDate;
                    
                    const endDateStr = endDate instanceof Date ? 
                        endDate.toISOString().split('T')[0] : endDate;
                    
                    const filteredSteps = {};
                    Object.keys(allSteps).forEach(date => {
                        if (date >= startDateStr && date <= endDateStr) {
                            filteredSteps[date] = allSteps[date];
                        }
                    });
                    
                    return { success: true, data: filteredSteps };
                }
                
                return { success: true, data: allSteps };
            }
            
            return { success: false, message: 'No daily steps found' };
        } catch (error) {
            console.error('Error getting daily steps:', error);
            return { success: false, error: error.message };
        }
    }
};

// ============ BLOOD PRESSURE FUNCTIONS ============
export const bloodPressureOperations = {
    // Save blood pressure settings
    saveBloodPressureSettings: async (userId, settings) => {
        try {
            const sanitizedUserId = sanitizeUserId(userId);
            console.log(`saveBloodPressureSettings: User ${sanitizedUserId}`, settings);
            
            const bpSettingsRef = ref(database, `users/${sanitizedUserId}/bloodPressureSettings`);
            await set(bpSettingsRef, {
                ...settings,
                lastUpdated: Date.now()
            });
            
            return { success: true, message: 'Blood pressure settings saved successfully' };
        } catch (error) {
            console.error('Error saving blood pressure settings:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Get blood pressure settings
    getBloodPressureSettings: async (userId) => {
        try {
            const sanitizedUserId = sanitizeUserId(userId);
            console.log(`getBloodPressureSettings: User ${sanitizedUserId}`);
            
            const bpSettingsRef = ref(database, `users/${sanitizedUserId}/bloodPressureSettings`);
            const snapshot = await get(bpSettingsRef);
            
            if (snapshot.exists()) {
                return { success: true, data: snapshot.val() };
            }
            
            return { success: false, message: 'No blood pressure settings found' };
        } catch (error) {
            console.error('Error getting blood pressure settings:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Add blood pressure record
    addBloodPressureRecord: async (userId, bpData) => {
        try {
            const sanitizedUserId = sanitizeUserId(userId);
            console.log(`addBloodPressureRecord: User ${sanitizedUserId}`, bpData);
            
            const bpRecordsRef = ref(database, `users/${sanitizedUserId}/bloodPressureRecords`);
            const newBpRef = push(bpRecordsRef);
            
            await set(newBpRef, {
                ...bpData,
                timestamp: Date.now()
            });
            
            return { 
                success: true, 
                key: newBpRef.key,
                message: 'Blood pressure record added successfully' 
            };
        } catch (error) {
            console.error('Error adding blood pressure record:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Get blood pressure records
    getBloodPressureRecords: async (userId) => {
        try {
            const sanitizedUserId = sanitizeUserId(userId);
            console.log(`getBloodPressureRecords: User ${sanitizedUserId}`);
            
            const bpRecordsRef = ref(database, `users/${sanitizedUserId}/bloodPressureRecords`);
            const snapshot = await get(bpRecordsRef);
            
            if (snapshot.exists()) {
                return { success: true, data: snapshot.val() };
            }
            
            return { success: false, message: 'No blood pressure records found' };
        } catch (error) {
            console.error('Error getting blood pressure records:', error);
            return { success: false, error: error.message };
        }
    }
};

// Export all operations as a single object
export const healthCategories = {
    nutrition: nutritionOperations,
    workout: workoutOperations,
    mentalHealth: mentalHealthOperations,
    sleep: sleepOperations,
    steps: stepsOperations,
    bloodPressure: bloodPressureOperations
};

export default healthCategories; 