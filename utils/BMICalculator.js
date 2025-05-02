/**
 * BMI Calculator and Nutrition Recommendation Utility
 * 
 * Based on medical guidelines from:
 * - World Health Organization (WHO)
 * - American Dietetic Association
 * - National Institutes of Health (NIH)
 * - Academy of Nutrition and Dietetics
 */

// BMI Categories
export const BMI_CATEGORIES = {
  UNDERWEIGHT: 'underweight',
  NORMAL: 'normal',
  OVERWEIGHT: 'overweight',
  OBESE: 'obese',
  SEVERELY_OBESE: 'severely_obese'
};

// BMI thresholds according to WHO guidelines
const BMI_THRESHOLDS = {
  UNDERWEIGHT: 18.5,
  NORMAL_MAX: 24.9,
  OVERWEIGHT_MAX: 29.9,
  OBESE_MAX: 34.9
};

/**
 * Calculate BMI using weight in kg and height in cm
 * @param {number} weightKg Weight in kilograms
 * @param {number} heightCm Height in centimeters
 * @returns {number} BMI value (rounded to 1 decimal place)
 */
export const calculateBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) {
    return 0;
  }
  
  // Convert height from cm to meters
  const heightM = heightCm / 100;
  
  // BMI formula: weight(kg) / height(m)²
  const bmi = weightKg / (heightM * heightM);
  
  // Round to 1 decimal place
  return Math.round(bmi * 10) / 10;
};

/**
 * Get BMI category based on BMI value
 * @param {number} bmi BMI value
 * @returns {string} BMI category
 */
export const getBMICategory = (bmi) => {
  if (bmi < BMI_THRESHOLDS.UNDERWEIGHT) {
    return BMI_CATEGORIES.UNDERWEIGHT;
  } else if (bmi <= BMI_THRESHOLDS.NORMAL_MAX) {
    return BMI_CATEGORIES.NORMAL;
  } else if (bmi <= BMI_THRESHOLDS.OVERWEIGHT_MAX) {
    return BMI_CATEGORIES.OVERWEIGHT;
  } else if (bmi <= BMI_THRESHOLDS.OBESE_MAX) {
    return BMI_CATEGORIES.OBESE;
  } else {
    return BMI_CATEGORIES.SEVERELY_OBESE;
  }
};

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
 * @param {number} weightKg Weight in kilograms
 * @param {number} heightCm Height in centimeters
 * @param {number} age Age in years
 * @param {string} gender 'male' or 'female'
 * @returns {number} BMR in calories
 */
export const calculateBMR = (weightKg, heightCm, age, gender) => {
  if (!weightKg || !heightCm || !age || weightKg <= 0 || heightCm <= 0 || age <= 0) {
    return 0;
  }
  
  // Mifflin-St Jeor Equation
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  
  return Math.round(bmr);
};

/**
 * Calculate daily calorie needs based on BMR and activity level
 * @param {number} bmr Basal Metabolic Rate
 * @param {string} activityLevel Sedentary, Light, Moderate, Active, or Very Active
 * @returns {number} Daily calorie needs
 */
export const calculateDailyCalories = (bmr, activityLevel = 'moderate') => {
  if (!bmr || bmr <= 0) {
    return 0;
  }
  
  // Activity multipliers based on PAL (Physical Activity Level)
  const activityMultipliers = {
    sedentary: 1.2, // Little or no exercise
    light: 1.375, // Light exercise 1-3 days/week
    moderate: 1.55, // Moderate exercise 3-5 days/week
    active: 1.725, // Heavy exercise 6-7 days/week
    very_active: 1.9 // Very heavy exercise, physical job or training twice a day
  };
  
  const multiplier = activityMultipliers[activityLevel.toLowerCase()] || activityMultipliers.moderate;
  
  return Math.round(bmr * multiplier);
};

/**
 * Calculate daily nutrient goals based on calorie needs and BMI category
 * @param {number} dailyCalories Daily calorie needs
 * @param {string} bmiCategory BMI category (underweight, normal, overweight, obese, severely_obese)
 * @returns {Object} Protein, carbs, and fat goals in grams
 */
export const calculateNutrientGoals = (dailyCalories, bmiCategory) => {
  if (!dailyCalories || dailyCalories <= 0) {
    return { protein: 0, carbs: 0, fat: 0 };
  }
  
  // Default macronutrient distribution (based on Acceptable Macronutrient Distribution Range)
  let proteinPercentage = 0.2; // 20% of calories from protein
  let carbPercentage = 0.5; // 50% of calories from carbs
  let fatPercentage = 0.3; // 30% of calories from fat
  
  // Adjust macronutrient distribution based on BMI category
  switch (bmiCategory) {
    case BMI_CATEGORIES.UNDERWEIGHT:
      // Higher calories, more protein to build muscle
      proteinPercentage = 0.25; // 25%
      carbPercentage = 0.5; // 50%
      fatPercentage = 0.25; // 25%
      break;
      
    case BMI_CATEGORIES.NORMAL:
      // Balanced distribution
      proteinPercentage = 0.2; // 20%
      carbPercentage = 0.5; // 50%
      fatPercentage = 0.3; // 30%
      break;
      
    case BMI_CATEGORIES.OVERWEIGHT:
      // More protein, fewer carbs
      proteinPercentage = 0.25; // 25%
      carbPercentage = 0.45; // 45%
      fatPercentage = 0.3; // 30%
      break;
      
    case BMI_CATEGORIES.OBESE:
    case BMI_CATEGORIES.SEVERELY_OBESE:
      // Higher protein, lower carbs to preserve muscle while losing fat
      proteinPercentage = 0.3; // 30%
      carbPercentage = 0.4; // 40%
      fatPercentage = 0.3; // 30%
      break;
      
    default:
      // Use default values
      break;
  }
  
  // Calculate grams of each macronutrient
  // Protein: 4 calories per gram
  // Carbs: 4 calories per gram
  // Fat: 9 calories per gram
  const proteinCalories = dailyCalories * proteinPercentage;
  const carbCalories = dailyCalories * carbPercentage;
  const fatCalories = dailyCalories * fatPercentage;
  
  const proteinGrams = Math.round(proteinCalories / 4);
  const carbGrams = Math.round(carbCalories / 4);
  const fatGrams = Math.round(fatCalories / 9);
  
  return {
    protein: proteinGrams,
    carbs: carbGrams,
    fat: fatGrams
  };
};

/**
 * Get nutrition plan with daily calorie needs and nutrient goals
 * @param {number} weightKg Weight in kilograms
 * @param {number} heightCm Height in centimeters
 * @param {number} age Age in years
 * @param {string} gender 'male' or 'female'
 * @param {string} activityLevel Activity level (sedentary, light, moderate, active, very_active)
 * @returns {Object} Nutrition plan with BMI, category, calories, and nutrient goals
 */
export const getNutritionPlan = (weightKg, heightCm, age, gender, activityLevel = 'moderate') => {
  // Calculate BMI
  const bmi = calculateBMI(weightKg, heightCm);
  const bmiCategory = getBMICategory(bmi);
  
  // Calculate BMR and daily calorie needs
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const dailyCalories = calculateDailyCalories(bmr, activityLevel);
  
  // Calculate nutrient goals
  const nutrientGoals = calculateNutrientGoals(dailyCalories, bmiCategory);
  
  return {
    bmi,
    bmiCategory,
    bmr,
    dailyCalories,
    nutrientGoals
  };
};

/**
 * Get BMI status description and nutrition advice
 * @param {string} bmiCategory BMI category
 * @returns {Object} Status description and advice
 */
export const getBMIStatusInfo = (bmiCategory) => {
  switch (bmiCategory) {
    case BMI_CATEGORIES.UNDERWEIGHT:
      return {
        status: 'Underweight',
        description: 'Your BMI suggests you are underweight. This may indicate insufficient nutrients for optimal health.',
        advice: 'Focus on increasing calorie intake with nutrient-dense foods. Include healthy fats, proteins, and complex carbohydrates. Consider consulting with a healthcare provider.'
      };
      
    case BMI_CATEGORIES.NORMAL:
      return {
        status: 'Normal',
        description: 'Your BMI is within the normal/healthy range. This generally indicates a good balance of body weight to height.',
        advice: 'Maintain your healthy weight with a balanced diet and regular physical activity. Focus on nutrient-dense foods from all food groups.'
      };
      
    case BMI_CATEGORIES.OVERWEIGHT:
      return {
        status: 'Overweight',
        description: 'Your BMI suggests you are overweight. This may increase risk for certain health conditions.',
        advice: 'Consider moderate calorie reduction and increased physical activity. Focus on whole foods, lean proteins, and plenty of vegetables.'
      };
      
    case BMI_CATEGORIES.OBESE:
      return {
        status: 'Obese',
        description: 'Your BMI indicates obesity. This increases risk for many health conditions including heart disease and diabetes.',
        advice: 'Consider working with healthcare professionals to develop a weight management plan. Focus on gradual, sustainable lifestyle changes.'
      };
      
    case BMI_CATEGORIES.SEVERELY_OBESE:
      return {
        status: 'Severely Obese',
        description: 'Your BMI indicates severe obesity. This significantly increases health risks.',
        advice: 'Strongly consider consulting with healthcare professionals for tailored advice. Medically supervised weight loss may be recommended.'
      };
      
    default:
      return {
        status: 'Unknown',
        description: 'Unable to determine BMI category.',
        advice: 'Please consult with a healthcare professional for personalized advice.'
      };
  }
}; 