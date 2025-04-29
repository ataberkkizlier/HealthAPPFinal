import React, { useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useWaterIntake } from '../context/WaterIntakeContext';
import { useAuth } from '../context/AuthContext';
import { ref, set, update } from 'firebase/database';
import { database } from '../firebase/config';

export default function WaterIntake({ navigation }) {
  const [intake, setIntake] = React.useState('');
  const { updateWaterIntake, waterIntake, dailyGoal } = useWaterIntake();
  const { user, userData, saveHealthData, debugWaterIntake } = useAuth();

  // Debug function to help diagnose issues with water intake data
  const debugWaterIntakeData = async () => {
    if (!user) {
      Alert.alert('Not Logged In', 'You need to be logged in to debug data');
      return;
    }

    try {
      const result = await debugWaterIntake();
      if (result) {
        Alert.alert('Debug Info', 'Check console logs for water intake data across users');
      } else {
        Alert.alert('Debug Failed', 'Failed to retrieve debug information');
      }
    } catch (error) {
      console.error('Error in debug function:', error);
      Alert.alert('Debug Error', error.message || 'An unknown error occurred');
    }
  };

  // Reset function to clear water intake and database for testing
  const resetWaterIntake = async () => {
    if (!user) {
      Alert.alert('Not Logged In', 'You need to be logged in to reset data');
      return;
    }

    Alert.alert(
      'Reset Water Intake',
      'This will reset your water intake to 0. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Reset',
          onPress: async () => {
            try {
              // Reset the UI state
              updateWaterIntake(0);
              
              // Use update() instead of set() to only update waterIntake field
              const healthRef = ref(database, `users/${user.uid}/healthData`);
              await update(healthRef, {
                waterIntake: 0,
                lastUpdated: Date.now()
              });
              
              // Success message
              Alert.alert('Reset Complete', 'Your water intake has been reset to 0.');
              
              console.log('RESET DATA: Water intake reset for user', user.uid, user.email);
            } catch (error) {
              console.error('Error resetting water intake:', error);
              Alert.alert('Error', 'Failed to reset water intake');
            }
          }
        }
      ]
    );
  };

  // When the user adds water intake, update both the context and save to user's data
  const handleAddIntake = async () => {
    const intakeValue = parseInt(intake);
    if (!isNaN(intakeValue)) {
      const newIntake = waterIntake + intakeValue;
      
      // Update the water intake in context
      updateWaterIntake(newIntake);
      
      // Also save to user's Firebase data if logged in
      if (user) {
        try {
          console.log('ADDING INTAKE: User:', user.uid, user.email, 'Amount:', intakeValue, 'New Total:', newIntake);
          
          const result = await saveHealthData({
            waterIntake: newIntake,
            lastUpdated: Date.now()
          });
          
          if (!result.success) {
            console.error('Failed to save water intake to user data:', result.error);
          }
        } catch (error) {
          console.error('Error saving water intake:', error);
        }
      } else {
        // If user is not logged in, let them know data is only temporary
        if (intakeValue > 0) {
          Alert.alert(
            'Guest Mode',
            'Sign in to save your water intake data permanently',
            [{ text: 'OK' }]
          );
        }
      }
      
      setIntake('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Water Intake Tracker</Text>
      
      {user ? (
        <View style={styles.userInfoContainer}>
          <Text style={styles.userInfo}>Tracking for: {user.email}</Text>
          <Text style={styles.userInfo}>User ID: {user.uid.substring(0, 8)}...</Text>
        </View>
      ) : (
        <Text style={styles.guestWarning}>Guest Mode - Sign in to save your data</Text>
      )}
      
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
      
      <View style={styles.progressContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${Math.min(100, (waterIntake / dailyGoal) * 100)}%` }
          ]} 
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>
        
        {user && (
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity style={styles.resetButton} onPress={resetWaterIntake}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.debugButton} onPress={debugWaterIntakeData}>
              <Text style={styles.debugButtonText}>Debug</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
  progressContainer: {
    width: '100%',
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginTop: 15,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007bff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 30,
  },
  backButton: {
    backgroundColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginLeft: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  debugButton: {
    backgroundColor: '#5856d6',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginLeft: 10,
    alignItems: 'center',
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});