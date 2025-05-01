import axios from 'axios';
import { Alert, Platform } from 'react-native';
import fatSecretService from './FatSecretService';
import fallbackFoodService from './FallbackFoodService';

/**
 * A utility to diagnose FatSecret API issues
 */
class FatSecretDiagnostic {
  /**
   * Run a full diagnostic test on the FatSecret API connection
   * @returns {Promise<Object>} Test results
   */
  async runDiagnostics() {
    console.log('Starting nutrition API diagnostics...');
    const results = {
      success: false,
      ipAddress: null,
      deviceInfo: null,
      connectionTest: false,
      primaryApi: {
        authTest: false,
        scopeTest: false,
        searchTest: false,
        errors: []
      },
      fallbackApi: {
        connectionTest: false,
        searchTest: false,
        errors: []
      },
      errors: [],
      rawResponses: [],
      recommendedActions: []
    };

    try {
      // 1. Collect device info
      results.deviceInfo = this.getDeviceInfo();
      console.log('Device info:', results.deviceInfo);
      
      // 2. Get IP address
      try {
        results.ipAddress = await this.checkIP();
        console.log('IP address:', results.ipAddress);
      } catch (error) {
        results.errors.push(`Failed to determine IP address: ${error.message}`);
      }
      
      // 3. Test basic internet connectivity
      try {
        await this.testInternetConnection();
        results.connectionTest = true;
        console.log('Internet connection test: PASSED');
      } catch (error) {
        results.errors.push(`Internet connectivity issue: ${error.message}`);
        console.log('Internet connection test: FAILED');
      }
      
      // 4. Test primary API (FatSecret)
      await this.testPrimaryApi(results);
      
      // 5. Test fallback API
      await this.testFallbackApi(results);
      
      // Overall success - if either API works, we can provide nutrition data
      results.success = results.connectionTest && 
                        (
                          (results.primaryApi.authTest && 
                           results.primaryApi.scopeTest && 
                           results.primaryApi.searchTest) 
                          || 
                          (results.fallbackApi.connectionTest && 
                           results.fallbackApi.searchTest)
                        );
      
      // Provide recommendations based on the test results
      this.generateRecommendations(results);
      
    } catch (error) {
      results.errors.push(`General diagnostic error: ${error.message}`);
    }
    
    console.log('Diagnostic results:', results);
    return results;
  }
  
  /**
   * Test the primary API (FatSecret)
   */
  async testPrimaryApi(results) {
    // 4a. Test auth endpoint
    try {
      const authResult = await this.testAuthEndpoint();
      results.rawResponses.push(authResult);
      results.primaryApi.authTest = true;
      console.log('Primary API auth test: PASSED');
    } catch (error) {
      results.primaryApi.errors.push(`Auth endpoint issue: ${error.message}`);
      console.log('Primary API auth test: FAILED');
      
      // Check for specific errors
      if (error.response) {
        if (error.response.status === 401) {
          results.recommendedActions.push(
            'Primary API authentication failed. This is likely due to IP whitelist restrictions.'
          );
          results.recommendedActions.push(
            `Ensure your IP address (${results.ipAddress}) is whitelisted in the FatSecret developer console.`
          );
          results.recommendedActions.push(
            'Note that IP whitelist changes can take up to 24 hours to fully propagate.'
          );
        } else if (error.response.data && error.response.data.error === 'invalid_scope') {
          results.recommendedActions.push(
            'The app is requesting scopes that are not authorized for this API key.'
          );
          results.recommendedActions.push(
            'Verify that your FatSecret API key has been granted the "basic" scope.'
          );
        }
      }
      
      // Don't proceed with further primary API tests if auth fails
      return;
    }
    
    // 4b. Check token scope
    try {
      const scopeResult = await this.checkTokenScope();
      results.primaryApi.scopeTest = scopeResult.success;
      console.log('Primary API token scope test:', results.primaryApi.scopeTest ? 'PASSED' : 'FAILED');
      
      if (!scopeResult.success) {
        results.primaryApi.errors.push(`Scope issue: ${scopeResult.error}`);
        results.recommendedActions.push(
          'Your API key is missing required scopes. In the FatSecret developer console, ' +
          'ensure your application has the "basic" scope authorized.'
        );
      }
    } catch (error) {
      results.primaryApi.errors.push(`Scope check error: ${error.message}`);
    }
    
    // 4c. Test search endpoint
    try {
      const searchResult = await fatSecretService.searchFoods('apple', 0, 1);
      results.primaryApi.searchTest = (searchResult && searchResult.length > 0);
      console.log('Primary API search test:', results.primaryApi.searchTest ? 'PASSED' : 'FAILED');
      
      if (!results.primaryApi.searchTest) {
        results.primaryApi.errors.push('Search returned no results');
      }
    } catch (error) {
      results.primaryApi.errors.push(`Search test error: ${error.message}`);
      console.log('Primary API search test: FAILED');
    }
  }
  
  /**
   * Test the fallback API
   */
  async testFallbackApi(results) {
    // 5a. Test fallback API connection
    try {
      const fallbackConnected = await fallbackFoodService.testConnection();
      results.fallbackApi.connectionTest = fallbackConnected;
      console.log('Fallback API connection test:', fallbackConnected ? 'PASSED' : 'FAILED');
      
      if (!fallbackConnected) {
        results.fallbackApi.errors.push('Fallback API connection failed');
      }
    } catch (error) {
      results.fallbackApi.errors.push(`Fallback API connection error: ${error.message}`);
      console.log('Fallback API connection test: FAILED');
      return;
    }
    
    // 5b. Test fallback API search functionality
    try {
      const searchResult = await fallbackFoodService.searchFoods('apple', 0, 1);
      results.fallbackApi.searchTest = (searchResult && searchResult.length > 0);
      console.log('Fallback API search test:', results.fallbackApi.searchTest ? 'PASSED' : 'FAILED');
      
      if (!results.fallbackApi.searchTest) {
        results.fallbackApi.errors.push('Fallback search returned no results');
      }
    } catch (error) {
      results.fallbackApi.errors.push(`Fallback search error: ${error.message}`);
      console.log('Fallback API search test: FAILED');
    }
  }
  
  /**
   * Generate recommendations based on test results
   */
  generateRecommendations(results) {
    // If primary API failed but fallback succeeded
    if ((!results.primaryApi.authTest || !results.primaryApi.searchTest) && 
        results.fallbackApi.connectionTest && results.fallbackApi.searchTest) {
      results.recommendedActions.push(
        'The app is using the fallback nutrition API, which is working correctly.'
      );
      
      // If primary API failed authentication specifically
      if (!results.primaryApi.authTest) {
        results.recommendedActions.push(
          'The primary API (FatSecret) authentication failed, but the app will continue to use the fallback API.'
        );
      }
    }
    
    // If both APIs failed
    if ((!results.primaryApi.authTest || !results.primaryApi.searchTest) && 
        (!results.fallbackApi.connectionTest || !results.fallbackApi.searchTest)) {
      results.recommendedActions.push(
        'Both nutrition APIs are currently unavailable. The app will use its built-in offline database.'
      );
      
      // If connected to internet but APIs failed
      if (results.connectionTest) {
        results.recommendedActions.push(
          'Your internet connection is working, but the nutrition databases could not be accessed. ' +
          'This may be a temporary issue - please try again later.'
        );
      } else {
        results.recommendedActions.push(
          'Check your internet connection to access online nutrition databases.'
        );
      }
    }
    
    // If everything is working great
    if (results.primaryApi.authTest && results.primaryApi.searchTest) {
      results.recommendedActions.push(
        'The primary nutrition API is working correctly!'
      );
    }
  }
  
  /**
   * Get device information
   */
  getDeviceInfo() {
    return {
      platform: Platform.OS,
      version: Platform.Version,
      constants: Platform.constants
    };
  }
  
  /**
   * Check IP address
   */
  async checkIP() {
    try {
      const response = await axios.get('https://api.ipify.org?format=json');
      return response.data.ip;
    } catch (error) {
      console.error('IP check error:', error);
      throw error;
    }
  }
  
  /**
   * Test basic internet connectivity
   */
  async testInternetConnection() {
    try {
      await axios.get('https://www.google.com');
      return true;
    } catch (error) {
      console.error('Internet connection test failed:', error);
      throw error;
    }
  }
  
  /**
   * Test FatSecret auth endpoint
   */
  async testAuthEndpoint() {
    try {
      // Extract credentials from the FatSecret service
      const CLIENT_ID = '8eafecd78e9641b893b2e2d877bf8498';
      const CLIENT_SECRET = '9bf487ee44444d9ca090b959d3191edc';
      
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
      
      return response.data;
    } catch (error) {
      console.error('Auth endpoint test failed:', error);
      throw error;
    }
  }
  
  /**
   * Check if the token has the required scopes
   */
  async checkTokenScope() {
    try {
      // Need to ensure we have a token
      await fatSecretService.ensureValidToken();
      
      // Extract token from service
      if (!fatSecretService.accessToken) {
        return { success: false, error: 'No access token available' };
      }
      
      // We need to decode the JWT to check its scopes
      // But since we don't want to add a JWT library, we'll do a simple check
      // For a proper implementation, you should add a JWT decoder
      
      // Here we're just checking if the search API works with the token
      // If it works, we have sufficient scope
      const testSearch = await fatSecretService.searchFoods('apple', 0, 1);
      return { success: true };
    } catch (error) {
      console.error('Token scope check failed:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Display diagnostic results
   */
  displayResults(results) {
    if (!results) {
      Alert.alert('Diagnostic Error', 'Failed to run diagnostics');
      return;
    }
    
    // Build a user-friendly message
    let message = '';
    
    // Show status of each test
    message += `Device: ${results.deviceInfo?.platform} ${results.deviceInfo?.version}\n`;
    message += `Your IP: ${results.ipAddress || 'Unknown'}\n\n`;
    message += `Internet Connection: ${results.connectionTest ? '✓' : '✗'}\n\n`;
    
    // Primary API results
    message += `PRIMARY API (FatSecret):\n`;
    message += `- Authentication: ${results.primaryApi.authTest ? '✓' : '✗'}\n`;
    message += `- Permissions: ${results.primaryApi.scopeTest ? '✓' : '✗'}\n`;
    message += `- Search: ${results.primaryApi.searchTest ? '✓' : '✗'}\n\n`;
    
    // Fallback API results
    message += `FALLBACK API:\n`;
    message += `- Connection: ${results.fallbackApi.connectionTest ? '✓' : '✗'}\n`;
    message += `- Search: ${results.fallbackApi.searchTest ? '✓' : '✗'}\n\n`;
    
    // Overall status
    message += `OVERALL STATUS: ${results.success ? 'NUTRITION DATA AVAILABLE' : 'USING OFFLINE DATABASE'}\n\n`;
    
    // Show recommendations
    if (results.recommendedActions.length > 0) {
      message += 'Recommendations:\n';
      results.recommendedActions.forEach((action, index) => {
        message += `${index + 1}. ${action}\n`;
      });
    }
    
    // Show overall result
    const title = results.success ? 
      'Nutrition APIs Diagnostic' : 
      'Nutrition APIs Unavailable';
    
    Alert.alert(
      title,
      message,
      [{ text: 'OK' }]
    );
  }
  
  /**
   * Run diagnostics and display results
   */
  async runAndDisplayDiagnostics() {
    try {
      // Show a loading message
      Alert.alert(
        'Running Diagnostics',
        'Testing connection to FatSecret API...'
      );
      
      const results = await this.runDiagnostics();
      this.displayResults(results);
      return results;
    } catch (error) {
      console.error('Error running diagnostics:', error);
      Alert.alert(
        'Diagnostic Error',
        `Failed to complete diagnostics: ${error.message}`
      );
    }
  }
}

// Export a singleton instance
const fatSecretDiagnostic = new FatSecretDiagnostic();
export default fatSecretDiagnostic; 