// Recommended Realtime Database Rules for your app

/*
Firebase Realtime Database Rules Documentation:
https://firebase.google.com/docs/database/security

For your healthApp project, you need to set appropriate rules in your Firebase console:
1. Go to https://console.firebase.google.com/u/0/project/healthapp-ba6b2/database/healthapp-ba6b2-default-rtdb/rules
2. Replace the rules with one of the options below
*/

// The current issue with your database showing "null" could be because:
// 1. Your database rules are too restrictive (not allowing read/write)
// 2. No data has been written to the database yet
// 3. Your database URL is incorrect in the config
// 4. The database initialization is failing

// For development/testing, you can use these permissive rules (NOT for production):
export const devRules = `{
  "rules": {
    ".read": true,
    ".write": true
  }
}`;

// For production, use rules like these which are more secure:
export const productionRules = `{
  "rules": {
    "users": {
      "$uid": {
        // Only authenticated users can read/write their own data
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "health_data": {
      "$uid": {
        // Users can only access their own health data
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "public_data": {
      // Public data that all authenticated users can read
      ".read": "auth != null",
      ".write": false
    }
  }
}`;

// Recommended steps to fix your database:
export const fixSteps = [
  "1. First enable read/write permissions using the dev rules temporarily",
  "2. Run the database tests to write some initial data",
  "3. Verify in the Firebase console that data appears",
  "4. Implement proper authentication",
  "5. Switch to production rules once your app is working"
];

// Export a function to display these in the app
export const getDatabaseRulesHelp = () => {
  return {
    devRules,
    productionRules,
    fixSteps,
    helpText: "If your database shows 'null', you likely need to enable read/write permissions in your Firebase console and then write initial data.",
    consoleUrl: "https://console.firebase.google.com/u/0/project/healthapp-ba6b2/database/healthapp-ba6b2-default-rtdb/rules"
  };
};

export default getDatabaseRulesHelp; 