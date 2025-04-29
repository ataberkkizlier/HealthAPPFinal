import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert, FlatList, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useWorkout } from '../context/WorkoutContext';
import { useAuth } from '../context/AuthContext';
import { ref, update } from 'firebase/database';
import { database } from '../firebase/config';

// Original exercise list
const exercises = [
  { id: '1', name: 'Push-ups', description: 'Upper body workout', caloriesPerRep: 0.29 },
  { id: '2', name: 'Squats', description: 'Legs & Glutes workout', caloriesPerRep: 0.25 },
  { id: '3', name: 'Plank', description: 'Core strength workout', caloriesPerRep: 0.15 },
  { id: '4', name: 'Jumping Jacks', description: 'Cardio workout', caloriesPerRep: 0.17 },
  { id: '5', name: 'Burpees', description: 'Full body workout', caloriesPerRep: 0.5 },
  { id: '6', name: 'Lunges', description: 'Legs & Glutes workout', caloriesPerRep: 0.2 },
  { id: '7', name: 'Mountain Climbers', description: 'Cardio & Core workout', caloriesPerRep: 0.3 },
  { id: '8', name: 'Bicep Curls', description: 'Arm workout', caloriesPerRep: 0.2 },
  { id: '9', name: 'Tricep Dips', description: 'Arm workout', caloriesPerRep: 0.25 },
  { id: '10', name: 'Deadlifts', description: 'Full body workout', caloriesPerRep: 0.4 },
  { id: '11', name: 'Shoulder Press', description: 'Shoulder workout', caloriesPerRep: 0.3 },
  { id: '12', name: 'Bench Press', description: 'Chest workout', caloriesPerRep: 0.35 },
  { id: '13', name: 'Crunches', description: 'Core workout', caloriesPerRep: 0.1 },
  { id: '14', name: 'Russian Twists', description: 'Core workout', caloriesPerRep: 0.2 },
  { id: '15', name: 'Side Plank', description: 'Core workout', caloriesPerRep: 0.15 },
  { id: '16', name: 'Flutter Kicks', description: 'Core workout', caloriesPerRep: 0.1 },
  { id: '17', name: 'High Knees', description: 'Cardio workout', caloriesPerRep: 0.2 },
  { id: '18', name: 'Side Lunges', description: 'Legs workout', caloriesPerRep: 0.2 },
  { id: '19', name: 'Leg Raises', description: 'Core workout', caloriesPerRep: 0.15 },
  { id: '20', name: 'Calf Raises', description: 'Legs workout', caloriesPerRep: 0.1 },
];

// Target calories for 100% workout completion
const TARGET_CALORIES = 300; // 300 calories = 100% workout

const Workout = () => {
    const navigation = useNavigation();
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [repetitions, setRepetitions] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    
    const { workoutPercentage, caloriesBurned, updateCaloriesBurned, resetWorkout } = useWorkout();
    const { user, saveHealthData } = useAuth();

    // Filter exercises based on search query
    const filteredExercises = exercises.filter(exercise =>
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Reset function to clear workout percentage for testing
    const resetWorkoutPercentage = async () => {
        if (!user) {
            Alert.alert('Not Logged In', 'You need to be logged in to reset data');
            return;
        }

        Alert.alert(
            'Reset Workout Progress',
            'This will reset your workout progress to 0%. Are you sure?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Reset',
                    onPress: async () => {
                        try {
                            // Reset workout data in context
                            resetWorkout();
                            
                            // Use update() to reset workout-related fields in Firebase
                            const healthRef = ref(database, `users/${user.uid}/healthData`);
                            await update(healthRef, {
                                workoutPercentage: 0,
                                caloriesBurned: 0,
                                lastUpdated: Date.now()
                            });
                            
                            // Success message
                            Alert.alert('Reset Complete', 'Your workout progress has been reset to 0%.');
                            
                            console.log('RESET DATA: Workout progress reset for user', user.uid, user.email);
                        } catch (error) {
                            console.error('Error resetting workout progress:', error);
                            Alert.alert('Error', 'Failed to reset workout progress');
                        }
                    }
                }
            ]
        );
    };

    const handleCalculateCalories = () => {
        if (selectedExercise && repetitions) {
            const reps = parseInt(repetitions);
            if (!isNaN(reps) && reps > 0) {
                const newCaloriesBurned = selectedExercise.caloriesPerRep * reps;
                const totalCaloriesBurned = caloriesBurned + newCaloriesBurned;
                
                // Update calories burned in context (also updates percentage)
                updateCaloriesBurned(totalCaloriesBurned);
                
                // Save to Firebase if user is logged in
                if (user) {
                    try {
                        console.log('UPDATING WORKOUT: User:', user.uid, user.email, 'Calories burned:', totalCaloriesBurned);
                        
                        // This is now handled by the context's useEffect, but keeping it for additional safety
                        const percentage = Math.min(100, Math.round((totalCaloriesBurned / TARGET_CALORIES) * 100));
                        saveHealthData({
                            workoutPercentage: percentage,
                            caloriesBurned: totalCaloriesBurned,
                            lastUpdated: Date.now()
                        });
                    } catch (error) {
                        console.error('Error saving workout progress:', error);
                    }
                }
                
                Alert.alert(
                    'Calories Burned',
                    `You burned ${newCaloriesBurned.toFixed(2)} calories with ${reps} ${selectedExercise.name}!\nTotal calories: ${totalCaloriesBurned.toFixed(2)}`
                );
                
                setRepetitions('');
                setSelectedExercise(null);
            } else {
                Alert.alert('Invalid Input', 'Please enter a valid number of repetitions.');
            }
        } else {
            Alert.alert('Missing Information', 'Please select an exercise and enter the number of repetitions.');
        }
    };

    return (
        <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate('Home')}
            >
                <Image source={require('../assets/icons/back.png')} style={styles.backIcon} />
                <Text style={styles.backText}>Home</Text>
            </TouchableOpacity>

            {/* Main Content */}
            <ScrollView style={styles.scrollView}>
                <View style={styles.contentContainer}>
                    <Text style={styles.title}>Workout Tracker</Text>
                    
                    {user ? (
                        <View style={styles.userInfoContainer}>
                            <Text style={styles.userInfo}>Tracking for: {user.email}</Text>
                            <Text style={styles.userInfo}>User ID: {user.uid.substring(0, 8)}...</Text>
                        </View>
                    ) : (
                        <Text style={styles.guestWarning}>Guest Mode - Sign in to save your data</Text>
                    )}
                    
                    {/* Progress Display */}
                    <View style={styles.progressSection}>
                        <Text style={styles.progressTitle}>Your Workout Progress</Text>
                        <Text style={styles.caloriesText}>
                            Total Calories Burned: {caloriesBurned.toFixed(2)} cal
                        </Text>
                        <View style={styles.progressContainer}>
                            <View 
                                style={[
                                    styles.progressBar, 
                                    { width: `${workoutPercentage}%` }
                                ]} 
                            />
                        </View>
                        <Text style={styles.percentageText}>
                            {workoutPercentage}% Complete (Target: {TARGET_CALORIES} cal)
                        </Text>
                        
                        {user && (
                            <TouchableOpacity style={styles.resetButton} onPress={resetWorkoutPercentage}>
                                <Text style={styles.resetButtonText}>Reset Progress</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    
                    {/* Search Bar */}
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search Exercises..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    
                    {/* Exercise Section */}
                    <Text style={styles.sectionTitle}>Available Exercises</Text>
                    
                    {/* Input for Repetitions - Moved to top of exercise list */}
                    {selectedExercise && (
                        <View style={styles.repetitionContainer}>
                            <Text style={styles.selectedExerciseText}>
                                Selected: {selectedExercise.name}
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter repetitions"
                                keyboardType="numeric"
                                value={repetitions}
                                onChangeText={setRepetitions}
                            />
                            <TouchableOpacity 
                                style={styles.calculateButton} 
                                onPress={handleCalculateCalories}
                            >
                                <Text style={styles.calculateButtonText}>
                                    Add Exercise
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    
                    {/* Exercise List */}
                    <FlatList
                        data={filteredExercises}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.exerciseItem,
                                    selectedExercise?.id === item.id && styles.selectedExerciseItem
                                ]}
                                onPress={() => {
                                    setSelectedExercise(item);
                                    setRepetitions('');
                                }}
                            >
                                <Text style={styles.exerciseName}>{item.name}</Text>
                                <Text style={styles.exerciseDescription}>{item.description}</Text>
                                <Text style={styles.exerciseCalories}>
                                    {item.caloriesPerRep.toFixed(2)} cal/rep
                                </Text>
                            </TouchableOpacity>
                        )}
                        style={styles.exerciseList}
                        nestedScrollEnabled={true}
                        scrollEnabled={false}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f8ff',
    },
    scrollView: {
        flex: 1,
        marginTop: 70, // Space for the fixed back button
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 10,
    },
    backIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
    backText: {
        marginLeft: 5,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007bff',
    },
    contentContainer: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    userInfoContainer: {
        marginBottom: 15,
        alignItems: 'center',
    },
    userInfo: {
        fontSize: 16,
        color: '#007bff',
        marginBottom: 5,
    },
    guestWarning: {
        fontSize: 16,
        marginBottom: 15,
        color: '#ff7700',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    progressSection: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    progressTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    caloriesText: {
        fontSize: 16,
        marginBottom: 10,
        color: '#333',
    },
    progressContainer: {
        width: '100%',
        height: 20,
        backgroundColor: '#e0e0e0',
        borderRadius: 10,
        marginVertical: 10,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#2EC4B6', // Workout color from Home screen
    },
    percentageText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    resetButton: {
        backgroundColor: '#ff3b30',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginTop: 10,
        alignSelf: 'center',
    },
    resetButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    searchInput: {
        height: 50,
        borderColor: '#2EC4B6',
        borderWidth: 2,
        borderRadius: 10,
        marginBottom: 20,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    exerciseList: {
        marginBottom: 20,
    },
    exerciseItem: {
        padding: 15,
        backgroundColor: '#fff',
        marginBottom: 10,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#2EC4B6',
    },
    selectedExerciseItem: {
        backgroundColor: '#e6f7f5',
        borderWidth: 1,
        borderColor: '#2EC4B6',
    },
    exerciseName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    exerciseDescription: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    exerciseCalories: {
        fontSize: 14,
        color: '#2EC4B6',
        fontWeight: 'bold',
        marginTop: 5,
    },
    repetitionContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    selectedExerciseText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    input: {
        height: 50,
        borderColor: '#2EC4B6',
        borderWidth: 2,
        borderRadius: 10,
        marginBottom: 10,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    calculateButton: {
        backgroundColor: '#2EC4B6',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    calculateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Workout;
