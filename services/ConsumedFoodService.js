import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

// Keys for AsyncStorage
const getConsumedFoodsKey = (userId) => `@consumed_foods_${userId || 'guest'}`;
const getDailyTotalsKey = (userId) => `@daily_totals_${userId || 'guest'}`;

class ConsumedFoodService {
  // Store a new consumed food item
  async addConsumedFood(foodItem, userId = null) {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const storageKey = getConsumedFoodsKey(userId);
      
      console.log(`Adding food for ${userId || 'guest'} on ${today}`, foodItem);
      
      // Get existing consumed foods
      const existingData = await AsyncStorage.getItem(storageKey);
      let consumedFoods = existingData ? JSON.parse(existingData) : {};
      
      // Debug existing data
      if (existingData) {
        console.log(`Retrieved existing food data: `, 
          Object.keys(consumedFoods).length > 0 
            ? `${Object.keys(consumedFoods).length} days of data` 
            : 'empty object'
        );
      } else {
        console.log('No existing food data, creating new storage');
      }
      
      // Initialize today's entry if it doesn't exist
      if (!consumedFoods[today]) {
        console.log(`Creating new entry for ${today}`);
        consumedFoods[today] = [];
      }
      
      // Add the new food with timestamp
      const foodWithTimestamp = {
        ...foodItem,
        timestamp: new Date().toISOString()
      };
      
      consumedFoods[today].push(foodWithTimestamp);
      console.log(`Added food. New count: ${consumedFoods[today].length}`);
      
      // Save updated list
      await AsyncStorage.setItem(storageKey, JSON.stringify(consumedFoods));
      console.log('Saved updated food list to storage');
      
      // Update daily totals
      await this.updateDailyTotals(foodItem, userId);
      
      return true;
    } catch (error) {
      console.error('Error adding consumed food:', error);
      return false;
    }
  }
  
  // Update daily nutrition totals
  async updateDailyTotals(foodItem, userId = null) {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const storageKey = getDailyTotalsKey(userId);
      
      // Get existing totals
      const existingData = await AsyncStorage.getItem(storageKey);
      let dailyTotals = existingData ? JSON.parse(existingData) : {};
      
      // Initialize today's entry if it doesn't exist
      if (!dailyTotals[today]) {
        dailyTotals[today] = {
          calories: 0,
          protein: 0,
          fat: 0,
          carbs: 0
        };
      }
      
      // Add the new food's nutrition to the totals
      dailyTotals[today].calories += foodItem.calories || 0;
      dailyTotals[today].protein += foodItem.protein || 0;
      dailyTotals[today].fat += foodItem.fat || 0;
      dailyTotals[today].carbs += foodItem.carbs || 0;
      
      // Save updated totals
      await AsyncStorage.setItem(storageKey, JSON.stringify(dailyTotals));
      
      return dailyTotals[today];
    } catch (error) {
      console.error('Error updating daily totals:', error);
      return null;
    }
  }
  
  // Get today's consumed foods
  async getTodaysFoods(userId = null) {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const storageKey = getConsumedFoodsKey(userId);
      
      console.log(`Getting today's foods for ${userId || 'guest'}, today is ${today}`);
      const existingData = await AsyncStorage.getItem(storageKey);
      
      if (!existingData) {
        console.log(`No food data found for ${userId || 'guest'}`);
        return [];
      }
      
      const consumedFoods = JSON.parse(existingData);
      console.log(`Found food data for ${userId || 'guest'}:`, consumedFoods);
      
      const todaysFoods = consumedFoods[today] || [];
      console.log(`Today's foods count: ${todaysFoods.length}`);
      return todaysFoods;
    } catch (error) {
      console.error('Error getting today\'s foods:', error);
      return [];
    }
  }
  
  // Get today's nutrition totals
  async getTodaysTotals(userId = null) {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const storageKey = getDailyTotalsKey(userId);
      
      const existingData = await AsyncStorage.getItem(storageKey);
      if (!existingData) {
        return {
          calories: 0,
          protein: 0,
          fat: 0,
          carbs: 0
        };
      }
      
      const dailyTotals = JSON.parse(existingData);
      return dailyTotals[today] || {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0
      };
    } catch (error) {
      console.error('Error getting today\'s totals:', error);
      return {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0
      };
    }
  }
  
  // Remove a consumed food item by index
  async removeConsumedFood(index, userId = null) {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const storageKey = getConsumedFoodsKey(userId);
      
      // Get existing consumed foods
      const existingData = await AsyncStorage.getItem(storageKey);
      if (!existingData) return false;
      
      const consumedFoods = JSON.parse(existingData);
      
      // Check if today's entry exists
      if (!consumedFoods[today] || index >= consumedFoods[today].length) {
        return false;
      }
      
      // Get the food item to be removed for updating totals
      const removedFood = consumedFoods[today][index];
      
      // Remove the food item
      consumedFoods[today].splice(index, 1);
      
      // Save updated list
      await AsyncStorage.setItem(storageKey, JSON.stringify(consumedFoods));
      
      // Update daily totals by subtracting removed food
      await this.subtractFromDailyTotals(removedFood, userId);
      
      return true;
    } catch (error) {
      console.error('Error removing consumed food:', error);
      return false;
    }
  }
  
  // Subtract a food item from daily totals
  async subtractFromDailyTotals(foodItem, userId = null) {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const storageKey = getDailyTotalsKey(userId);
      
      // Get existing totals
      const existingData = await AsyncStorage.getItem(storageKey);
      if (!existingData) return null;
      
      const dailyTotals = JSON.parse(existingData);
      
      // Check if today's entry exists
      if (!dailyTotals[today]) {
        return null;
      }
      
      // Subtract the food's nutrition from the totals
      dailyTotals[today].calories = Math.max(0, dailyTotals[today].calories - (foodItem.calories || 0));
      dailyTotals[today].protein = Math.max(0, dailyTotals[today].protein - (foodItem.protein || 0));
      dailyTotals[today].fat = Math.max(0, dailyTotals[today].fat - (foodItem.fat || 0));
      dailyTotals[today].carbs = Math.max(0, dailyTotals[today].carbs - (foodItem.carbs || 0));
      
      // Save updated totals
      await AsyncStorage.setItem(storageKey, JSON.stringify(dailyTotals));
      
      return dailyTotals[today];
    } catch (error) {
      console.error('Error updating daily totals after removal:', error);
      return null;
    }
  }
  
  // Reset today's food data
  async resetTodaysData(userId = null) {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Reset consumed foods
      const foodsKey = getConsumedFoodsKey(userId);
      const existingFoods = await AsyncStorage.getItem(foodsKey);
      
      if (existingFoods) {
        const consumedFoods = JSON.parse(existingFoods);
        consumedFoods[today] = [];
        await AsyncStorage.setItem(foodsKey, JSON.stringify(consumedFoods));
      }
      
      // Reset daily totals
      const totalsKey = getDailyTotalsKey(userId);
      const existingTotals = await AsyncStorage.getItem(totalsKey);
      
      if (existingTotals) {
        const dailyTotals = JSON.parse(existingTotals);
        dailyTotals[today] = {
          calories: 0,
          protein: 0,
          fat: 0,
          carbs: 0
        };
        await AsyncStorage.setItem(totalsKey, JSON.stringify(dailyTotals));
      }
      
      return true;
    } catch (error) {
      console.error('Error resetting today\'s data:', error);
      return false;
    }
  }
}

// Export a singleton instance
const consumedFoodService = new ConsumedFoodService();
export default consumedFoodService; 