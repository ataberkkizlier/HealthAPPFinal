import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, FlatList } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function BloodPressure({ navigation }) {
  const { user, bloodPressure } = useAuth();
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load records when component mounts
  useEffect(() => {
    loadBloodPressureRecords();
  }, [user]);

  // Load blood pressure records
  const loadBloodPressureRecords = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const result = await bloodPressure.getBloodPressureRecords();
      if (result.success && result.data) {
        // Convert to array and sort by timestamp (newest first)
        const recordsArray = Object.keys(result.data).map(key => ({
          id: key,
          ...result.data[key]
        }));
        
        recordsArray.sort((a, b) => b.timestamp - a.timestamp);
        setRecords(recordsArray);
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error('Error loading blood pressure records:', error);
      Alert.alert('Error', 'Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  // Save a new blood pressure record
  const handleSaveBloodPressure = async () => {
    if (!user) {
      Alert.alert('Not Logged In', 'You need to be logged in to save blood pressure data');
      return;
    }
    
    // Validate inputs
    const sysValue = parseInt(systolic);
    const diaValue = parseInt(diastolic);
    const pulseValue = parseInt(pulse);
    
    if (isNaN(sysValue) || isNaN(diaValue)) {
      Alert.alert('Invalid Input', 'Please enter valid numbers for systolic and diastolic pressure');
      return;
    }
    
    if (sysValue < 50 || sysValue > 250 || diaValue < 30 || diaValue > 150) {
      Alert.alert('Unusual Values', 'Please check your blood pressure values');
      return;
    }
    
    setLoading(true);
    try {
      const bpData = {
        systolic: sysValue,
        diastolic: diaValue,
        pulse: isNaN(pulseValue) ? null : pulseValue,
        notes: '',
        recordDate: new Date().toISOString()
      };
      
      const result = await bloodPressure.addBloodPressureRecord(bpData);
      
      if (result.success) {
        Alert.alert('Success', 'Blood pressure record saved successfully');
        // Clear inputs
        setSystolic('');
        setDiastolic('');
        setPulse('');
        // Reload records
        loadBloodPressureRecords();
      } else {
        Alert.alert('Error', 'Failed to save blood pressure: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving blood pressure:', error);
      Alert.alert('Error', 'An error occurred while saving your blood pressure record');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Determine blood pressure status based on values
  const getBpStatus = (systolic, diastolic) => {
    if (systolic >= 180 || diastolic >= 120) return { label: 'Hypertensive Crisis', color: '#d62828' };
    if (systolic >= 140 || diastolic >= 90) return { label: 'Hypertension Stage 2', color: '#e63946' };
    if (systolic >= 130 || diastolic >= 80) return { label: 'Hypertension Stage 1', color: '#f77f00' };
    if (systolic >= 120 || diastolic >= 80) return { label: 'Elevated', color: '#fcbf49' };
    return { label: 'Normal', color: '#2a9d8f' };
  };

  // Render a single record item
  const renderRecordItem = ({ item }) => {
    const status = getBpStatus(item.systolic, item.diastolic);
    
    return (
      <View style={styles.recordItem}>
        <View style={styles.recordHeader}>
          <Text style={styles.recordDate}>{formatDate(item.timestamp)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Text style={styles.statusText}>{status.label}</Text>
          </View>
        </View>
        
        <View style={styles.recordValues}>
          <View style={styles.valueContainer}>
            <Text style={styles.valueLabel}>Systolic</Text>
            <Text style={styles.valueNumber}>{item.systolic}</Text>
          </View>
          
          <View style={styles.valueSeparator}>
            <Text style={styles.valueSeparatorText}>/</Text>
          </View>
          
          <View style={styles.valueContainer}>
            <Text style={styles.valueLabel}>Diastolic</Text>
            <Text style={styles.valueNumber}>{item.diastolic}</Text>
          </View>
          
          {item.pulse && (
            <View style={styles.pulseContainer}>
              <Text style={styles.valueLabel}>Pulse</Text>
              <Text style={styles.valueNumber}>{item.pulse}</Text>
            </View>
          )}
        </View>
        
        {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Blood Pressure Tracker</Text>
      
      {user ? (
        <Text style={styles.userInfo}>Tracking for: {user.email}</Text>
      ) : (
        <Text style={styles.guestWarning}>Sign in to save your data</Text>
      )}
      
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Systolic</Text>
          <TextInput
            style={styles.input}
            value={systolic}
            onChangeText={setSystolic}
            placeholder="e.g. 120"
            keyboardType="numeric"
          />
        </View>
        
        <Text style={styles.separator}>/</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Diastolic</Text>
          <TextInput
            style={styles.input}
            value={diastolic}
            onChangeText={setDiastolic}
            placeholder="e.g. 80"
            keyboardType="numeric"
          />
        </View>
      </View>
      
      <View style={styles.pulseInputGroup}>
        <Text style={styles.inputLabel}>Pulse (optional)</Text>
        <TextInput
          style={styles.input}
          value={pulse}
          onChangeText={setPulse}
          placeholder="e.g. 72"
          keyboardType="numeric"
        />
      </View>
      
      <TouchableOpacity 
        style={[styles.saveButton, loading && styles.disabledButton]} 
        onPress={handleSaveBloodPressure}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? 'Saving...' : 'Save Blood Pressure'}
        </Text>
      </TouchableOpacity>
      
      <Text style={styles.recordsTitle}>Previous Records</Text>
      
      {records.length === 0 ? (
        <Text style={styles.noRecords}>No blood pressure records yet</Text>
      ) : (
        <FlatList
          data={records}
          renderItem={renderRecordItem}
          keyExtractor={item => item.id}
          style={styles.recordsList}
        />
      )}
      
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  userInfo: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#007bff',
  },
  guestWarning: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#ff7700',
    fontStyle: 'italic',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    flex: 1,
  },
  pulseInputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    backgroundColor: '#fff',
  },
  separator: {
    fontSize: 30,
    marginHorizontal: 10,
    color: '#333',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recordsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  noRecords: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 20,
  },
  recordsList: {
    flex: 1,
    marginBottom: 20,
  },
  recordItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recordDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recordValues: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 5,
  },
  valueContainer: {
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  valueNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  valueSeparator: {
    marginHorizontal: 10,
  },
  valueSeparatorText: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
  },
  pulseContainer: {
    alignItems: 'center',
    marginLeft: 24,
  },
  notes: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  backButton: {
    backgroundColor: '#ccc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
