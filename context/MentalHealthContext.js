// context/MentalHealthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { healthDataOperations } from '../firebase/healthData';

const MentalHealthContext = createContext();

export const MentalHealthProvider = ({ children }) => {
    const [mentalHealthScore, setMentalHealthScore] = useState(0);
    const [mentalHealthPercentage, setMentalHealthPercentage] = useState(0);
    const [assessmentDate, setAssessmentDate] = useState(null);
    const [mentalHealthStatus, setMentalHealthStatus] = useState('Unknown');
    const [needsNewAssessment, setNeedsNewAssessment] = useState(false);
    const { user, userData } = useAuth();

    // Load saved mental health data on app start or when user/userData changes
    useEffect(() => {
        console.log('MentalHealthContext: User or userData changed');
        
        // If we have user-specific data from Firebase, use that
        if (userData) {
            if (userData.mentalHealthPercentage !== undefined) {
                console.log('Found user-specific mental health percentage in userData:', userData.mentalHealthPercentage);
                setMentalHealthPercentage(userData.mentalHealthPercentage);
            }
            
            if (userData.mentalHealthScore !== undefined) {
                console.log('Found user-specific mental health score in userData:', userData.mentalHealthScore);
                setMentalHealthScore(userData.mentalHealthScore);
            }

            if (userData.mentalHealthStatus !== undefined) {
                console.log('Found user-specific mental health status in userData:', userData.mentalHealthStatus);
                setMentalHealthStatus(userData.mentalHealthStatus);
            }

            if (userData.assessmentDate !== undefined) {
                console.log('Found user-specific assessment date in userData:', userData.assessmentDate);
                setAssessmentDate(userData.assessmentDate);
                checkIfNewAssessmentNeeded(userData.assessmentDate);
            }
            return;
        }

        // Otherwise load from AsyncStorage with user-specific key
        const loadMentalHealth = async () => {
            try {
                // Use user UID as part of the storage key if available
                const storageKeyPrefix = user ? `@mental_health_${user.uid}` : '@mental_health_guest';
                console.log('Attempting to load from AsyncStorage with key prefix:', storageKeyPrefix);
                
                // Load percentage
                const savedPercentage = await AsyncStorage.getItem(`${storageKeyPrefix}_percentage`);
                if (savedPercentage) {
                    const parsedPercentage = parseInt(savedPercentage);
                    console.log('Loaded mental health percentage from AsyncStorage:', parsedPercentage);
                    setMentalHealthPercentage(parsedPercentage);
                } else {
                    console.log('No saved mental health percentage found in AsyncStorage');
                    // Reset to 0 when switching users and no data exists
                    setMentalHealthPercentage(0);
                }
                
                // Load score
                const savedScore = await AsyncStorage.getItem(`${storageKeyPrefix}_score`);
                if (savedScore) {
                    const parsedScore = parseInt(savedScore);
                    console.log('Loaded mental health score from AsyncStorage:', parsedScore);
                    setMentalHealthScore(parsedScore);
                } else {
                    console.log('No saved mental health score found in AsyncStorage');
                    // Reset to 0 when switching users and no data exists
                    setMentalHealthScore(0);
                }

                // Load status
                const savedStatus = await AsyncStorage.getItem(`${storageKeyPrefix}_status`);
                if (savedStatus) {
                    console.log('Loaded mental health status from AsyncStorage:', savedStatus);
                    setMentalHealthStatus(savedStatus);
                } else {
                    console.log('No saved mental health status found in AsyncStorage');
                    // Reset when switching users and no data exists
                    setMentalHealthStatus('Unknown');
                }

                // Load assessment date
                const savedDate = await AsyncStorage.getItem(`${storageKeyPrefix}_date`);
                if (savedDate) {
                    console.log('Loaded assessment date from AsyncStorage:', savedDate);
                    setAssessmentDate(savedDate);
                    checkIfNewAssessmentNeeded(savedDate);
                } else {
                    console.log('No saved assessment date found in AsyncStorage');
                    // Reset when switching users and no data exists
                    setAssessmentDate(null);
                    setNeedsNewAssessment(true);
                }
            } catch (e) {
                console.error('Error loading mental health data:', e);
            }
        };
        loadMentalHealth();
    }, [user, userData]);

    // Check if we need a new daily assessment
    const checkIfNewAssessmentNeeded = (lastAssessmentDate) => {
        if (!lastAssessmentDate) {
            setNeedsNewAssessment(true);
            return;
        }
        
        const lastDate = new Date(lastAssessmentDate);
        const currentDate = new Date();
        
        // Check if the assessment was from a different calendar day
        const isNewDay = lastDate.getDate() !== currentDate.getDate() || 
                        lastDate.getMonth() !== currentDate.getMonth() || 
                        lastDate.getFullYear() !== currentDate.getFullYear();
        
        setNeedsNewAssessment(isNewDay);
    };

    // Save mental health data whenever it changes
    useEffect(() => {
        const saveMentalHealth = async () => {
            try {
                // Skip saving if mental health data is 0 and user is not logged in
                if (mentalHealthPercentage === 0 && mentalHealthScore === 0 && !user) {
                    console.log('Skipping save for guest with 0 mental health data');
                    return;
                }
                
                // Use user UID as part of the storage key if available
                const storageKeyPrefix = user ? `@mental_health_${user.uid}` : '@mental_health_guest';
                
                // Save percentage
                await AsyncStorage.setItem(`${storageKeyPrefix}_percentage`, mentalHealthPercentage.toString());
                console.log('Saved percentage to AsyncStorage:', `${storageKeyPrefix}_percentage`, '=', mentalHealthPercentage);
                
                // Save score
                await AsyncStorage.setItem(`${storageKeyPrefix}_score`, mentalHealthScore.toString());
                console.log('Saved score to AsyncStorage:', `${storageKeyPrefix}_score`, '=', mentalHealthScore);
                
                // Save status
                await AsyncStorage.setItem(`${storageKeyPrefix}_status`, mentalHealthStatus);
                console.log('Saved status to AsyncStorage:', `${storageKeyPrefix}_status`, '=', mentalHealthStatus);
                
                // Save assessment date
                if (assessmentDate) {
                    await AsyncStorage.setItem(`${storageKeyPrefix}_date`, assessmentDate);
                    console.log('Saved date to AsyncStorage:', `${storageKeyPrefix}_date`, '=', assessmentDate);
                }
                
                // If user is logged in, also save to Firebase
                if (user) {
                    try {
                        console.log('Saving mental health data to Firebase for user:', user.uid);
                        
                        // Use updateHealthData to only update mental health fields without affecting other health data
                        const result = await healthDataOperations.updateHealthData(user.uid, {
                            mentalHealthPercentage: mentalHealthPercentage,
                            mentalHealthScore: mentalHealthScore,
                            mentalHealthStatus: mentalHealthStatus,
                            assessmentDate: assessmentDate,
                            lastUpdated: Date.now()
                        });
                        
                        if (result.success) {
                            console.log('Successfully saved mental health data to Firebase');
                        } else {
                            console.error('Failed to save mental health data to Firebase:', result.error);
                        }
                    } catch (error) {
                        console.error('Error saving to Firebase:', error);
                    }
                }
            } catch (e) {
                console.error('Error saving mental health data:', e);
            }
        };
        
        // Only save if there's a real change to save
        if (mentalHealthPercentage !== undefined || mentalHealthScore !== undefined) {
            saveMentalHealth();
        }
    }, [mentalHealthPercentage, mentalHealthScore, mentalHealthStatus, assessmentDate, user]);

    const updateMentalHealthAssessment = (score, totalPossibleScore) => {
        // Calculate percentage (scale to 0-100%)
        const percentage = Math.min(100, Math.round((score / totalPossibleScore) * 100));
        
        // Determine mental health status based on percentage
        let status = 'Excellent';
        if (percentage < 40) {
            status = 'Needs Attention';
        } else if (percentage < 70) {
            status = 'Average';
        } else if (percentage < 85) {
            status = 'Good';
        }
        
        console.log('Updating daily mental health assessment:', 
            'User:', user?.uid || 'Guest', 
            'Score:', score,
            'Percentage:', percentage,
            'Status:', status
        );
        
        setMentalHealthScore(score);
        setMentalHealthPercentage(percentage);
        setMentalHealthStatus(status);
        setAssessmentDate(new Date().toISOString());
        setNeedsNewAssessment(false);
        
        // Return the calculated values for immediate use
        return {
            score,
            percentage,
            status
        };
    };

    const resetMentalHealth = () => {
        setMentalHealthScore(0);
        setMentalHealthPercentage(0);
        setMentalHealthStatus('Unknown');
        setAssessmentDate(null);
        setNeedsNewAssessment(true);
        console.log('Mental health data reset');
    };

    return (
        <MentalHealthContext.Provider
            value={{
                mentalHealthScore,
                mentalHealthPercentage,
                mentalHealthStatus,
                assessmentDate,
                needsNewAssessment,
                updateMentalHealthAssessment,
                resetMentalHealth
            }}
        >
            {children}
        </MentalHealthContext.Provider>
    );
};

export const useMentalHealth = () => useContext(MentalHealthContext); 