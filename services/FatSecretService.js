import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// FatSecret API credentials
const CLIENT_ID = '8eafecd78e9641b893b2e2d877bf8498';
const CLIENT_SECRET = '9bf487ee44444d9ca090b959d3191edc';

// Token storage key
const TOKEN_STORAGE_KEY = '@fatsecret_access_token';

/**
 * Service for interacting with the FatSecret API
 * 
 * NOTE: The FatSecret API requires IP whitelisting.
 * To use this service in production, you must:
 * 1. Log into your FatSecret Developer account
 * 2. Go to the Application Management page
 * 3. Add your server/device IP address to the whitelist
 * 
 * The IP address of your current device is logged during initialization
 * and can be accessed via the ipAddress property of this service.
 */
class FatSecretService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
    // REST API v3 endpoints
    this.baseURL = 'https://platform.fatsecret.com/rest/server.api';
    this.ipAddress = null;
  }

  // Initialize the service with a stored token if available
  async initialize() {
    try {
      // Check IP address to help with debugging whitelist issues
      await this.checkIP();
      
      console.log('Platform:', Platform.OS, Platform.Version);
      
      const tokenData = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (tokenData) {
        const { token, expiry } = JSON.parse(tokenData);
        const currentTime = new Date().getTime();
        
        if (currentTime < expiry) {
          this.accessToken = token;
          this.tokenExpiry = expiry;
          console.log('Restored saved FatSecret token');
          console.log('Token expires in:', Math.round((expiry - currentTime) / 1000 / 60), 'minutes');
          return;
        } else {
          console.log('Saved token expired, fetching new token');
        }
      }
      
      // Get a new token if none exists or it's expired
      await this.getAccessToken();
    } catch (error) {
      console.error('Error initializing FatSecret service:', error);
    }
  }
  
  // Check IP address for whitelist debugging
  async checkIP() {
    try {
      // Get external IP address
      const externalIPResponse = await axios.get('https://api.ipify.org?format=json');
      this.ipAddress = externalIPResponse.data.ip;
      console.log('External IP address (for FatSecret whitelist):', this.ipAddress);
      
      // Try to get local device info as well
      console.log('Platform info:', Platform.OS, Platform.Version);
      
      // For development purposes, let's track possible simulator/emulator usage
      if (Platform.OS === 'ios') {
        const isSimulator = Platform.constants.systemName.includes('Simulator');
        console.log('Is iOS Simulator:', isSimulator);
        console.log('systemName:', Platform.constants.systemName);
      } else if (Platform.OS === 'android') {
        const isEmulator = Platform.constants.Brand === 'google' && Platform.constants.Manufacturer.includes('Genymotion');
        console.log('Likely Android Emulator:', isEmulator);
      }
      
      console.log('Important: The external IP above must be whitelisted in your FatSecret developer account.');
      console.log('If testing on a simulator/emulator, this is your computer\'s IP address.');
      console.log('If using a real device on WiFi, this is your network\'s external IP.');
      
      return this.ipAddress;
    } catch (error) {
      console.error('Unable to determine IP address:', error.message);
      return null;
    }
  }

  // Get an OAuth 2.0 access token
  async getAccessToken() {
    try {
      console.log('Requesting new access token from FatSecret API');
      
      // Try with basic scope only, which has less restrictions
      const response = await axios({
        method: 'post',
        url: 'https://oauth.fatsecret.com/connect/token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        auth: {
          username: CLIENT_ID,
          password: CLIENT_SECRET
        },
        data: 'grant_type=client_credentials&scope=basic'
      });

      this.accessToken = response.data.access_token;
      // Calculate expiry time (response.data.expires_in is in seconds)
      this.tokenExpiry = new Date().getTime() + (response.data.expires_in * 1000);
      
      // Store the token for future use
      await AsyncStorage.setItem(
        TOKEN_STORAGE_KEY,
        JSON.stringify({
          token: this.accessToken,
          expiry: this.tokenExpiry
        })
      );
      
      // Check if token has proper scope
      if (response.data.scope) {
        console.log('Token scope:', response.data.scope);
      } else {
        console.warn('No scope information in token response. Make sure your FatSecret developer app is configured correctly.');
      }
      
      console.log('New FatSecret token acquired successfully');
      console.log('Token expires in:', Math.round(response.data.expires_in / 60), 'minutes');
      return this.accessToken;
    } catch (error) {
      console.error('Error getting FatSecret access token:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data));
        
        // Enhanced error handling for invalid_scope
        if (error.response.data && error.response.data.error === 'invalid_scope') {
          console.error('SCOPE ERROR: The app is requesting scopes that are not authorized for this API key.');
          console.error('Please verify that the FatSecret API key has been granted the "basic" scope.');
          console.error('This is usually configured in the FatSecret developer console.');
        }
      }
      throw error;
    }
  }

  // Ensure we have a valid token before making API requests
  async ensureValidToken() {
    const currentTime = new Date().getTime();
    
    // If token is missing or expired, get a new one
    if (!this.accessToken || !this.tokenExpiry || currentTime >= this.tokenExpiry) {
      await this.getAccessToken();
    } else {
      console.log('Using existing token, expires in:', Math.round((this.tokenExpiry - currentTime) / 1000 / 60), 'minutes');
    }
  }

  // Search foods by name
  async searchFoods(query, page = 0, maxResults = 20) {
    try {
      await this.ensureValidToken();
      
      console.log('Searching for foods with query:', query);
      console.log('Using FatSecret endpoint:', this.baseURL);
      
      // Format parameters exactly as specified in the documentation
      const requestData = new URLSearchParams({
        method: 'foods.search',
        search_expression: query,
        page_number: page,
        max_results: maxResults,
        format: 'json'
      }).toString();
      
      console.log('Request data:', requestData);
      console.log('Authorization header:', `Bearer ${this.accessToken.substring(0, 10)}...`);
      
      // Make the request using the exact format specified in documentation
      const response = await axios({
        method: 'post',  // API requires POST method
        url: this.baseURL,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: requestData
      });
      
      console.log('Search response status:', response.status);
      
      if (response.data) {
        console.log('Response data structure:', JSON.stringify(Object.keys(response.data || {})));
      
        // Handle the response according to the API documentation format
        if (response.data && response.data.foods && response.data.foods.food) {
          // API returns single object for one result, array for multiple
          const foods = Array.isArray(response.data.foods.food) 
            ? response.data.foods.food 
            : [response.data.foods.food];
          console.log(`Found ${foods.length} foods from API`);
          return foods;
        } else if (response.data && response.data.foods && response.data.foods.total_results === 0) {
          console.log('No search results found from API');
          return [];
        } else if (response.data && response.data.error) {
          console.error('API returned an error:', response.data.error.message || JSON.stringify(response.data.error));
          throw new Error(response.data.error.message || 'API Error');
        }
      }
      
      // If we reach here, the API didn't return foods in the expected format
      console.log('Unexpected response format - no foods found');
      console.log('Full response data:', JSON.stringify(response.data).substring(0, 500));
      return [];
    } catch (error) {
      console.error('Error searching foods:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data).substring(0, 200));
      } else if (error.request) {
        console.error('No response received from server');
        console.error('Request details:', JSON.stringify(error.request).substring(0, 200));
      } else {
        console.error('Error setting up request:', error.message);
      }
      
      // Check if this might be a whitelist issue
      if (error.message && error.message.includes('401') && this.ipAddress) {
        console.error(`This may be an IP whitelist issue. Make sure ${this.ipAddress} is whitelisted in your FatSecret account.`);
      }
      
      throw error;
    }
  }

  // Get detailed food information
  async getFoodDetails(foodId) {
    try {
      if (!foodId) {
        console.error('No food ID provided to getFoodDetails');
        throw new Error('Missing food ID');
      }

      // Ensure foodId is a string
      const foodIdStr = String(foodId);
      console.log('Processing food ID:', foodIdStr, 'Type:', typeof foodIdStr);

      await this.ensureValidToken();
      
      console.log('Getting food details for ID:', foodIdStr);
      console.log('Using FatSecret endpoint:', this.baseURL);
      
      // Format parameters exactly as specified in the documentation
      const requestData = new URLSearchParams({
        method: 'food.get.v2',
        food_id: foodIdStr,
        format: 'json'
      }).toString();
      
      console.log('Request data:', requestData);
      console.log('Authorization header:', `Bearer ${this.accessToken.substring(0, 10)}...`);
      
      // Make the request using the exact format specified in documentation
      const response = await axios({
        method: 'post',  // API requires POST method
        url: this.baseURL,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: requestData
      });
      
      console.log('Food details response status:', response.status);
      
      if (response.data) {
        console.log('Response data structure:', JSON.stringify(Object.keys(response.data || {})));
      
        if (response.data && response.data.food) {
          console.log('Successfully retrieved food details for:', response.data.food.food_name);
          return response.data.food;
        } else if (response.data && response.data.error) {
          console.error('API returned an error:', response.data.error.message || JSON.stringify(response.data.error));
          throw new Error(response.data.error.message || 'API Error');
        }
      }
      
      console.log('Failed to retrieve food details');
      console.log('Full response data:', JSON.stringify(response.data).substring(0, 500));
      throw new Error('Food details not available');
    } catch (error) {
      console.error('Error getting food details:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data).substring(0, 200));
      } else if (error.request) {
        console.error('No response received from server');
        console.error('Request details:', JSON.stringify(error.request).substring(0, 200));
      } else {
        console.error('Error setting up request:', error.message);
      }
      
      // Check if this might be a whitelist issue
      if (error.message && error.message.includes('401') && this.ipAddress) {
        console.error(`This may be an IP whitelist issue. Make sure ${this.ipAddress} is whitelisted in your FatSecret account.`);
      }
      
      throw error;
    }
  }

  // For diagnosing API issues - test the connection with a simple call
  async testConnection() {
    try {
      await this.ensureValidToken();
      
      console.log('Running API connection test...');
      console.log('Endpoint:', this.baseURL);
      console.log('Token available:', !!this.accessToken);
      console.log('IP Address:', this.ipAddress);
      
      // Use a simple method to test connectivity
      const requestData = new URLSearchParams({
        method: 'foods.search',
        search_expression: 'apple',
        max_results: 1,
        format: 'json'
      }).toString();
      
      console.log('Test request data:', requestData);
      
      const response = await axios({
        method: 'post',
        url: this.baseURL,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: requestData
      });
      
      console.log('Test response status:', response.status);
      console.log('Response data keys:', Object.keys(response.data || {}));
      
      if (response.data && response.data.foods) {
        console.log('API connection test successful!');
        if (response.data.foods.food) {
          console.log('Sample food returned:', 
            Array.isArray(response.data.foods.food) 
              ? response.data.foods.food[0].food_name 
              : response.data.foods.food.food_name
          );
        } else {
          console.log('No food items in test response, but connection worked');
        }
        return true;
      } else if (response.data && response.data.error) {
        console.error('API test returned an error:', 
          response.data.error.message || JSON.stringify(response.data.error)
        );
        return false;
      }
      
      console.log('Unexpected test response format:', JSON.stringify(response.data).substring(0, 200));
      return false;
    } catch (error) {
      console.error('API connection test failed:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data).substring(0, 200));
        
        // Enhanced diagnostics for common errors
        if (error.response.status === 401) {
          console.error('AUTHENTICATION ERROR: This is likely due to either:');
          console.error('1. Invalid API credentials (CLIENT_ID/CLIENT_SECRET)');
          console.error('2. IP whitelist restrictions - Make sure your IP address is whitelisted');
          console.error(`Current IP: ${this.ipAddress} - Add this to your FatSecret developer console`);
          console.error('Note: IP whitelist changes can take up to 24 hours to fully propagate');
        } else if (error.response.data && error.response.data.error === 'invalid_scope') {
          console.error('SCOPE ERROR: The application is requesting unauthorized scopes');
          console.error('Please check your FatSecret developer account and ensure your app has the basic scope');
        }
      } else if (error.request) {
        console.error('No response received during test - possibly a network connectivity issue');
      }
      return false;
    }
  }
}

// Export a singleton instance
const fatSecretService = new FatSecretService();
export default fatSecretService; 