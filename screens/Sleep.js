import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient'; // For gradient background
import moment from 'moment'; // For date manipulation

const Sleep = () => {
  const navigation = useNavigation();

  // State to manage sleep hours, weekly history, and monthly history
  const [sleepHours, setSleepHours] = useState('');
  const [sleepHistory, setSleepHistory] = useState([]);
  const [monthlyHistory, setMonthlyHistory] = useState([]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const currentMonth = moment().format('MMMM'); // Get the current month

  // Function to handle saving sleep data
  const handleSaveSleep = () => {
    const hours = parseFloat(sleepHours);
    if (!isNaN(hours) && hours > 0) {
      // Find the next day in the week for storing sleep data
      let nextDayIndex = sleepHistory.length % 7; // Calculate next day index (0 for Monday, 6 for Sunday)
      const nextDay = daysOfWeek[nextDayIndex];

      const newSleepEntry = {
        id: Date.now().toString(),
        hours,
        day: nextDay,
      };

      // Add new sleep entry to the weekly history
      const newHistory = [...sleepHistory, newSleepEntry];

      // Reset the weekly data after 7 days and update monthly data
      if (newHistory.length === 7) {
        // Calculate the total sleep for the week
        const totalWeekSleep = newHistory.reduce((total, entry) => total + entry.hours, 0);

        // Update the monthly history with the total sleep for this week
        const newMonthHistory = [...monthlyHistory];
        const currentMonthData = newMonthHistory.find((month) => month.month === currentMonth);

        if (currentMonthData) {
          currentMonthData.totalSleep += totalWeekSleep; // Add to existing month
        } else {
          newMonthHistory.push({
            month: currentMonth,
            totalSleep: totalWeekSleep,
          });
        }

        setMonthlyHistory(newMonthHistory); // Update the monthly history
        setSleepHistory([]); // Reset weekly sleep data
      } else {
        setSleepHistory(newHistory); // Otherwise, just add the new entry
      }

      setSleepHours(''); // Reset input field
    } else {
      alert('Please enter a valid number of hours');
    }
  };

  // Group the sleep history by week days
  const weeklyHistory = sleepHistory.reduce((acc, entry) => {
    const { day, hours } = entry;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(hours);
    return acc;
  }, {});

  return (
    <LinearGradient
      colors={['#66a6ff', '#89f7fe']} // Gradient background colors for a calm look
      style={styles.container}
    >
      <SafeAreaView style={styles.overlay}>
        {/* Screen Title */}
        <Text style={styles.title}>Sleep Tracker</Text>

        {/* Sleep Hours Input */}
        <TextInput
          style={styles.input}
          placeholder="Enter hours of sleep"
          keyboardType="numeric"
          value={sleepHours}
          onChangeText={setSleepHours}
          placeholderTextColor="#fff"
        />

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveSleep}>
          <Text style={styles.saveButtonText}>Save Sleep</Text>
        </TouchableOpacity>

        {/* Total Sleep Hours Display */}
        <Text style={styles.totalSleep}>
          Total Sleep Hours: {sleepHistory.reduce((total, entry) => total + entry.hours, 0)} hrs
        </Text>

        {/* Weekly Sleep History Table */}
        <View style={styles.tableContainer}>
          <Text style={styles.historyTitle}>Weekly Sleep History</Text>
          {daysOfWeek.map((day) => (
            <View key={day} style={styles.tableRow}>
              <Text style={styles.tableCell}>{day}:</Text>
              <Text style={styles.tableCell}>
                {weeklyHistory[day] ? weeklyHistory[day].reduce((a, b) => a + b, 0) : 0} hrs
              </Text>
            </View>
          ))}
        </View>

        {/* Monthly Sleep History Table */}
        <View style={styles.tableContainer}>
          <Text style={styles.historyTitle}>Monthly Sleep History</Text>
          {monthlyHistory.map((month) => (
            <View key={month.month} style={styles.tableRow}>
              <Text style={styles.tableCell}>{month.month}:</Text>
              <Text style={styles.tableCell}>{month.totalSleep} hrs</Text>
            </View>
          ))}
        </View>

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  input: {
    height: 50,
    width: '80%',
    borderColor: '#fff',
    borderWidth: 2,
    borderRadius: 25,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 20,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Light background for the input box
  },
  saveButton: {
    backgroundColor: '#1e90ff',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginBottom: 20,
    elevation: 3, // Slight shadow effect to make it pop
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalSleep: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  tableContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Semi-transparent background for table
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
  },
  tableCell: {
    fontSize: 18,
    color: '#fff',
  },
  backButton: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 40,
    elevation: 3, // Shadow effect
  },
  backButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Sleep;
