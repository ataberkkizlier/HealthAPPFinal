import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS } from '../constants';

const HealthDashboard = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [healthData, setHealthData] = useState({
    waterIntake: { value: 0, percentage: 0 },
    nutrition: { value: 0, percentage: 0 },
    workout: { value: 0, percentage: 0 },
    mentalHealth: { value: 0, percentage: 0 },
    sleep: { value: 0, percentage: 0 },
    steps: { value: 0, percentage: 0 },
    bloodPressure: { systolic: 0, diastolic: 0 }
  });

  // Import all health categories
  const waterIntake = require('../firebase/healthData');
  const nutrition = require('../firebase/healthCategories').nutrition;
  const workout = require('../firebase/healthCategories').workout;
  const mentalHealth = require('../firebase/healthCategories').mentalHealth;
  const sleep = require('../firebase/healthCategories').sleep;
  const steps = require('../firebase/healthCategories').steps;
  const bloodPressure = require('../firebase/healthCategories').bloodPressure;

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      
      // Fetch water intake data
      const waterIntakeRecords = await waterIntake.getWaterIntakeRecords();
      const todayWaterIntake = waterIntakeRecords.find(record => 
        new Date(record.date).toDateString() === new Date().toDateString()
      );
      const waterIntakeValue = todayWaterIntake ? todayWaterIntake.amount : 0;
      const waterIntakePercentage = Math.min(Math.round((waterIntakeValue / 2000) * 100), 100);
      
      // Fetch nutrition data
      const nutritionRecords = await nutrition.getNutritionRecords();
      const latestNutrition = nutritionRecords.length > 0 ? nutritionRecords[0] : null;
      const nutritionValue = latestNutrition ? latestNutrition.calories : 0;
      const nutritionPercentage = Math.min(Math.round((nutritionValue / 2000) * 100), 100);
      
      // Fetch workout data
      const workoutRecords = await workout.getWorkoutRecords();
      const latestWorkout = workoutRecords.length > 0 ? workoutRecords[0] : null;
      const workoutValue = latestWorkout ? latestWorkout.duration : 0;
      const workoutPercentage = Math.min(Math.round((workoutValue / 60) * 100), 100);
      
      // Fetch mental health data
      const mentalHealthRecords = await mentalHealth.getMentalHealthRecords();
      const latestMentalHealth = mentalHealthRecords.length > 0 ? mentalHealthRecords[0] : null;
      const mentalHealthValue = latestMentalHealth ? latestMentalHealth.moodRating : 0;
      const mentalHealthPercentage = Math.min(Math.round((mentalHealthValue / 10) * 100), 100);
      
      // Fetch sleep data
      const sleepRecords = await sleep.getSleepRecords();
      const latestSleep = sleepRecords.length > 0 ? sleepRecords[0] : null;
      const sleepValue = latestSleep ? latestSleep.duration : 0;
      const sleepPercentage = Math.min(Math.round((sleepValue / 8) * 100), 100);
      
      // Fetch steps data
      const stepsRecords = await steps.getStepsRecords();
      const latestSteps = stepsRecords.length > 0 ? stepsRecords[0] : null;
      const stepsValue = latestSteps ? latestSteps.count : 0;
      const stepsPercentage = Math.min(Math.round((stepsValue / 10000) * 100), 100);
      
      // Fetch blood pressure data
      const bloodPressureRecords = await bloodPressure.getBloodPressureRecords();
      const latestBloodPressure = bloodPressureRecords.length > 0 ? bloodPressureRecords[0] : null;
      const systolic = latestBloodPressure ? latestBloodPressure.systolic : 0;
      const diastolic = latestBloodPressure ? latestBloodPressure.diastolic : 0;
      
      setHealthData({
        waterIntake: { value: waterIntakeValue, percentage: waterIntakePercentage },
        nutrition: { value: nutritionValue, percentage: nutritionPercentage },
        workout: { value: workoutValue, percentage: workoutPercentage },
        mentalHealth: { value: mentalHealthValue, percentage: mentalHealthPercentage },
        sleep: { value: sleepValue, percentage: sleepPercentage },
        steps: { value: stepsValue, percentage: stepsPercentage },
        bloodPressure: { systolic, diastolic }
      });
    } catch (error) {
      console.error('Error fetching health data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHealthData();
    }
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHealthData();
  };

  const navigateToCategory = (category) => {
    switch(category) {
      case 'waterIntake':
        navigation.navigate('WaterIntake');
        break;
      case 'nutrition':
        navigation.navigate('Nutrition');
        break;
      case 'workout':
        navigation.navigate('Workout');
        break;
      case 'mentalHealth':
        navigation.navigate('MentalHealth');
        break;
      case 'sleep':
        navigation.navigate('Sleep');
        break;
      case 'steps':
        navigation.navigate('Steps');
        break;
      case 'bloodPressure':
        navigation.navigate('BloodPressure');
        break;
      default:
        break;
    }
  };

  const renderMetricCard = (title, value, unit, percentage, icon, category, color) => {
    return (
      <TouchableOpacity 
        style={[styles.card, { borderLeftColor: color }]} 
        onPress={() => navigateToCategory(category)}
      >
        <View style={styles.cardContent}>
          <View>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardValue}>
              {value} <Text style={styles.cardUnit}>{unit}</Text>
            </Text>
          </View>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={24} color={color} />
          </View>
        </View>
        {percentage !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: color }]} />
            </View>
            <Text style={styles.progressText}>{percentage}%</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderBloodPressureCard = () => {
    return (
      <TouchableOpacity 
        style={[styles.card, { borderLeftColor: COLORS.danger }]} 
        onPress={() => navigateToCategory('bloodPressure')}
      >
        <View style={styles.cardContent}>
          <View>
            <Text style={styles.cardTitle}>Blood Pressure</Text>
            <Text style={styles.cardValue}>
              {healthData.bloodPressure.systolic}/{healthData.bloodPressure.diastolic} <Text style={styles.cardUnit}>mmHg</Text>
            </Text>
          </View>
          <View style={styles.iconContainer}>
            <Ionicons name="heart" size={24} color={COLORS.danger} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading health data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Health Dashboard</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.cardsContainer}>
          {renderMetricCard('Water Intake', healthData.waterIntake.value, 'ml', healthData.waterIntake.percentage, 'water', 'waterIntake', COLORS.primary)}
          {renderMetricCard('Nutrition', healthData.nutrition.value, 'cal', healthData.nutrition.percentage, 'restaurant', 'nutrition', COLORS.green)}
          {renderMetricCard('Workout', healthData.workout.value, 'min', healthData.workout.percentage, 'fitness', 'workout', COLORS.orange)}
          {renderMetricCard('Mental Health', healthData.mentalHealth.value, '/10', healthData.mentalHealth.percentage, 'happy', 'mentalHealth', COLORS.purple)}
          {renderMetricCard('Sleep', healthData.sleep.value, 'hrs', healthData.sleep.percentage, 'moon', 'sleep', COLORS.darkBlue)}
          {renderMetricCard('Steps', healthData.steps.value, '', healthData.steps.percentage, 'footsteps', 'steps', COLORS.brown)}
          {renderBloodPressureCard()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.darkGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  refreshButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  cardsContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    borderLeftWidth: 4,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  cardUnit: {
    fontSize: 14,
    color: COLORS.gray,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  progressContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginRight: 8,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.gray,
    width: 40,
    textAlign: 'right',
  },
});

export default HealthDashboard; 