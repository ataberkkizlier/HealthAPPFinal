import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  Alert,
  ScrollView,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useNutrition } from '../context/NutritionContext';
import { useAuth } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';

const foods = [
  { id: '1', name: 'Apple', calories: 95, unit: 'medium' },
  { id: '2', name: 'Banana', calories: 105, unit: 'medium' },
  { id: '3', name: 'Orange', calories: 62, unit: 'medium' },
  { id: '4', name: 'Strawberries', calories: 33, unit: 'cup' },
  { id: '5', name: 'Grapes', calories: 104, unit: 'cup' },
  { id: '6', name: 'Watermelon', calories: 30, unit: 'slice' },
  { id: '7', name: 'Blueberries', calories: 84, unit: 'cup' },
  { id: '8', name: 'Pineapple', calories: 82, unit: 'cup' },
  { id: '9', name: 'Peach', calories: 58, unit: 'medium' },
  { id: '10', name: 'Mango', calories: 150, unit: 'cup' },
  { id: '11', name: 'Chicken Breast', calories: 165, unit: '100g' },
  { id: '12', name: 'Beef', calories: 250, unit: '100g' },
  { id: '13', name: 'Salmon', calories: 206, unit: '100g' },
  { id: '14', name: 'Eggs', calories: 155, unit: 'large' },
  { id: '15', name: 'Milk', calories: 103, unit: 'cup' },
  { id: '16', name: 'Yogurt', calories: 59, unit: '100g' },
  { id: '17', name: 'Almonds', calories: 164, unit: '1/4 cup' },
  { id: '18', name: 'Walnuts', calories: 185, unit: '1/4 cup' },
  { id: '19', name: 'Rice', calories: 206, unit: 'cup' },
  { id: '20', name: 'Pasta', calories: 221, unit: 'cup' },
  { id: '21', name: 'Broccoli', calories: 55, unit: 'cup' },
  { id: '22', name: 'Carrots', calories: 41, unit: 'cup' },
  { id: '23', name: 'Spinach', calories: 23, unit: 'cup' },
  { id: '24', name: 'Potatoes', calories: 161, unit: 'medium' },
  { id: '25', name: 'Cheese', calories: 113, unit: 'slice' },
  { id: '26', name: 'Chips', calories: 152, unit: 'small bag' },
  { id: '27', name: 'Pizza', calories: 285, unit: 'slice' },
  { id: '28', name: 'Chocolate', calories: 546, unit: '100g' },
  { id: '29', name: 'Ice Cream', calories: 207, unit: '1/2 cup' },
  { id: '30', name: 'Cookies', calories: 80, unit: 'piece' }
];

const Nutrition = () => {
  const navigation = useNavigation();
  const { user, userData } = useAuth();
  const { nutritionPercentage, updateNutritionPercentage, caloriesConsumed, updateCaloriesConsumed, resetNutrition } = useNutrition();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [modalVisible, setModalVisible] = useState(false);

  const filteredFoods = foods.filter(food => 
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReset = () => {
    Alert.alert(
      "Reset Nutrition Progress",
      "Are you sure you want to reset your nutrition progress?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Reset", 
          onPress: () => {
            resetNutrition();
            Alert.alert("Success", "Your nutrition progress has been reset.");
          }
        }
      ]
    );
  };

  const handleAddFood = () => {
    if (!selectedFood) return;
    
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert("Invalid Quantity", "Please enter a valid quantity.");
      return;
    }

    const totalCalories = selectedFood.calories * qty;
    updateCaloriesConsumed(caloriesConsumed + totalCalories);
    
    setModalVisible(false);
    setSelectedFood(null);
    setQuantity('1');
    
    Alert.alert(
      "Food Added",
      `Added ${qty} ${selectedFood.unit}(s) of ${selectedFood.name} (${totalCalories} calories)`
    );
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Ionicons name="arrow-back" size={24} color="#007bff" />
        <Text style={styles.backText}>Home</Text>
      </TouchableOpacity>

      {/* Main Content */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Nutrition Tracker</Text>
          
          {user ? (
            <View style={styles.userInfoContainer}>
              <Text style={styles.userInfo}>Tracking for: {user.email}</Text>
              <Text style={styles.userInfo}>User ID: {user.uid.substring(0, 8)}...</Text>
            </View>
          ) : (
            <Text style={styles.guestWarning}>Guest Mode - Sign in to save your data</Text>
          )}
          
          {/* Progress Display */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Today's Nutrition: {nutritionPercentage}%</Text>
            <ProgressBar progress={nutritionPercentage} color="#4CAF50" />
            <Text style={styles.caloriesText}>Calories Consumed: {caloriesConsumed}</Text>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset Progress</Text>
            </TouchableOpacity>
          </View>
          
          {/* Search Bar */}
          <TextInput
            style={styles.searchInput}
            placeholder="Search for food..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          {/* Food Section */}
          <Text style={styles.sectionTitle}>Select a food to log:</Text>
          
          {/* Food List */}
          <FlatList
            data={filteredFoods}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.foodItem}
                onPress={() => {
                  setSelectedFood(item);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodCalories}>{item.calories} cal per {item.unit}</Text>
              </TouchableOpacity>
            )}
            style={styles.foodList}
          />
        </View>
      </ScrollView>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedFood && (
              <>
                <Text style={styles.modalTitle}>Add {selectedFood.name}</Text>
                <Text style={styles.modalCalories}>{selectedFood.calories} calories per {selectedFood.unit}</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Quantity:</Text>
                  <TextInput
                    style={styles.quantityInput}
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={setQuantity}
                  />
                </View>
                
                <Text style={styles.totalCalories}>
                  Total: {selectedFood.calories * parseInt(quantity || 0)} calories
                </Text>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]} 
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.addButton]}
                    onPress={handleAddFood}
                  >
                    <Text style={styles.modalButtonText}>Add Food</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  scrollView: {
    flex: 1,
    marginTop: 70, // Space for the fixed back button
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  backText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
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
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 24,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8
  },
  caloriesText: {
    fontSize: 14,
    marginTop: 8,
    color: '#555'
  },
  resetButton: {
    backgroundColor: '#ff6b6b',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 12
  },
  resetButtonText: {
    color: 'white',
    fontWeight: '600'
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderColor: '#3498db',
    borderWidth: 1
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8
  },
  foodList: {
    flex: 1
  },
  foodItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500'
  },
  foodCalories: {
    color: '#666'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8
  },
  modalCalories: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 16,
    marginRight: 8,
    width: 80
  },
  quantityInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8
  },
  totalCalories: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: '#ddd',
    marginRight: 8
  },
  addButton: {
    backgroundColor: '#4CAF50',
    marginLeft: 8
  },
  modalButtonText: {
    fontWeight: '600',
    color: 'white'
  }
});

export default Nutrition;
