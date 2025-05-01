import React, { useState, useEffect, useCallback } from 'react';
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
  Modal,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useNutrition } from '../context/NutritionContext';
import { useAuth } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';
import fatSecretService from '../services/FatSecretService';
import fatSecretDiagnostic from '../services/FatSecretDiagnostic';
import fallbackFoodService from '../services/FallbackFoodService';
import consumedFoodService from '../services/ConsumedFoodService';
import { COLORS, FONTS } from '../constants';

const foods = [
  { id: '1', name: 'Apple', calories: 95, protein: 0.5, fat: 0.3, carbs: 25, unit: 'medium' },
  { id: '2', name: 'Banana', calories: 105, protein: 1.3, fat: 0.4, carbs: 27, unit: 'medium' },
  { id: '3', name: 'Orange', calories: 62, protein: 1.2, fat: 0.2, carbs: 15, unit: 'medium' },
  { id: '4', name: 'Strawberries', calories: 33, protein: 0.7, fat: 0.3, carbs: 8, unit: 'cup' },
  { id: '5', name: 'Grapes', calories: 104, protein: 1.1, fat: 0.2, carbs: 27, unit: 'cup' },
  { id: '6', name: 'Watermelon', calories: 30, protein: 0.6, fat: 0.2, carbs: 7.5, unit: 'slice' },
  { id: '7', name: 'Blueberries', calories: 84, protein: 1.1, fat: 0.5, carbs: 21, unit: 'cup' },
  { id: '8', name: 'Pineapple', calories: 82, protein: 0.9, fat: 0.2, carbs: 21.6, unit: 'cup' },
  { id: '9', name: 'Peach', calories: 58, protein: 1.4, fat: 0.4, carbs: 14, unit: 'medium' },
  { id: '10', name: 'Mango', calories: 150, protein: 1.1, fat: 0.6, carbs: 36.4, unit: 'cup' },
  { id: '11', name: 'Chicken Breast', calories: 165, protein: 31, fat: 3.6, carbs: 0, unit: '100g' },
  { id: '12', name: 'Beef Steak', calories: 250, protein: 26, fat: 17, carbs: 0, unit: '100g' },
  { id: '13', name: 'Salmon', calories: 206, protein: 22, fat: 13, carbs: 0, unit: '100g' },
  { id: '14', name: 'Eggs', calories: 155, protein: 13, fat: 11, carbs: 1.1, unit: 'large' },
  { id: '15', name: 'Milk', calories: 103, protein: 8, fat: 2.4, carbs: 12, unit: 'cup' },
  { id: '16', name: 'Yogurt', calories: 59, protein: 3.5, fat: 3.3, carbs: 4.7, unit: '100g' },
  { id: '17', name: 'Almonds', calories: 164, protein: 6, fat: 14, carbs: 6, unit: '1/4 cup' },
  { id: '18', name: 'Walnuts', calories: 185, protein: 4.3, fat: 18.5, carbs: 3.9, unit: '1/4 cup' },
  { id: '19', name: 'Rice', calories: 206, protein: 4.3, fat: 0.4, carbs: 44.5, unit: 'cup' },
  { id: '20', name: 'Pasta', calories: 221, protein: 8.1, fat: 1.3, carbs: 43.2, unit: 'cup' },
  { id: '21', name: 'Broccoli', calories: 55, protein: 3.7, fat: 0.6, carbs: 11.2, unit: 'cup' },
  { id: '22', name: 'Carrots', calories: 41, protein: 0.9, fat: 0.2, carbs: 9.6, unit: 'cup' },
  { id: '23', name: 'Spinach', calories: 23, protein: 2.9, fat: 0.4, carbs: 3.6, unit: 'cup' },
  { id: '24', name: 'Potatoes', calories: 161, protein: 4.3, fat: 0.2, carbs: 36.6, unit: 'medium' },
  { id: '25', name: 'Cheese', calories: 113, protein: 7, fat: 9, carbs: 0.4, unit: 'slice' },
  { id: '26', name: 'Chips', calories: 152, protein: 2, fat: 10, carbs: 14, unit: 'small bag' },
  { id: '27', name: 'Pizza', calories: 285, protein: 12, fat: 10, carbs: 36, unit: 'slice' },
  { id: '28', name: 'Chocolate', calories: 546, protein: 7.8, fat: 31, carbs: 61, unit: '100g' },
  { id: '29', name: 'Ice Cream', calories: 207, protein: 3.5, fat: 11, carbs: 25, unit: '1/2 cup' },
  { id: '30', name: 'Cookies', calories: 80, protein: 1, fat: 4, carbs: 10, unit: 'piece' },
  // Additional chicken items
  { id: '31', name: 'Chicken Thigh', calories: 209, protein: 26, fat: 10.9, carbs: 0, unit: '100g' },
  { id: '32', name: 'Chicken Wings', calories: 290, protein: 27, fat: 19.5, carbs: 0, unit: '100g' },
  { id: '33', name: 'Chicken Drumstick', calories: 172, protein: 24.3, fat: 8.1, carbs: 0, unit: '100g' },
  { id: '34', name: 'Grilled Chicken Sandwich', calories: 350, protein: 29, fat: 9, carbs: 41, unit: 'sandwich' },
  { id: '35', name: 'Chicken Salad', calories: 179, protein: 26, fat: 8, carbs: 2, unit: 'cup' },
  { id: '36', name: 'Chicken Soup', calories: 130, protein: 14, fat: 5, carbs: 9, unit: 'cup' },
  { id: '37', name: 'Chicken Caesar Salad', calories: 392, protein: 30, fat: 24, carbs: 12, unit: 'bowl' },
  { id: '38', name: 'BBQ Chicken', calories: 230, protein: 28, fat: 12, carbs: 3, unit: '100g' },
  { id: '39', name: 'Chicken Nuggets', calories: 297, protein: 15, fat: 19, carbs: 15, unit: '6 pieces' },
  { id: '40', name: 'Chicken Curry', calories: 243, protein: 25, fat: 14, carbs: 6, unit: 'cup' }
];

const Nutrition = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { nutritionPercentage, updateNutritionPercentage, caloriesConsumed, updateCaloriesConsumed, resetNutrition, TARGET_CALORIES } = useNutrition();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [modalVisible, setModalVisible] = useState(false);
  const [todaysFoods, setTodaysFoods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [foodDetailsModalVisible, setFoodDetailsModalVisible] = useState(false);
  const [selectedFoodDetails, setSelectedFoodDetails] = useState(null);
  const [servingSizes, setServingSizes] = useState([]);
  const [selectedServingIndex, setSelectedServingIndex] = useState(0);
  const [isUsingFallbackApi, setIsUsingFallbackApi] = useState(false);

  // Initialize FatSecret API service
  useEffect(() => {
    const initializeService = async () => {
      try {
        await fatSecretService.initialize();
        
        // Test API connectivity
        const apiConnected = await fatSecretService.testConnection();
        if (!apiConnected) {
          console.log('FatSecret API connectivity test failed - will try fallback API');
          
          // Try the fallback API
          const fallbackConnected = await fallbackFoodService.testConnection();
          if (fallbackConnected) {
            console.log('Fallback API connectivity test passed - will use fallback API');
            setIsUsingFallbackApi(true);
            
            // Show a notification
            setTimeout(() => {
              Alert.alert(
                "Alternative Nutrition Database",
                `Using alternative nutrition database because the main database couldn't be accessed. This may be due to connection issues or API limitations.`,
                [{ text: "OK" }]
              );
            }, 1000);
          } else {
            console.log('Both APIs failed - will use local database as final fallback');
            
            // Only show a non-blocking notification
            setTimeout(() => {
              Alert.alert(
                "Nutrition Database Notice",
                `Using offline food database. The app couldn't connect to any online nutrition database. This may be due to connection issues or API limitations. Your device IP is ${fatSecretService.ipAddress}.`,
                [{ text: "OK" }]
              );
            }, 1000);
          }
        } else {
          console.log('FatSecret API connectivity test passed - online database available');
        }
        
        loadTodaysFoods();
      } catch (error) {
        console.error('Error initializing FatSecret service:', error);
        // Try the fallback API as a backup
        try {
          const fallbackConnected = await fallbackFoodService.testConnection();
          if (fallbackConnected) {
            console.log('Fallback API connectivity test passed - will use fallback API after primary API error');
            setIsUsingFallbackApi(true);
            
            Alert.alert(
              "Using Alternative Database",
              "The primary nutrition database couldn't be accessed. Using alternative nutrition data source instead.",
              [{ text: "OK" }]
            );
          } else {
            Alert.alert(
              "API Error",
              "Failed to connect to any nutrition database. Using offline data.",
              [{ text: "OK" }]
            );
          }
        } catch (fallbackError) {
          console.error('Error with fallback API:', fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeService();
  }, []);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTodaysFoods();
    }, [user])
  );

  // Load today's consumed foods
  const loadTodaysFoods = async () => {
    try {
      setIsLoading(true);
      const userId = user ? user.uid : null;
      const foods = await consumedFoodService.getTodaysFoods(userId);
      setTodaysFoods(foods);
      
      // Also update the total calories and nutrition percentage
      const totals = await consumedFoodService.getTodaysTotals(userId);
      if (totals) {
        updateCaloriesConsumed(totals.calories);
      }
    } catch (error) {
      console.error('Error loading today\'s foods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced search for foods with multiple API options
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      setSearchResults([]); // Clear previous results
      console.log('Searching for foods with query:', searchQuery);
      
      let apiResults = [];
      let apiError = null;
      
      // Try primary API first unless we already know it's not working
      if (!isUsingFallbackApi) {
        try {
          console.log('Attempting FatSecret API search...');
          apiResults = await fatSecretService.searchFoods(searchQuery);
          console.log(`FatSecret API search returned ${apiResults.length} results`);
          
          // Format and use the results if available
          if (apiResults && apiResults.length > 0) {
            const formattedApiResults = apiResults.map(item => ({
              ...item,
              food_id: String(item.food_id), 
              food_name: item.food_name,
              food_description: item.food_description,
              api_source: 'fatsecret'
            }));
            
            setSearchResults(formattedApiResults);
            setIsSearching(false);
            return;
          }
        } catch (error) {
          apiError = error;
          console.error('FatSecret API search failed with error:', error.message);
          
          // Only show detailed errors when this is unexpected
          if (!isUsingFallbackApi) {
            handleFatSecretApiError(error);
          }
        }
      }
      
      // Try fallback API if primary failed or returned no results
      try {
        console.log('Attempting fallback API search...');
        const fallbackResults = await fallbackFoodService.searchFoods(searchQuery);
        console.log(`Fallback API search returned ${fallbackResults.length} results`);
        
        if (fallbackResults && fallbackResults.length > 0) {
          const formattedFallbackResults = fallbackResults.map(item => ({
            ...item,
            api_source: 'fallback'
          }));
          
          // If we're reaching here unexpectedly, show notification
          if (!isUsingFallbackApi && !apiError) {
            setIsUsingFallbackApi(true);
            Alert.alert(
              "Using Alternative Database",
              "The app is using an alternative nutrition database because the primary database returned no results.",
              [{ text: "Continue" }]
            );
          }
          
          setSearchResults(formattedFallbackResults);
          setIsSearching(false);
          return;
        }
      } catch (fallbackError) {
        console.error('Fallback API search failed with error:', fallbackError.message);
        // Continue to local database search
      }
      
      // If both APIs failed, use local food database as last resort
      console.log('Using local food database as last resort');
      
      // Use improved local search
      const searchTerms = searchQuery.toLowerCase().split(' ');
      
      const filteredLocalFoods = foods.filter(food => {
        const foodName = food.name.toLowerCase();
        return searchTerms.some(term => foodName.includes(term));
      });
      
      // Convert local foods to match API format for compatibility
      const formattedLocalFoods = filteredLocalFoods.map(food => ({
        food_id: String(food.id),
        food_name: food.name,
        food_description: `${food.calories} cal per ${food.unit}`,
        food_type: "Local",
        api_source: 'local',
        servings: {
          serving: {
            serving_id: "0",
            serving_description: food.unit,
            serving_url: "",
            metric_serving_amount: 1,
            metric_serving_unit: food.unit,
            calories: food.calories,
            protein: food.protein || 0,
            fat: food.fat || 0,
            carbohydrate: food.carbs || 0
          }
        }
      }));
      
      console.log(`Found ${formattedLocalFoods.length} local food matches`);
      
      if (apiError && formattedLocalFoods.length > 0 && !isUsingFallbackApi) {
        Alert.alert(
          "Using Local Database",
          "Online nutrition databases could not be reached. Using offline food database instead."
        );
      }
      
      setSearchResults(formattedLocalFoods);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert(
        "Search Error",
        "There was a problem with your search. Please try again."
      );
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle FatSecret API errors in a more structured way
  const handleFatSecretApiError = (error) => {
    if (error.response && error.response.data && error.response.data.error === 'invalid_scope') {
      Alert.alert(
        "API Permission Error",
        "The nutrition API returned a scope error. The app will try an alternative data source.",
        [{ text: "Continue" }]
      );
      setIsUsingFallbackApi(true);
    } else if (error.response && error.response.status === 401) {
      Alert.alert(
        "Authentication Error",
        `The nutrition API returned an authentication error. The app will try an alternative data source.`,
        [{ text: "OK" }]
      );
      setIsUsingFallbackApi(true);
    } else if (error.message.includes('403')) {
      Alert.alert(
        "Permission Error",
        "The app doesn't have permission to access the primary nutrition database. Switching to alternative source.",
        [{ text: "OK" }]
      );
      setIsUsingFallbackApi(true);
    }
  };

  // Direct access to food details with enhanced API support
  const directAccessFood = async (item) => {
    try {
      console.log('Direct access for food:', JSON.stringify(item));
      setIsLoading(true);
      
      // Show the modal right away with loading indicator
      setSelectedFoodDetails({
        food_name: item.food_name || item.name || 'Loading...',
        food_type: item.food_type || 'Food',
        brand_name: item.brand_name || ''
      });
      setServingSizes([]);
      setSelectedServingIndex(0);
      setFoodDetailsModalVisible(true);
      
      // FatSecret API food
      if (item.food_id && (!item.api_source || item.api_source === 'fatsecret')) {
        try {
          console.log('Getting details for FatSecret API food ID:', item.food_id);
          const details = await fatSecretService.getFoodDetails(item.food_id);
          
          if (details) {
            console.log('Successfully loaded food details from FatSecret API');
            setSelectedFoodDetails(details);
            
            // Extract serving sizes
            if (details.servings && details.servings.serving) {
              const servings = Array.isArray(details.servings.serving) 
                ? details.servings.serving 
                : [details.servings.serving];
              console.log(`Found ${servings.length} serving sizes from API`);
              setServingSizes(servings);
              setSelectedServingIndex(0);
            }
          } else {
            Alert.alert("Error", "Could not retrieve food details.");
            setFoodDetailsModalVisible(false);
          }
        } catch (error) {
          console.error('Error getting API food details:', error);
          // Try fallback if primary API fails
          tryFallbackFoodDetails(item);
        }
      } 
      // Fallback API food
      else if (item.food_id && item.api_source === 'fallback') {
        tryFallbackFoodDetails(item);
      }
      // Local food
      else if (item.id || (item.calories && item.unit) || item.api_source === 'local') {
        console.log('Processing local food:', item.name || item.food_name);
        const formattedFood = {
          food_id: item.id || 'local',
          food_name: item.name || item.food_name,
          food_description: `${item.calories} cal per ${item.unit}`,
          food_type: "Local",
          servings: {
            serving: {
              serving_id: "0",
              serving_description: item.unit,
              serving_url: "",
              metric_serving_amount: 1,
              metric_serving_unit: item.unit,
              calories: item.calories,
              protein: item.protein || 0,
              fat: item.fat || 0,
              carbohydrate: item.carbs || 0
            }
          }
        };
        
        setSelectedFoodDetails(formattedFood);
        setServingSizes([formattedFood.servings.serving]);
        setSelectedServingIndex(0);
      } else {
        Alert.alert("Error", "Invalid food data format.");
        setFoodDetailsModalVisible(false);
      }
    } catch (error) {
      console.error('Error in direct access:', error);
      Alert.alert("Error", "Something went wrong accessing food details.");
      setFoodDetailsModalVisible(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Try to get food details from fallback API
  const tryFallbackFoodDetails = async (item) => {
    try {
      console.log('Getting details from fallback API for food ID:', item.food_id);
      const details = await fallbackFoodService.getFoodDetails(item.food_id);
      
      if (details) {
        console.log('Successfully loaded food details from fallback API');
        setSelectedFoodDetails(details);
        
        // Extract serving sizes
        if (details.servings && details.servings.serving) {
          const servings = Array.isArray(details.servings.serving) 
            ? details.servings.serving 
            : [details.servings.serving];
          console.log(`Found ${servings.length} serving sizes from fallback API`);
          setServingSizes(servings);
          setSelectedServingIndex(0);
        }
      } else {
        throw new Error('No food details returned from fallback API');
      }
    } catch (error) {
      console.error('Error getting fallback API food details:', error);
      
      // Create a simple food detail as last resort
      const fallbackDetails = {
        food_id: item.food_id || 'unknown',
        food_name: item.food_name || 'Unknown Food',
        food_description: item.food_description || 'No description available',
        food_type: item.food_type || 'Generic Food',
        servings: {
          serving: {
            serving_id: "0",
            serving_description: "1 serving",
            calories: 0,
            protein: 0,
            fat: 0,
            carbohydrate: 0
          }
        }
      };
      
      setSelectedFoodDetails(fallbackDetails);
      setServingSizes([fallbackDetails.servings.serving]);
      setSelectedServingIndex(0);
      
      Alert.alert(
        "Limited Information",
        "Full nutritional information for this food is not available."
      );
    }
  };

  // Reset food details modal
  const resetFoodDetailsModal = () => {
    setFoodDetailsModalVisible(false);
    setSelectedFoodDetails(null);
    setServingSizes([]);
    setSelectedServingIndex(0);
    setQuantity('1');
  };

  // Modal content for food details
  const renderFoodDetailsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={foodDetailsModalVisible}
      onRequestClose={resetFoodDetailsModal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
          ) : selectedFoodDetails ? (
            <>
              <Text style={styles.modalTitle}>{selectedFoodDetails.food_name}</Text>
              
              {/* Food Type Indicator */}
              <View style={styles.foodTypeContainer}>
                <Text style={styles.foodTypeText}>
                  {selectedFoodDetails.food_type === "Brand" 
                    ? `${selectedFoodDetails.brand_name || 'Brand'}` 
                    : selectedFoodDetails.food_type || 'Food'}
                </Text>
              </View>
              
              {/* Serving Size Selection */}
              <Text style={styles.servingSizeLabel}>Serving Size:</Text>
              {servingSizes && servingSizes.length > 0 ? (
                <ScrollView horizontal style={styles.servingSizeScroll} showsHorizontalScrollIndicator={false}>
                  {servingSizes.map((serving, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.servingSizeOption,
                        selectedServingIndex === index && styles.selectedServingSize
                      ]}
                      onPress={() => setSelectedServingIndex(index)}
                    >
                      <Text style={[
                        styles.servingSizeText,
                        selectedServingIndex === index && styles.selectedServingSizeText
                      ]}>
                        {serving.serving_description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <Text style={styles.noServingsText}>No serving information available</Text>
              )}
              
              {/* Nutrition Info */}
              {servingSizes && servingSizes.length > 0 && (
                <View style={styles.nutritionInfo}>
                  <Text style={styles.nutritionLabel}>Nutrition per serving:</Text>
                  <Text style={styles.nutritionValue}>Calories: {servingSizes[selectedServingIndex].calories}</Text>
                  <Text style={styles.nutritionValue}>Protein: {servingSizes[selectedServingIndex].protein || 0}g</Text>
                  <Text style={styles.nutritionValue}>Fat: {servingSizes[selectedServingIndex].fat || 0}g</Text>
                  <Text style={styles.nutritionValue}>Carbs: {servingSizes[selectedServingIndex].carbohydrate || 0}g</Text>
                </View>
              )}
              
              {/* Quantity Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Quantity:</Text>
                <TextInput
                  style={styles.quantityInput}
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </View>
              
              {/* Total */}
              {servingSizes && servingSizes.length > 0 && (
                <Text style={styles.totalCalories}>
                  Total: {Math.round(servingSizes[selectedServingIndex].calories * parseFloat(quantity || 0))} calories
                </Text>
              )}
              
              {/* Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={resetFoodDetailsModal}
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
          ) : (
            <Text style={styles.errorText}>Failed to load food details.</Text>
          )}
        </View>
      </View>
    </Modal>
  );

  // Add a food to today's consumption
  const handleAddFood = async () => {
    if (!selectedFoodDetails) return;
    
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert("Invalid Quantity", "Please enter a valid quantity.");
      return;
    }

    // Get the selected serving
    const serving = servingSizes[selectedServingIndex];
    
    // Make sure we have valid nutrition data
    if (!serving) {
      console.error('No serving information available');
      Alert.alert("Error", "No serving information available for this food.");
      return;
    }
    
    console.log('Adding food to consumption:', selectedFoodDetails.food_name);
    console.log('Serving:', serving.serving_description);
    console.log('Quantity:', qty);
    
    // Calculate nutrition values based on quantity
    const foodItem = {
      name: selectedFoodDetails.food_name,
      description: serving.serving_description,
      calories: Math.round(serving.calories * qty),
      protein: Math.round((serving.protein || 0) * qty * 100) / 100,
      fat: Math.round((serving.fat || 0) * qty * 100) / 100,
      carbs: Math.round((serving.carbohydrate || 0) * qty * 100) / 100,
      quantity: qty,
      servingDescription: serving.serving_description,
      // Add source information to differentiate between local and API foods
      source: selectedFoodDetails.food_type || 'Local',
      sourceId: selectedFoodDetails.food_id
    };
    
    try {
      const userId = user ? user.uid : null;
      const success = await consumedFoodService.addConsumedFood(foodItem, userId);
      
      if (success) {
        // Reload today's foods and update nutrition
        loadTodaysFoods();
        
        // Reset modal
        resetFoodDetailsModal();
        
        Alert.alert(
          "Food Added",
          `Added ${qty} ${serving.serving_description}(s) of ${selectedFoodDetails.food_name} (${foodItem.calories} calories)`
        );
      }
    } catch (error) {
      console.error('Error adding food:', error);
      Alert.alert("Error", "Failed to add food. Please try again.");
    }
  };

  // Remove a food from today's consumption
  const handleRemoveFood = async (index) => {
    try {
      const userId = user ? user.uid : null;
      const success = await consumedFoodService.removeConsumedFood(index, userId);
      
      if (success) {
        // Reload today's foods and update nutrition
        loadTodaysFoods();
        Alert.alert("Success", "Food item removed from your log.");
      }
    } catch (error) {
      console.error('Error removing food:', error);
      Alert.alert("Error", "Failed to remove food. Please try again.");
    }
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Nutrition Progress",
      "Are you sure you want to reset your nutrition progress? This will remove all food entries for today.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Reset", 
          onPress: async () => {
            try {
              const userId = user ? user.uid : null;
              await consumedFoodService.resetTodaysData(userId);
              resetNutrition();
              setTodaysFoods([]);
              Alert.alert("Success", "Your nutrition progress has been reset.");
            } catch (error) {
              console.error('Error resetting nutrition data:', error);
              Alert.alert("Error", "Failed to reset nutrition data. Please try again.");
            }
          }
        }
      ]
    );
  };

  // Run API diagnostics
  const runApiDiagnostics = async () => {
    try {
      await fatSecretDiagnostic.runAndDisplayDiagnostics();
    } catch (error) {
      console.error('Error running API diagnostics:', error);
      Alert.alert(
        "Diagnostic Error",
        "Failed to run API diagnostics. Please try again."
      );
    }
  };

  // Render a food search result item
  const renderFoodItem = ({ item }) => {
    return (
      <View style={styles.foodItemContainer}>
        <View style={styles.foodItemContent}>
          <Text style={styles.foodName}>{item.food_name || item.name}</Text>
          <Text style={styles.foodDescription}>{item.food_description || `${item.calories} cal per ${item.unit}`}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => directAccessFood(item)}
        >
          <Text style={styles.detailsButtonText}>Details</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render a consumed food item
  const renderConsumedFoodItem = ({ item, index }) => (
    <View style={styles.consumedFoodItem}>
      <View style={styles.consumedFoodInfo}>
        <Text style={styles.consumedFoodName}>{item.name}</Text>
        <Text style={styles.consumedFoodDescription}>
          {item.quantity} {item.servingDescription} ({item.calories} cal)
        </Text>
        <Text style={styles.consumedFoodNutrition}>
          P: {item.protein || 0}g | F: {item.fat || 0}g | C: {item.carbs || 0}g
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveFood(index)}
      >
        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nutrition</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.userInfoText}>Tracking for: {user ? user.email : 'Guest'}</Text>
      </View>

      {/* Nutrition Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>Today's Nutrition: {nutritionPercentage}%</Text>
        <Text style={styles.caloriesText}>Calories Consumed: {Math.round(caloriesConsumed)} / {TARGET_CALORIES} cal</Text>
        <View style={styles.progressBarContainer}>
          <ProgressBar progress={nutritionPercentage} color={COLORS.primary} />
        </View>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
        >
          <Text style={styles.resetButtonText}>Reset Progress</Text>
        </TouchableOpacity>
      </View>

      {/* Database Status Information */}
      {isUsingFallbackApi ? (
        <View style={styles.apiInfoContainer}>
          <Text style={styles.apiInfoText}>
            Using Alternative Nutrition Database
          </Text>
          <Text style={styles.apiSubInfoText}>
            The app is using an alternative nutrition database because the primary database couldn't be accessed.
          </Text>
          <TouchableOpacity style={styles.diagButton} onPress={runApiDiagnostics}>
            <Text style={styles.diagButtonText}>Run API Diagnostics</Text>
          </TouchableOpacity>
        </View>
      ) : fatSecretService.ipAddress && (!fatSecretService.accessToken) ? (
        <View style={styles.apiInfoContainer}>
          <Text style={styles.apiInfoText}>
            Nutrition Database Notice
          </Text>
          <Text style={styles.apiSubInfoText}>
            Using offline food database. The app couldn't connect to the online nutrition database.
            This may be due to connection issues or API limitations.
            Your device IP is {fatSecretService.ipAddress}.
          </Text>
          <TouchableOpacity style={styles.diagButton} onPress={runApiDiagnostics}>
            <Text style={styles.diagButtonText}>Run API Diagnostics</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for food..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="search" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.mainContent}>
          {/* Search Results Section */}
          {searchResults.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Search Results:</Text>
              {/* Render items directly without FlatList */}
              <View style={styles.foodList}>
                {searchResults.map((item, index) => (
                  <View key={`search-${item.food_id || index}`}>
                    {renderFoodItem({item})}
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* Today's Food Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Today's Food:</Text>
            {isLoading ? (
              <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
            ) : todaysFoods.length > 0 ? (
              <View style={styles.consumedFoodList}>
                {todaysFoods.map((item, index) => (
                  <View key={`consumed-${index}`}>
                    {renderConsumedFoodItem({item, index})}
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyListText}>No foods logged today. Search and add some!</Text>
            )}
          </View>
        </View>
      </ScrollView>
      
      {/* Food Details Modal */}
      {renderFoodDetailsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    paddingTop: Platform.OS === 'ios' ? 50 : 20, // Add safe area padding for iOS
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  userInfo: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#E8F0FE',
    borderRadius: 8,
  },
  userInfoText: {
    fontSize: 14,
    color: '#4A6FA5',
  },
  progressContainer: {
    marginBottom: 12,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  caloriesText: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
    marginBottom: 12,
  },
  resetButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    width: 44,
    height: 44,
    backgroundColor: '#007bff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  foodList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 5,
    marginBottom: 8,
  },
  foodItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderRadius: 8,
    marginBottom: 4,
  },
  foodItemContent: {
    flex: 1,
    paddingRight: 10,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  foodDescription: {
    fontSize: 14,
    color: '#666',
  },
  consumedFoodList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 5,
  },
  consumedFoodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  consumedFoodInfo: {
    flex: 1,
  },
  consumedFoodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  consumedFoodDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  consumedFoodNutrition: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
  },
  emptyListText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  servingSizeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  servingSizeScroll: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  servingSizeOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginRight: 8,
  },
  selectedServingSize: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  servingSizeText: {
    fontSize: 14,
    color: '#333',
  },
  selectedServingSizeText: {
    color: '#fff',
  },
  nutritionInfo: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  nutritionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  nutritionValue: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    width: 80,
    color: '#333',
  },
  quantityInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
  totalCalories: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0a84ff',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f2f3',
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    marginLeft: 10,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  loader: {
    marginVertical: 30,
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    margin: 20,
    fontSize: 16,
  },
  foodTypeContainer: {
    backgroundColor: '#f1f8ff',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'center',
    marginBottom: 15,
  },
  foodTypeText: {
    fontSize: 14,
    color: '#0a84ff',
    fontWeight: '500',
  },
  noServingsText: {
    textAlign: 'center',
    color: '#888',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  detailsButton: {
    backgroundColor: '#0a84ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 75,
  },
  detailsButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  progressBarContainer: {
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 10,
  },
  apiInfoContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  apiInfoText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  apiSubInfoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  diagButton: {
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  diagButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default Nutrition;
