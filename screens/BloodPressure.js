import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const BloodPressure = () => {
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [lastSaved, setLastSaved] = useState(null);
  const navigation = useNavigation();

  // Load last saved blood pressure value from AsyncStorage
  useEffect(() => {
    const loadBloodPressure = async () => {
      try {
        const savedData = await AsyncStorage.getItem("bloodPressure");
        if (savedData) {
          setLastSaved(JSON.parse(savedData));
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadBloodPressure();
  }, []);

  // Save blood pressure values
  const saveBloodPressure = async () => {
    if (!systolic || !diastolic) {
      Alert.alert("Error", "Please enter systolic and diastolic values.");
      return;
    }

    const newEntry = {
      systolic,
      diastolic,
      date: new Date().toLocaleString(),
    };

    try {
      await AsyncStorage.setItem("bloodPressure", JSON.stringify(newEntry));
      setLastSaved(newEntry);
      Alert.alert("Success", "Blood pressure saved!");
      setSystolic("");
      setDiastolic("");
    } catch (error) {
      console.error("Error saving data:", error);
      Alert.alert("Error", "Failed to save blood pressure.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Blood Pressure Tracker</Text>

      <TextInput
        style={styles.input}
        placeholder="Systolic (mmHg)"
        keyboardType="numeric"
        value={systolic}
        onChangeText={setSystolic}
      />

      <TextInput
        style={styles.input}
        placeholder="Diastolic (mmHg)"
        keyboardType="numeric"
        value={diastolic}
        onChangeText={setDiastolic}
      />

      <TouchableOpacity style={styles.saveButton} onPress={saveBloodPressure}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>

      {lastSaved && (
        <View style={styles.lastSavedContainer}>
          <Text style={styles.lastSavedText}>Last Saved Value:</Text>
          <Text style={styles.lastSavedValue}>
            {lastSaved.systolic}/{lastSaved.diastolic} mmHg
          </Text>
          <Text style={styles.lastSavedDate}>{lastSaved.date}</Text>
        </View>
      )}

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f4f4",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "80%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  lastSavedContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  lastSavedText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  lastSavedValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007bff",
  },
  lastSavedDate: {
    fontSize: 14,
    color: "#555",
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#007bff",
    borderRadius: 10,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default BloodPressure;
