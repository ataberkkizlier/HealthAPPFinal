import axios from 'axios';
import { Platform } from 'react-native';

/**
 * A fallback service for food data when FatSecret API is unavailable
 * Uses the free and publicly accessible Edamam API
 */
class FallbackFoodService {
  constructor() {
    // Edamam API credentials - these are sample API credentials with very low rate limits
    // For production, you should register for your own at https://developer.edamam.com/
    this.APP_ID = 'a72f25d6';
    this.APP_KEY = 'fa3c40b9139f9fb0b44bafb561b38d4d';
    this.baseURL = 'https://api.edamam.com/api/food-database/v2/parser';
  }

  /**
   * Search for foods using the fallback API
   * @param {string} query - The search query
   * @param {number} page - Page number (not used in Edamam API)
   * @param {number} maxResults - Maximum number of results
   * @returns {Promise<Array>} - Array of food items
   */
  async searchFoods(query, page = 0, maxResults = 20) {
    try {
      console.log('Using fallback food search service with query:', query);
      
      // Format the request URL with parameters
      const response = await axios.get(this.baseURL, {
        params: {
          app_id: this.APP_ID,
          app_key: this.APP_KEY,
          ingr: query,
          "nutrition-type": "cooking"
        }
      });
      
      console.log('Fallback search response status:', response.status);
      
      if (response.data && response.data.hints) {
        const foods = response.data.hints
          .slice(0, maxResults)
          .map(item => this.mapToFatSecretFormat(item));
          
        console.log(`Found ${foods.length} foods from fallback API`);
        return foods;
      }
      
      return [];
    } catch (error) {
      console.error('Error in fallback food search:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data).substring(0, 200));
      }
      
      // Return empty array if there's an error
      return [];
    }
  }
  
  /**
   * Map Edamam API food format to FatSecret-like format for compatibility
   * @param {Object} item - Edamam food item
   * @returns {Object} - Formatted food item
   */
  mapToFatSecretFormat(item) {
    const food = item.food;
    const nutrients = food.nutrients || {};
    
    // Build serving information - convert to FatSecret-compatible format
    const serving = {
      serving_id: '0',
      serving_description: '100g',
      serving_url: '',
      metric_serving_amount: 100,
      metric_serving_unit: 'g',
      calories: Math.round(nutrients.ENERC_KCAL || 0),
      protein: Math.round((nutrients.PROCNT || 0) * 10) / 10,
      fat: Math.round((nutrients.FAT || 0) * 10) / 10,
      carbohydrate: Math.round((nutrients.CHOCDF || 0) * 10) / 10
    };
    
    // Return in FatSecret-compatible format
    return {
      food_id: food.foodId,
      food_name: food.label,
      food_description: `${Math.round(nutrients.ENERC_KCAL || 0)} cal per 100g`,
      food_type: "Generic",
      food_url: food.image || '',
      servings: {
        serving: serving
      }
    };
  }
  
  /**
   * Get detailed food information
   * @param {string} foodId - The food ID
   * @returns {Promise<Object>} - Food details
   */
  async getFoodDetails(foodId) {
    try {
      console.log('Getting food details from fallback API for ID:', foodId);
      
      // For the Edamam API, we need to perform a new search since direct lookup requires 
      // additional paid features. This is a simplified implementation.
      const response = await axios.get(`https://api.edamam.com/api/food-database/v2/parser`, {
        params: {
          app_id: this.APP_ID,
          app_key: this.APP_KEY,
          ingr: foodId,
          "nutrition-type": "cooking"
        }
      });
      
      if (response.data && response.data.hints && response.data.hints.length > 0) {
        // Find the matching food by ID
        const match = response.data.hints.find(item => item.food.foodId === foodId);
        if (match) {
          return this.mapToFatSecretFormat(match);
        }
      }
      
      throw new Error('Food not found in fallback API');
    } catch (error) {
      console.error('Error getting food details from fallback API:', error.message);
      throw error;
    }
  }
  
  /**
   * Test the connection to the fallback API
   * @returns {Promise<boolean>} - Whether the connection test passed
   */
  async testConnection() {
    try {
      console.log('Testing fallback API connection...');
      
      const response = await axios.get(this.baseURL, {
        params: {
          app_id: this.APP_ID,
          app_key: this.APP_KEY,
          ingr: 'apple'
        }
      });
      
      const success = response.status === 200 &&
                      response.data && 
                      response.data.hints && 
                      response.data.hints.length > 0;
                      
      console.log(`Fallback API test ${success ? 'successful' : 'failed'}`);
      return success;
    } catch (error) {
      console.error('Fallback API test failed:', error.message);
      return false;
    }
  }
}

// Export a singleton instance
const fallbackFoodService = new FallbackFoodService();
export default fallbackFoodService; 