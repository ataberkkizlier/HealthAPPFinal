import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  StatusBar, 
  ScrollView, 
  SafeAreaView,
  Platform
} from 'react-native';
import { useWaterIntake } from '../context/WaterIntakeContext';
import { useAuth } from '../context/AuthContext';
import { ref, set, update } from 'firebase/database';
import { database } from '../firebase/config';
import { COLORS } from '../constants';
import { Ionicons } from '@expo/vector-icons';

export default function WaterIntake({ navigation }) {
  const [intake, setIntake] = useState('');
  const { updateWaterIntake, waterIntake, dailyGoal, percentage } = useWaterIntake();
  const { user, userData, saveHealthData, debugWaterIntake } = useAuth();
  
  // Calculate the remaining water needed to reach the goal
  const remainingWater = Math.max(0, dailyGoal - waterIntake);
  
  // Calculate glasses of water (assuming 250ml per glass)
  const glassSize = 250; // ml
  const glassesDrunk = Math.floor(waterIntake / glassSize);
  const totalGlasses = Math.ceil(dailyGoal / glassSize);
  const glassesRemaining = Math.max(0, totalGlasses - glassesDrunk);

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
    if (!isNaN(intakeValue) && intakeValue > 0) {
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
    } else {
      Alert.alert('Invalid Input', 'Please enter a valid amount of water in ml');
    }
  };

  // Quick add buttons for common amounts
  const quickAdd = (amount) => {
    const newIntake = waterIntake + amount;
    updateWaterIntake(newIntake);
    
    // Save to user's Firebase data if logged in
    if (user) {
      try {
        saveHealthData({
          waterIntake: newIntake,
          lastUpdated: Date.now()
        });
      } catch (error) {
        console.error('Error saving water intake:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Water Intake Tracker</Text>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetWaterIntake}
          >
            <Ionicons name="refresh" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Progress Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.progressHeader}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>Today's Water Intake</Text>
              <View style={styles.progressValues}>
                <Text style={styles.intakeValue}>{waterIntake}</Text>
                <Text style={styles.goalValue}> / {dailyGoal} ml</Text>
              </View>
            </View>
            <View style={styles.circleProgressContainer}>
              <View style={styles.circleProgress}>
                <Text style={styles.percentageText}>{percentage}%</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarTrack}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${Math.min(100, percentage)}%` }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{glassesDrunk}</Text>
              <Text style={styles.statLabel}>Glasses Drunk</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{glassesRemaining}</Text>
              <Text style={styles.statLabel}>Glasses Left</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{remainingWater}</Text>
              <Text style={styles.statLabel}>ml Remaining</Text>
            </View>
          </View>
        </View>
        
        {/* Add Water Section */}
        <View style={styles.addWaterCard}>
          <Text style={styles.sectionTitle}>Add Water</Text>
          
          <View style={styles.quickAddContainer}>
            <TouchableOpacity 
              style={styles.quickAddButton} 
              onPress={() => quickAdd(100)}
            >
              <Text style={styles.quickAddText}>100ml</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickAddButton} 
              onPress={() => quickAdd(250)}
            >
              <Text style={styles.quickAddText}>250ml</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickAddButton} 
              onPress={() => quickAdd(500)}
            >
              <Text style={styles.quickAddText}>500ml</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.customAddLabel}>Custom Amount:</Text>
          <View style={styles.customAddContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter ml"
              keyboardType="numeric"
              value={intake}
              onChangeText={setIntake}
              placeholderTextColor="#9E9E9E"
            />
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={handleAddIntake}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Recommendations */}
        <View style={styles.recommendationsCard}>
          <View style={styles.recommendationHeader}>
            <Ionicons name="water-outline" size={22} color={COLORS.primary} style={styles.recommendationIcon} />
            <Text style={styles.recommendationTitle}>Hydration Tips</Text>
          </View>
          
          <View style={styles.recommendationItem}>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
            <Text style={styles.recommendationText}>Drink 8-10 glasses (2-2.5 liters) of water per day</Text>
          </View>
          
          <View style={styles.recommendationItem}>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
            <Text style={styles.recommendationText}>Carry a water bottle with you throughout the day</Text>
          </View>
          
          <View style={styles.recommendationItem}>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
            <Text style={styles.recommendationText}>Set reminders to drink water every 1-2 hours</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
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
  scrollView: {
    flex: 1,
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
  intakeValue: {
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
  addWaterCard: {
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
    marginBottom: 20,
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
  quickAddText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  customAddLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  customAddContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    marginRight: 10,
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
  recommendationsCard: {
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
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  recommendationIcon: {
    marginRight: 8,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 14,
    color: '#616161',
    marginLeft: 10,
    flex: 1,
  }
});