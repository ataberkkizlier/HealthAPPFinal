import AsyncStorage from '@react-native-async-storage/async-storage';

// Key for storing category tracking data
const CATEGORY_TRACKING_KEY = '@health_categories_tracking';

/**
 * Utility to track health categories and their reset status
 */
class CategoryTracker {
  /**
   * Get all tracked categories and their last reset timestamps
   * @returns {Promise<Object>} Object with category names as keys and timestamps as values
   */
  static async getTrackedCategories() {
    try {
      const data = await AsyncStorage.getItem(CATEGORY_TRACKING_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting tracked categories:', error);
      return {};
    }
  }

  /**
   * Update the last reset timestamp for a specific category
   * @param {string} categoryName The name of the category
   * @returns {Promise<void>}
   */
  static async updateCategoryReset(categoryName) {
    try {
      const categories = await this.getTrackedCategories();
      categories[categoryName] = Date.now();
      await AsyncStorage.setItem(CATEGORY_TRACKING_KEY, JSON.stringify(categories));
      console.log(`Updated reset timestamp for ${categoryName}:`, new Date().toISOString());
    } catch (error) {
      console.error(`Error updating reset timestamp for ${categoryName}:`, error);
    }
  }

  /**
   * Check if a category needs to be reset (if last reset was before today)
   * @param {string} categoryName The name of the category
   * @returns {Promise<boolean>} True if category needs reset, false otherwise
   */
  static async shouldResetCategory(categoryName) {
    try {
      const categories = await this.getTrackedCategories();
      const lastReset = categories[categoryName];
      
      // If category has never been reset, it should be reset
      if (!lastReset) {
        return true;
      }
      
      // Get today's date at midnight (00:00:00) in local time
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Convert timestamp to date and check if it's before today
      return new Date(lastReset) < today;
    } catch (error) {
      console.error(`Error checking reset status for ${categoryName}:`, error);
      return true; // Default to resetting if there's an error
    }
  }

  /**
   * Reset all categories that need to be reset
   * @param {Object} resetFunctions Object with category names as keys and reset functions as values
   * @returns {Promise<void>}
   */
  static async resetCategoriesIfNeeded(resetFunctions) {
    try {
      const categories = Object.keys(resetFunctions);
      
      for (const category of categories) {
        const shouldReset = await this.shouldResetCategory(category);
        
        if (shouldReset) {
          console.log(`Resetting category ${category}`);
          // Call the reset function for this category
          await resetFunctions[category]();
          // Update the reset timestamp
          await this.updateCategoryReset(category);
        } else {
          console.log(`Category ${category} does not need reset`);
        }
      }
    } catch (error) {
      console.error('Error in resetCategoriesIfNeeded:', error);
    }
  }
}

export default CategoryTracker; 