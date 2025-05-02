import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient'; // For gradient background
import moment from 'moment'; // For date manipulation
import { useSleep } from '../context/SleepContext';
import { COLORS } from '../constants';
import { Ionicons } from '@expo/vector-icons';

const Sleep = () => {
  const navigation = useNavigation();
  const { 
    sleepHours,
    sleepQualityPercentage, 
    sleepHistory, 
    updateSleepHours, 
    recommendedSleepHours 
  } = useSleep();
  
  // Local state for input field
  const [inputHours, setInputHours] = useState('');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const currentMonth = moment().format('MMMM'); // Get the current month

  // Function to handle saving sleep data
  const handleSaveSleep = () => {
    const hours = parseFloat(inputHours);
    if (!isNaN(hours) && hours > 0) {
      updateSleepHours(hours);
      setInputHours(''); // Clear input field
    } else {
      alert('Please enter a valid number of hours');
    }
  };

  // Group the sleep history by day
  const weeklyHistory = daysOfWeek.reduce((acc, day) => {
    const entry = sleepHistory.find(item => item.day === day);
    acc[day] = entry ? entry.hours : 0;
    return acc;
  }, {});

  // Get quality text description
  const getQualityText = () => {
    if (sleepQualityPercentage >= 100) return 'Excellent';
    if (sleepQualityPercentage >= 75) return 'Good';
    if (sleepQualityPercentage >= 50) return 'Fair';
    return 'Needs improvement';
  };

  // Calculate quality color
  const getQualityColor = () => {
    if (sleepQualityPercentage >= 100) return '#4CAF50'; // Green
    if (sleepQualityPercentage >= 75) return '#8BC34A'; // Light Green
    if (sleepQualityPercentage >= 50) return '#FFC107'; // Amber
    return '#F44336'; // Red
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#3a7bd5', '#00d2ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sleep Tracker</Text>
            <View style={{ width: 24 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Record Your Sleep</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Hours of sleep"
              placeholderTextColor="#9E9E9E"
              keyboardType="numeric"
              value={inputHours}
              onChangeText={setInputHours}
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveSleep}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Sleep</Text>
            <Text style={styles.statValue}>{sleepHours} <Text style={styles.statUnit}>hrs</Text></Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Quality</Text>
            <View style={styles.qualityContainer}>
              <View style={[styles.qualityIndicator, { backgroundColor: getQualityColor() }]}>
                <Text style={styles.qualityPercentage}>{sleepQualityPercentage}%</Text>
              </View>
              <Text style={[styles.qualityText, { color: getQualityColor() }]}>{getQualityText()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>Weekly Sleep History</Text>
          <View style={styles.historyTable}>
            {daysOfWeek.map((day, index) => (
              <View key={index} style={styles.historyRow}>
                <Text style={styles.dayText}>{day}</Text>
                <View style={styles.hourBarContainer}>
                  <View 
                    style={[
                      styles.hourBar, 
                      { 
                        width: `${Math.min(100, (weeklyHistory[day] / recommendedSleepHours) * 100)}%`,
                        backgroundColor: weeklyHistory[day] >= recommendedSleepHours 
                          ? '#4CAF50' 
                          : weeklyHistory[day] >= recommendedSleepHours * 0.75 
                            ? '#8BC34A' 
                            : weeklyHistory[day] >= recommendedSleepHours * 0.5 
                              ? '#FFC107' 
                              : '#F44336'
                      }
                    ]}
                  />
                </View>
                <Text style={styles.hoursText}>{weeklyHistory[day] || 0} hrs</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="information-circle" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.infoTitle}>Sleep Recommendations</Text>
          <Text style={styles.infoText}>
            Adults should aim for {recommendedSleepHours} hours of sleep per night for optimal health.
          </Text>
          <Text style={styles.infoText}>
            Your sleep quality percentage is calculated based on how close you are to the recommended sleep duration.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingTop: 20,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  card: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  inputContainer: {
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
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flex: 0.48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statUnit: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#757575',
  },
  qualityContainer: {
    alignItems: 'center',
  },
  qualityIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  qualityPercentage: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  qualityText: {
    fontSize: 16,
    fontWeight: '600',
  },
  historyCard: {
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
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  historyTable: {
    marginTop: 5,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dayText: {
    width: 100,
    fontSize: 14,
    color: '#616161',
  },
  hourBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#EEEEEE',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 10,
  },
  hourBar: {
    height: '100%',
    borderRadius: 4,
  },
  hoursText: {
    width: 50,
    fontSize: 14,
    color: '#616161',
    textAlign: 'right',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoIconContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#616161',
    textAlign: 'center',
    marginBottom: 5,
    lineHeight: 20,
  },
});

export default Sleep;
