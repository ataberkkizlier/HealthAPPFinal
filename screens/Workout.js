import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  StatusBar,
  Platform,
  SafeAreaView,
  VirtualizedList
} from 'react-native';
import { useWorkout } from '../context/WorkoutContext';
import { useAuth } from '../context/AuthContext';
import { ref, update } from 'firebase/database';
import { database } from '../firebase/config';
import { COLORS } from '../constants';
import { Ionicons } from '@expo/vector-icons';

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

const Workout = ({ navigation }) => {
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

    // Quick add common workout presets
    const quickAddWorkout = (exerciseId, reps) => {
        const exercise = exercises.find(ex => ex.id === exerciseId);
        if (exercise) {
            const newCaloriesBurned = exercise.caloriesPerRep * reps;
            const totalCaloriesBurned = caloriesBurned + newCaloriesBurned;
            
            // Update calories burned in context
            updateCaloriesBurned(totalCaloriesBurned);
            
            // Save to Firebase if user is logged in
            if (user) {
                try {
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
                'Quick Workout Added',
                `Added ${reps} ${exercise.name}: ${newCaloriesBurned.toFixed(2)} calories`
            );
        }
    };

    const renderExerciseItem = ({ item }) => (
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
            <View style={styles.exerciseItemContent}>
                <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{item.name}</Text>
                    <Text style={styles.exerciseDescription}>{item.description}</Text>
                </View>
                <View style={styles.exerciseCaloriesContainer}>
                    <Text style={styles.exerciseCalories}>
                        {item.caloriesPerRep.toFixed(2)} cal/rep
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const getItemCount = () => filteredExercises.length;
    
    const getItem = (data, index) => filteredExercises[index];

    // Main content for summary and quick add sections
    const renderSummaryContent = () => (
        <>
            {/* Progress Summary */}
            <View style={styles.summaryCard}>
                <View style={styles.progressHeader}>
                    <View style={styles.progressInfo}>
                        <Text style={styles.progressTitle}>Today's Workout</Text>
                        <View style={styles.progressValues}>
                            <Text style={styles.caloriesValue}>{caloriesBurned.toFixed(2)}</Text>
                            <Text style={styles.goalValue}> / {TARGET_CALORIES} calories</Text>
                        </View>
                    </View>
                    <View style={styles.circleProgressContainer}>
                        <View style={styles.circleProgress}>
                            <Text style={styles.percentageText}>{workoutPercentage}%</Text>
                        </View>
                    </View>
                </View>
                
                <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarTrack}>
                        <View 
                            style={[
                                styles.progressBarFill, 
                                { width: `${Math.min(100, workoutPercentage)}%` }
                            ]} 
                        />
                    </View>
                </View>
                
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{caloriesBurned.toFixed(0)}</Text>
                        <Text style={styles.statLabel}>Calories Burned</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{(TARGET_CALORIES - caloriesBurned).toFixed(0)}</Text>
                        <Text style={styles.statLabel}>Calories Left</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{workoutPercentage}%</Text>
                        <Text style={styles.statLabel}>Completed</Text>
                    </View>
                </View>
            </View>
            
            {/* Quick Add Section */}
            <View style={styles.quickAddCard}>
                <Text style={styles.sectionTitle}>Quick Workouts</Text>
                
                <View style={styles.quickAddContainer}>
                    <TouchableOpacity 
                        style={styles.quickAddButton} 
                        onPress={() => quickAddWorkout('1', 10)} // 10 Push-ups
                    >
                        <Text style={styles.quickAddButtonTitle}>Push-ups</Text>
                        <Text style={styles.quickAddButtonReps}>10 Reps</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.quickAddButton} 
                        onPress={() => quickAddWorkout('2', 20)} // 20 Squats
                    >
                        <Text style={styles.quickAddButtonTitle}>Squats</Text>
                        <Text style={styles.quickAddButtonReps}>20 Reps</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.quickAddButton} 
                        onPress={() => quickAddWorkout('5', 5)} // 5 Burpees
                    >
                        <Text style={styles.quickAddButtonTitle}>Burpees</Text>
                        <Text style={styles.quickAddButtonReps}>5 Reps</Text>
                    </TouchableOpacity>
                </View>
            </View>
            
            {/* Custom Exercise Header */}
            <View style={styles.customExerciseCard}>
                <Text style={styles.sectionTitle}>Add Custom Exercise</Text>
                
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#757575" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search exercises..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#9E9E9E"
                    />
                </View>
                
                {/* Input for Repetitions - only shown when exercise is selected */}
                {selectedExercise && (
                    <View style={styles.repetitionContainer}>
                        <Text style={styles.selectedExerciseText}>
                            Selected: {selectedExercise.name}
                        </Text>
                        <View style={styles.repetitionInputRow}>
                            <TextInput
                                style={styles.repetitionInput}
                                placeholder="Enter repetitions"
                                keyboardType="numeric"
                                value={repetitions}
                                onChangeText={setRepetitions}
                                placeholderTextColor="#9E9E9E"
                                autoFocus={true}
                                maxLength={10}
                                returnKeyType="done"
                            />
                            <TouchableOpacity 
                                style={styles.addButton} 
                                onPress={handleCalculateCalories}
                            >
                                <Text style={styles.addButtonText}>Add</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.cancelButton} 
                            onPress={() => setSelectedExercise(null)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel Selection</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </>
    );

    // Workout Tips section (shown after the exercise list)
    const renderTips = () => (
        <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
                <Ionicons name="fitness-outline" size={22} color={COLORS.primary} style={styles.tipsIcon} />
                <Text style={styles.tipsTitle}>Workout Tips</Text>
            </View>
            
            <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                <Text style={styles.tipText}>Warm up for 5-10 minutes before starting your workout</Text>
            </View>
            
            <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                <Text style={styles.tipText}>Stay hydrated by drinking water before, during, and after exercise</Text>
            </View>
            
            <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                <Text style={styles.tipText}>Aim for at least 150 minutes of moderate exercise each week</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.navigate('Home')}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Workout Tracker</Text>
                    <TouchableOpacity 
                        style={styles.resetButton}
                        onPress={resetWorkoutPercentage}
                    >
                        <Ionicons name="refresh" size={22} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
            
            <VirtualizedList
                data={filteredExercises}
                initialNumToRender={4}
                renderItem={renderExerciseItem}
                keyExtractor={item => item.id}
                getItemCount={getItemCount}
                getItem={getItem}
                ListHeaderComponent={renderSummaryContent}
                ListFooterComponent={renderTips}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={21}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        backgroundColor: COLORS.primary,
        paddingTop: Platform.OS === 'ios' ? 0 : 20,
        paddingBottom: 15,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    resetButton: {
        padding: 8,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 30,
    },
    summaryCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    progressInfo: {
        flex: 1,
    },
    progressTitle: {
        fontSize: 16,
        color: '#757575',
        marginBottom: 5,
    },
    progressValues: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    caloriesValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    goalValue: {
        fontSize: 18,
        color: '#757575',
    },
    circleProgressContainer: {
        width: 70,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
    },
    circleProgress: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 5,
        borderColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    percentageText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    progressBarContainer: {
        marginTop: 10,
        marginBottom: 20,
    },
    progressBarTrack: {
        height: 10,
        backgroundColor: '#E0E0E0',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 5,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    statLabel: {
        fontSize: 14,
        color: '#757575',
        marginTop: 5,
    },
    statDivider: {
        width: 1,
        height: '100%',
        backgroundColor: '#E0E0E0',
    },
    quickAddCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15,
    },
    quickAddContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    quickAddButton: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    quickAddButtonTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 5,
    },
    quickAddButtonReps: {
        fontSize: 14,
        color: '#757575',
    },
    customExerciseCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#333',
    },
    repetitionContainer: {
        backgroundColor: '#F5F7FA',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
    },
    selectedExerciseText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 10,
    },
    repetitionInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    repetitionInput: {
        flex: 1,
        height: 50,
        backgroundColor: 'white',
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#333',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    addButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        height: 50,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    exerciseItem: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#E0E0E0',
    },
    selectedExerciseItem: {
        borderLeftColor: COLORS.primary,
        backgroundColor: '#F5F7FA',
    },
    exerciseItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    exerciseInfo: {
        flex: 1,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    exerciseDescription: {
        fontSize: 14,
        color: '#757575',
        marginTop: 3,
    },
    exerciseCaloriesContainer: {
        marginLeft: 10,
        padding: 5,
        backgroundColor: '#F5F7FA',
        borderRadius: 5,
    },
    exerciseCalories: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.primary,
    },
    tipsCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 16,
    },
    tipsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    tipsIcon: {
        marginRight: 8,
    },
    tipsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    tipText: {
        fontSize: 14,
        color: '#616161',
        marginLeft: 10,
        flex: 1,
    },
    cancelButton: {
        marginTop: 15,
        alignItems: 'center',
        padding: 10,
    },
    cancelButtonText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '500',
    },
});

export default Workout;
