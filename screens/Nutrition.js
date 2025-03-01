import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const foods = [
  { id: '1', name: 'Apple', calories: 95 },
  { id: '2', name: 'Banana', calories: 105 },
  { id: '3', name: 'Orange', calories: 62 },
  { id: '4', name: 'Strawberries', calories: 33 },
  { id: '5', name: 'Grapes', calories: 104 },
  { id: '6', name: 'Watermelon', calories: 30 },
  { id: '7', name: 'Blueberries', calories: 84 },
  { id: '8', name: 'Pineapple', calories: 82 },
  { id: '9', name: 'Peach', calories: 58 },
  { id: '10', name: 'Mango', calories: 150 },
  { id: '11', name: 'Chicken Breast', calories: 165 },
  { id: '12', name: 'Beef', calories: 250 },
  { id: '13', name: 'Salmon', calories: 206 },
  { id: '14', name: 'Eggs', calories: 155 },
  { id: '15', name: 'Milk', calories: 103 },
  { id: '16', name: 'Yogurt', calories: 59 },
  { id: '17', name: 'Almonds', calories: 164 },
  { id: '18', name: 'Walnuts', calories: 185 },
  { id: '19', name: 'Rice', calories: 206 },
  { id: '20', name: 'Pasta', calories: 221 },
  { id: '21', name: 'Broccoli', calories: 55 },
  { id: '22', name: 'Carrots', calories: 41 },
  { id: '23', name: 'Spinach', calories: 23 },
  { id: '24', name: 'Potatoes', calories: 161 },
  { id: '25', name: 'Cheese', calories: 113 },
  { id: '26', name: 'Chips', calories: 152 },
  { id: '27', name: 'Pizza', calories: 285 },
  { id: '28', name: 'Chocolate', calories: 546 },
  { id: '29', name: 'Ice Cream', calories: 207 },
  { id: '30', name: 'Cookies', calories: 80 },
];

const Nutrition = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter foods based on search query
  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Screen Title */}
      <Text style={styles.title}>Nutrition</Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search Foods..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Food List */}
      <FlatList
        data={filteredFoods}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.foodItem}>
            <Text style={styles.foodName}>{item.name}</Text>
            <Text style={styles.foodCalories}>{item.calories} Calories</Text>
          </View>
        )}
      />

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
  foodItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderRadius: 8, // Rounded corners for a smoother look
    marginBottom: 10, // Spacing between items
    backgroundColor: '#fff', // White background for items
    elevation: 1, // Shadow effect for a slight 3D look
  },
  foodName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  foodCalories: {
    fontSize: 16,
    color: '#555',
  },
});

export default Nutrition;
