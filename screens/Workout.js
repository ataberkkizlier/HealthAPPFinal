import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

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
  { id: '21', name: 'Wall Sit', description: 'Legs workout', caloriesPerRep: 0.05 },
  { id: '22', name: 'Skaters', description: 'Cardio workout', caloriesPerRep: 0.3 },
  { id: '23', name: 'Inchworms', description: 'Full body workout', caloriesPerRep: 0.25 },
  { id: '24', name: 'Hip Thrusts', description: 'Glutes workout', caloriesPerRep: 0.3 },
  { id: '25', name: 'Pike Push-ups', description: 'Upper body workout', caloriesPerRep: 0.35 },
  { id: '26', name: 'Tuck Jumps', description: 'Cardio workout', caloriesPerRep: 0.4 },
  { id: '27', name: 'Plank Jacks', description: 'Core & Cardio workout', caloriesPerRep: 0.25 },
  { id: '28', name: 'Bear Crawls', description: 'Full body workout', caloriesPerRep: 0.3 },
  { id: '29', name: 'Bodyweight Rows', description: 'Back workout', caloriesPerRep: 0.3 },
  { id: '30', name: 'Zercher Squats', description: 'Legs & Core workout', caloriesPerRep: 0.25 },
];

const Workout = () => {
  const navigation = useNavigation();
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [repetitions, setRepetitions] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter exercises based on search query
  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCalculateCalories = () => {
    if (selectedExercise && repetitions) {
      const caloriesBurned = selectedExercise.caloriesPerRep * repetitions;
      Alert.alert('Calories Burned', `You burned approximately ${caloriesBurned.toFixed(2)} calories!`);
      setRepetitions(''); // Clear input after calculation
      setSelectedExercise(null); // Reset selection
    } else {
      Alert.alert('Error', 'Please select an exercise and enter the number of repetitions.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Screen Title */}
      <Text style={styles.title}>Workout Screen</Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search Exercises..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Exercise List */}
      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.exerciseItem}
            onPress={() => {
              setSelectedExercise(item);
              setRepetitions(''); // Reset repetitions input
            }}
          >
            <Text style={styles.exerciseName}>{item.name}</Text>
            <Text style={styles.exerciseDescription}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Input for Repetitions */}
      {selectedExercise && (
        <View style={styles.repetitionContainer}>
          <Text style={styles.selectedExerciseText}>
            Selected Exercise: {selectedExercise.name}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter repetitions"
            keyboardType="numeric"
            value={repetitions}
            onChangeText={setRepetitions}
          />
          <TouchableOpacity style={styles.calculateButton} onPress={handleCalculateCalories}>
            <Text style={styles.calculateButtonText}>Calculate Calories</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Back Button at the Bottom */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
        <Image source={require('../assets/icons/back.png')} style={styles.backIcon} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f8ff', // Light blue background for a fresh look
    justifyContent: 'space-between', // Ensure space is distributed evenly
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20, // Add some margin to the bottom
  },
  backIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  backText: {
    fontSize: 18,
    color: '#007bff', // Blue color for better visibility
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333', // Darker color for contrast
  },
  searchInput: {
    height: 50,
    borderColor: '#007bff',
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 18,
  },
  exerciseItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderRadius: 8, // Rounded corners for a smoother look
    marginBottom: 10, // Spacing between items
    backgroundColor: '#fff', // White background for items
    elevation: 1, // Shadow effect for a slight 3D look
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  exerciseDescription: {
    fontSize: 16,
    color: '#555',
  },
  repetitionContainer: {
    marginTop: 20,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 1,
  },
  selectedExerciseText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderColor: '#007bff',
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 15,
    fontSize: 18,
  },
  calculateButton: {
    backgroundColor: '#007bff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Workout;
