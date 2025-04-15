import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useWaterIntake } from '../context/WaterIntakeContext';

export default function WaterIntake({ navigation }) {
  const [intake, setIntake] = React.useState('');
  const { updateWaterIntake, waterIntake, dailyGoal } = useWaterIntake();

  const handleAddIntake = () => {
    const intakeValue = parseInt(intake);
    if (!isNaN(intakeValue)) {
      const newIntake = waterIntake + intakeValue;
      updateWaterIntake(newIntake);
      console.log('Added intake:', intakeValue, 'New total before update:', newIntake, 'Percentage before update:', Math.round((newIntake / dailyGoal) * 100));
      setIntake('');
    }
  };

  // Log the context values after render to confirm update
  console.log('WaterIntake.js render - Current waterIntake:', waterIntake, 'Percentage:', Math.round((waterIntake / dailyGoal) * 100));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Water Intake Tracker</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter amount of water (ml)"
        keyboardType="numeric"
        value={intake}
        onChangeText={setIntake}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddIntake}>
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
      <Text style={styles.result}>
        Total Water Intake: {waterIntake} ml / {dailyGoal} ml
      </Text>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f8ff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#007bff',
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 18,
  },
  addButton: {
    backgroundColor: '#007bff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  result: {
    marginTop: 20,
    fontSize: 22,
    color: '#333',
  },
  backButton: {
    marginTop: 30,
    backgroundColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
});