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

  // Render food details modal
  const renderFoodDetailsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={foodDetailsModalVisible}
      onRequestClose={() => setFoodDetailsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedFoodDetails?.food_name || 'Food Details'}
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setFoodDetailsModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          {selectedFoodDetails ? (
            <ScrollView style={styles.modalScrollContent}>
              <Text style={styles.foodDescription}>
                {selectedFoodDetails.food_description || 'No description available'}
              </Text>

              {servingSizes.length > 0 ? (
                <View style={styles.servingContainer}>
                  <Text style={styles.sectionTitle}>Serving Size</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.servingSizesScroll}
                  >
                    {servingSizes.map((serving, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.servingOption,
                          selectedServingIndex === index && styles.selectedServingOption
                        ]}
                        onPress={() => setSelectedServingIndex(index)}
                      >
                        <Text style={[
                          styles.servingText,
                          selectedServingIndex === index && styles.selectedServingText
                        ]}>
                          {serving.serving_description}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ) : null}

              <View style={styles.nutritionFactsCard}>
                <Text style={styles.nutritionFactsHeader}>Nutrition Facts</Text>
                <View style={styles.nutritionFactsRow}>
                  <Text style={styles.nutritionFactsLabel}>Calories</Text>
                  <Text style={styles.nutritionFactsValue}>
                    {selectedFoodDetails.calories || 'N/A'}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.nutritionFactsRow}>
                  <Text style={styles.nutritionFactsLabel}>Carbohydrates</Text>
                  <Text style={styles.nutritionFactsValue}>
                    {selectedFoodDetails.carbs || 'N/A'}g
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.nutritionFactsRow}>
                  <Text style={styles.nutritionFactsLabel}>Protein</Text>
                  <Text style={styles.nutritionFactsValue}>
                    {selectedFoodDetails.protein || 'N/A'}g
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.nutritionFactsRow}>
                  <Text style={styles.nutritionFactsLabel}>Fat</Text>
                  <Text style={styles.nutritionFactsValue}>
                    {selectedFoodDetails.fat || 'N/A'}g
                  </Text>
                </View>
              </View>

              <View style={styles.quantityContainer}>
                <Text style={styles.sectionTitle}>Quantity</Text>
                <View style={styles.quantityInputContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => {
                      const current = parseFloat(quantity);
                      if (current > 0.5) {
                        setQuantity((current - 0.5).toString());
                      }
                    }}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.quantityInput}
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                    selectTextOnFocus
                  />
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => {
                      const current = parseFloat(quantity) || 0;
                      setQuantity((current + 0.5).toString());
                    }}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddFood}
              >
                <Text style={styles.addButtonText}>Add to Today's Meals</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading food details...</Text>
            </View>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nutrition Tracker</Text>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={handleReset}
          >
            <Ionicons name="refresh" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Progress Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.calorieContainer}>
            <View style={styles.calorieInfo}>
              <Text style={styles.calorieTitle}>Today's Calories</Text>
              <View style={styles.calorieValues}>
                <Text style={styles.calorieConsumed}>{Math.round(caloriesConsumed)}</Text>
                <Text style={styles.calorieTarget}> / {TARGET_CALORIES}</Text>
              </View>
            </View>
            <View style={styles.circleProgressContainer}>
              <View style={styles.circleProgress}>
                <Text style={styles.percentageText}>{nutritionPercentage}%</Text>
              </View>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <ProgressBar 
              progress={Math.min(1, caloriesConsumed / TARGET_CALORIES)} 
              color={COLORS.primary}
              trackColor="#E0E0E0"
              height={10}
            />
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchCard}>
          <Text style={styles.sectionTitle}>Search Food</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for foods..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              placeholderTextColor="#9E9E9E"
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="search" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>

          {searchResults.length > 0 && (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsTitle}>Results</Text>
              <ScrollView 
                style={styles.resultsList}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.resultsListContent}
              >
                {searchResults.length === 0 ? (
                  <Text style={styles.emptyMessage}>No results found</Text>
                ) : (
                  searchResults.map((item) => (
                    <View key={item.food_id || String(Math.random())} style={styles.foodItemContainer}>
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
                  ))
                )}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Today's Foods */}
        <View style={styles.todaysFoodsCard}>
          <Text style={styles.sectionTitle}>Today's Foods</Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading your food diary...</Text>
            </View>
          ) : todaysFoods.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={48} color="#BDBDBD" />
              <Text style={styles.emptyMessage}>No foods added today</Text>
              <Text style={styles.emptySubtitle}>Search for foods to get started</Text>
            </View>
          ) : (
            <ScrollView 
              style={styles.todaysFoodsList}
              nestedScrollEnabled={true}
              contentContainerStyle={styles.todaysFoodsListContent}
            >
              {todaysFoods.map((item, index) => (
                <View key={`consumed-${index}`} style={styles.consumedFoodItem}>
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
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      {renderFoodDetailsModal()}
    </View>
  );
};

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
  calorieContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  calorieInfo: {
    flex: 1,
  },
  calorieTitle: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 5,
  },
  calorieValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  calorieConsumed: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  calorieTarget: {
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
  },
  searchCard: {
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    marginTop: 20,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 10,
  },
  resultsList: {
    maxHeight: 250,
  },
  resultsListContent: {
    paddingBottom: 10,
  },
  todaysFoodsCard: {
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
  todaysFoodsList: {
    maxHeight: 350,
  },
  todaysFoodsListContent: {
    paddingBottom: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyMessage: {
    fontSize: 16,
    fontWeight: '500',
    color: '#757575',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 5,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    fontSize: 16,
    color: '#757575',
    marginTop: 10,
  },
  foodItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  foodItemContent: {
    flex: 1,
    paddingRight: 10,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  foodDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 10,
  },
  foodCalories: {
    fontSize: 14,
    color: '#757575',
  },
  consumedFoodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  consumedFoodInfo: {
    flex: 1,
  },
  consumedFoodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  consumedFoodDetails: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  consumedFoodCalories: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: 5,
  },
  removeButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalScrollContent: {
    padding: 16,
  },
  servingContainer: {
    marginTop: 15,
    marginBottom: 15,
  },
  servingSizesScroll: {
    marginTop: 10,
  },
  servingOption: {
    backgroundColor: '#F5F7FA',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedServingOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  servingText: {
    fontSize: 14,
    color: '#757575',
  },
  selectedServingText: {
    color: 'white',
  },
  nutritionFactsCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    marginTop: 15,
    marginBottom: 20,
  },
  nutritionFactsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  nutritionFactsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  nutritionFactsLabel: {
    fontSize: 15,
    color: '#757575',
  },
  nutritionFactsValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  quantityContainer: {
    marginBottom: 20,
  },
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  quantityButton: {
    width: 40,
    height: 40,
    backgroundColor: '#F5F7FA',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  quantityInput: {
    width: 80,
    height: 50,
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    marginHorizontal: 10,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  detailsButton: {
    backgroundColor: COLORS.primary,
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
  consumedFoodNutrition: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
});

export default Nutrition;
