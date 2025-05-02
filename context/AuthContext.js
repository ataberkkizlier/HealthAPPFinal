import React, { createContext, useState, useEffect, useContext } from 'react'
import { auth, database } from '../firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { healthDataOperations } from '../firebase/healthData'
import healthCategories from '../firebase/healthCategories'
import { ref, get } from 'firebase/database'
import { updateUserProfile } from '../firebase/auth'
import * as FileSystem from 'expo-file-system'

// Create Authentication Context
export const AuthContext = createContext()

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [userData, setUserData] = useState(null)
    const [profileImage, setProfileImage] = useState(null)

    // Debug function to check database structure
    const debugUserData = async (uid) => {
        if (!uid) return;
        
        try {
            console.log("============ DEBUGGING USER DATA ============");
            console.log("Current user UID:", uid);
            
            // Check the structure of the database
            const usersRef = ref(database, 'users');
            const snapshot = await get(usersRef);
            
            if (snapshot.exists()) {
                // Log all users in database for debugging
                const users = snapshot.val();
                console.log("All users in database:", Object.keys(users));
                
                // Check each user's water intake
                Object.keys(users).forEach(userId => {
                    const userData = users[userId];
                    if (userData.healthData && userData.healthData.waterIntake !== undefined) {
                        console.log(`User ${userId} water intake:`, userData.healthData.waterIntake);
                    } else {
                        console.log(`User ${userId} has no water intake data`);
                    }
                });
            } else {
                console.log("No users found in database");
            }
            console.log("============================================");
        } catch (error) {
            console.error("Debug error:", error);
        }
    }

    // New debug function specifically for water intake
    const debugWaterIntake = async () => {
        try {
            console.log("============ DEBUGGING WATER INTAKE ============");
            
            // Get all users from database
            const usersRef = ref(database, 'users');
            const snapshot = await get(usersRef);
            
            if (snapshot.exists()) {
                const users = snapshot.val();
                console.log("Found users:", Object.keys(users).length);
                
                // Create a table of user IDs and their water intake values
                console.log("USER ID | EMAIL | WATER INTAKE");
                console.log("--------|-------|-------------");
                
                // For each user, check their water intake
                Object.keys(users).forEach(userId => {
                    const userData = users[userId];
                    const email = userData.email || "unknown";
                    const waterIntake = userData.healthData && userData.healthData.waterIntake !== undefined 
                        ? userData.healthData.waterIntake 
                        : "no data";
                    
                    console.log(`${userId.substring(0, 8)}... | ${email} | ${waterIntake}`);
                });
                
                // Log the current user's water intake
                if (user) {
                    console.log("\nCurrent user:", user.uid);
                    console.log("Current user email:", user.email);
                    console.log("Current user's water intake in context:", userData?.waterIntake || "not set");
                } else {
                    console.log("\nNo user is currently logged in");
                }
            } else {
                console.log("No users found in database");
            }
            console.log("=============================================");
            
            return true;
        } catch (error) {
            console.error("Debug water intake error:", error);
            return false;
        }
    }

    // Handle auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
            if (userAuth) {
                // User is signed in
                console.log("AUTH CHANGE: User signed in:", userAuth.uid, userAuth.email);
                setUser(userAuth)
                try {
                    // Store user info in AsyncStorage
                    await AsyncStorage.setItem('user', JSON.stringify(userAuth))
                    
                    // Fetch user's health data
                    const result = await healthDataOperations.getHealthData(userAuth.uid)
                    console.log("Fetched user health data:", result);
                    if (result.success) {
                        setUserData(result.data)
                    }
                    
                    // Debug the user data
                    debugUserData(userAuth.uid);
                } catch (error) {
                    console.error('Error storing user data:', error)
                }
            } else {
                // User is signed out
                console.log("AUTH CHANGE: User signed out");
                setUser(null)
                setUserData(null)
                try {
                    // Remove user info from AsyncStorage
                    await AsyncStorage.removeItem('user')
                } catch (error) {
                    console.error('Error removing user data:', error)
                }
            }
            setLoading(false)
        })

        // Check if user exists in AsyncStorage on app load
        const loadStoredUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('user')
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser)
                    console.log("LOAD STORED: Found stored user:", parsedUser.uid, parsedUser.email);
                    setUser(parsedUser)
                    
                    // Fetch user's health data
                    const result = await healthDataOperations.getHealthData(parsedUser.uid)
                    console.log("LOAD STORED: Fetched health data:", result);
                    if (result.success) {
                        setUserData(result.data)
                    }
                    
                    // Debug the user data
                    debugUserData(parsedUser.uid);
                }
            } catch (error) {
                console.error('Error loading stored user:', error)
            }
        }

        loadStoredUser()

        // Cleanup subscription on unmount
        return () => unsubscribe()
    }, [])

    // Save user health data
    const saveHealthData = async (data) => {
        if (!user) return { success: false, message: 'No user logged in' }
        
        console.log("SAVE HEALTH DATA: Saving data for user:", user.uid, user.email, data);
        
        try {
            // Always include the user's email in saved data for easier debugging
            const enhancedData = {
                ...data,
                email: user.email,     // Store email for easier debugging
                lastUpdated: Date.now()
            };
            
            const result = await healthDataOperations.saveHealthData(user.uid, enhancedData)
            if (result.success) {
                // Update local state with new data
                setUserData({
                    ...userData,
                    ...data,
                    email: user.email,
                    lastUpdated: Date.now()
                })
                
                // Debug after saving
                debugUserData(user.uid);
            }
            return result
        } catch (error) {
            console.error('Error saving health data:', error)
            return { success: false, error: error.message }
        }
    }

    // Add health record
    const addHealthRecord = async (record) => {
        if (!user) return { success: false, message: 'No user logged in' }
        
        try {
            return await healthDataOperations.addHealthRecord(user.uid, record)
        } catch (error) {
            console.error('Error adding health record:', error)
            return { success: false, error: error.message }
        }
    }

    // Create functions for each health category
    const nutrition = {
        saveNutritionData: async (data) => {
            if (!user) return { success: false, message: 'No user logged in' };
            return await healthCategories.nutrition.saveNutritionData(user.uid, data);
        },
        getNutritionData: async () => {
            if (!user) return { success: false, message: 'No user logged in' };
            return await healthCategories.nutrition.getNutritionData(user.uid);
        },
        addMealRecord: async (data) => {
            if (!user) return { success: false, message: 'No user logged in' };
            return await healthCategories.nutrition.addMealRecord(user.uid, data);
        },
        getMeals: async () => {
            if (!user) return { success: false, message: 'No user logged in' };
            return await healthCategories.nutrition.getMeals(user.uid);
        }
    };
    
    const workout = {
        saveWorkoutData: async (data) => {
            if (!user) return { success: false, message: 'No user logged in' };
            return await healthCategories.workout.saveWorkoutData(user.uid, data);
        },
        getWorkoutData: async () => {
            if (!user) return { success: false, message: 'No user logged in' };
            return await healthCategories.workout.getWorkoutData(user.uid);
        },
        addWorkoutSession: async (data) => {
            if (!user) return { success: false, message: 'No user logged in' };
            return await healthCategories.workout.addWorkoutSession(user.uid, data);
        },
        getWorkoutSessions: async () => {
            if (!user) return { success: false, message: 'No user logged in' };
            return await healthCategories.workout.getWorkoutSessions(user.uid);
        }
    };
    
    const mentalHealth = {
        saveMentalHealthData: async (data) => {
            if (!user) return { success: false, message: 'No user logged in' };
            return await healthCategories.mentalHealth.saveMentalHealthData(user.uid, data);
        },
        getMentalHealthData: async () => {
            if (!user) return { success: false, message: 'No user logged in' };
            return await healthCategories.mentalHealth.getMentalHealthData(user.uid);
        },
        addMoodRecord: async (data) => {
            if (!user) return { success: false, message: 'No user logged in' };
            return await healthCategories.mentalHealth.addMoodRecord(user.uid, data);
        },
        getMoodRecords: async () => {
            if (!user) return { success: false, message: 'No user logged in' };
            return await healthCategories.mentalHealth.getMoodRecords(user.uid);
        }
    };
    
    const sleep = {
        saveSleepData: async (data) => {
            if (!user) return { success: false, message: 'No user logged in' };
            return await healthCategories.sleep.saveSleepData(user.uid, data);
        },
        getSleepData: async () => {
            if (!user) return { success: false, message: 'No user logged in' };
            return await healthCategories.sleep.getSleepData(user.uid);
        },
        addSleepRecord: async (data) => {
            if (!user) return { success: false, message: 'No user logged in' };
            return await healthCategories.sleep.addSleepRecord(user.uid, data);
        },
        getSleepRecords: async () => {
            if (!user) return { success: false, message: 'No user logged in' };
            return await healthCategories.sleep.getSleepRecords(user.uid);
        }
    };
    
    const steps = {
        saveStepsData: async (data) => {
            if (!user) return { success: false, message: 'No user logged in' };
            return await healthCategories.steps.saveStepsData(user.uid, data);
        },
        getStepsData: async () => {
            if (!user) return { success: false, message: 'No user logged in' };
            return await healthCategories.steps.getStepsData(user.uid);
        },
        addDailySteps: async (date, steps) => {
            if (!user) return { success: false, message: 'No user logged in' };
            return await healthCategories.steps.addDailySteps(user.uid, date, steps);
        },
        getDailySteps: async (startDate, endDate) => {
            if (!user) return { success: false, message: 'No user logged in' };
            return await healthCategories.steps.getDailySteps(user.uid, startDate, endDate);
        }
    };
    
    const bloodPressure = {
        saveBloodPressureSettings: async (data) => {
            if (!user) return { success: false, message: 'No user logged in' };
            return await healthCategories.bloodPressure.saveBloodPressureSettings(user.uid, data);
        },
        getBloodPressureSettings: async () => {
            if (!user) return { success: false, message: 'No user logged in' };
            return await healthCategories.bloodPressure.getBloodPressureSettings(user.uid);
        },
        addBloodPressureRecord: async (data) => {
            if (!user) return { success: false, message: 'No user logged in' };
            return await healthCategories.bloodPressure.addBloodPressureRecord(user.uid, data);
        },
        getBloodPressureRecords: async () => {
            if (!user) return { success: false, message: 'No user logged in' };
            return await healthCategories.bloodPressure.getBloodPressureRecords(user.uid);
        }
    };

    // Update user profile with image
    const updateProfileImage = async (imageUri) => {
        try {
            if (!user) return { success: false, message: 'No user logged in' }
            
            console.log("Updating profile image for user:", user.uid, user.email);
            console.log("Image URI:", imageUri);
            
            if (!imageUri) {
                return { 
                    success: false, 
                    error: 'No valid image URI provided'
                };
            }
            
            // Try to get a small thumbnail of the image first to verify it's accessible
            try {
                console.log("Reading image as base64 to verify accessibility...");
                // Just read a small amount to verify it's accessible
                const readResult = await FileSystem.readAsStringAsync(imageUri, {
                    encoding: FileSystem.EncodingType.Base64,
                    length: 1024, // Just read a small sample
                    position: 0
                });
                
                if (!readResult) {
                    console.error("Failed to read image data");
                    return { 
                        success: false, 
                        error: 'Failed to read image data'
                    };
                }
                
                console.log("Successfully read image data sample:", readResult.substring(0, 20) + "...");
            } catch (readError) {
                console.error("Error reading image file:", readError);
                return { 
                    success: false, 
                    error: `Cannot read the image file: ${readError.message}`
                };
            }
            
            // Get current display name or use a better default
            const currentDisplayName = user.displayName || userData?.fullName || 'User';
            
            // First update Firebase Auth profile
            console.log("Updating Firebase Auth profile with name:", currentDisplayName);
            const authResult = await updateUserProfile(currentDisplayName, imageUri);
            if (!authResult.success) {
                console.error("Auth profile update failed:", authResult.error);
                return authResult;
            }
            
            // Then save the image in health data
            console.log("Updating health data with new profile image...");
            const result = await healthDataOperations.updateHealthData(user.uid, {
                profileImage: imageUri,
                lastUpdated: Date.now()
            });
            
            if (result.success) {
                console.log("Successfully updated profile image in database");
                
                // Update local state
                setProfileImage(imageUri);
                setUserData(prevData => ({
                    ...prevData,
                    profileImage: imageUri,
                    lastUpdated: Date.now()
                }));
                
                // Store in AsyncStorage for offline access
                try {
                    console.log("Saving profile image to AsyncStorage...");
                    await AsyncStorage.setItem(`profileImage_${user.uid}`, imageUri);
                    console.log("Successfully saved profile image to AsyncStorage");
                } catch (storageError) {
                    console.error('Error storing profile image in AsyncStorage:', storageError);
                    // This is non-critical, so continue
                }
                
                return { success: true };
            } else {
                console.error("Failed to save profile image in health data:", result.error);
                return result;
            }
        } catch (error) {
            console.error('Error updating profile image:', error);
            return { 
                success: false, 
                error: error.message || 'Unknown error updating profile image'
            };
        }
    }

    // Load profile image if available
    useEffect(() => {
        const loadProfileImage = async () => {
            if (!user) return;
            
            try {
                // First check userData from Firebase
                if (userData?.profileImage) {
                    setProfileImage(userData.profileImage);
                    return;
                }
                
                // If not in userData, check user.photoURL from Firebase Auth
                if (user.photoURL) {
                    setProfileImage(user.photoURL);
                    return;
                }
                
                // Last resort, check AsyncStorage
                const storedImage = await AsyncStorage.getItem(`profileImage_${user.uid}`);
                if (storedImage) {
                    setProfileImage(storedImage);
                }
            } catch (error) {
                console.error('Error loading profile image:', error);
            }
        };
        
        loadProfileImage();
    }, [user, userData]);

    // Auth context value
    const value = {
        user,
        userData,
        loading,
        isAuthenticated: !!user,
        saveHealthData,
        addHealthRecord,
        nutrition,
        workout,
        mentalHealth,
        sleep,
        steps,
        bloodPressure,
        debugUserData,
        debugWaterIntake,
        profileImage,
        updateProfileImage
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

// Custom hook to use Auth Context
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
