import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image } from 'react-native';
import React, { useState, useCallback, useMemo } from 'react';
import { COLORS, SIZES, icons, images } from '../constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-virtualized-view';
import { useTheme } from '../theme/ThemeProvider';
import { categories, recommendedDoctors } from '../data';
import SubHeaderItem from '../components/SubHeaderItem';
import HorizontalDoctorCard from '../components/HorizontalDoctorCard';
import { LinearGradient } from 'expo-linear-gradient';
import { useWaterIntake } from '../context/WaterIntakeContext';
import { useSteps } from '../context/StepsContext';
import { useWorkout } from '../context/WorkoutContext';
import { useNutrition } from '../context/NutritionContext';
import { useSleep } from '../context/SleepContext';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const MetricCard = React.memo(({
  icon,
  label,
  metric,
  unit,
  color,
  dark,
  value,
  onUpdate,
  navigation
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(String(value));

  React.useEffect(() => {
    if (!isFocused) {
      setLocalValue(String(value));
    }
  }, [value, isFocused]);

  console.log(`MetricCard (${label}) - value prop:`, value, 'localValue:', localValue);

  const handleBlur = () => {
    setIsFocused(false);
    onUpdate(metric, localValue);
  };

  const handleChange = (text) => {
    setLocalValue(text);
  };

  // Handle metric card press - navigate to corresponding screen
  const handlePress = () => {
    // Map metric to screen names
    const screenMapping = {
      'water': 'WaterIntake',
      'workout': 'Workout',
      'steps': 'Steps',
      'nutrition': 'Nutrition',
      'mental': 'MentalHealth',
      'sleep': 'Sleep'
    };

    if (screenMapping[metric] && navigation) {
      navigation.navigate(screenMapping[metric]);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.metricCard, {
        backgroundColor: dark ? COLORS.dark2 : COLORS.white,
        shadowColor: dark ? COLORS.white : COLORS.gray
      }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.metricHeader}>
        <Image
          source={icon}
          style={[styles.metricIcon, { tintColor: color }]}
        />
        <Text style={[styles.metricLabel, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>
          {label}
        </Text>
      </View>
      <View style={styles.metricValueContainer}>
        <TextInput
          style={[
            styles.metricInput,
            isFocused && styles.metricInputFocused,
            { color: color }
          ]}
          value={localValue}
          onChangeText={handleChange}
          keyboardType={metric === 'bloodPressure' ? 'default' : 'number-pad'}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder="0"
          placeholderTextColor={COLORS.gray}
          selectionColor={color}
          contextMenuHidden={true}
        />
        {unit && <Text style={[styles.metricUnit, { color: dark ? COLORS.gray : COLORS.greyscale700 }]}>{unit}</Text>}
      </View>
      {unit === '%' && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, {
            width: `${value}%`,
            backgroundColor: color
          }]} />
        </View>
      )}
    </TouchableOpacity>
  );
});

const Home = ({ navigation }) => {
  const { dark, colors } = useTheme();
  const { waterIntake, percentage, dailyGoal, updateWaterIntake } = useWaterIntake();
  const { steps, dailyGoal: stepsDailyGoal, updateSteps } = useSteps();
  const { workoutPercentage, updateWorkoutPercentage } = useWorkout();
  const { nutritionPercentage, updateNutritionPercentage } = useNutrition();
  const { sleepQualityPercentage, updateSleepQualityPercentage } = useSleep();
  const { user } = useAuth();
  const [healthMetrics, setHealthMetrics] = useState({
    mental: 0,
    bloodPressure: '120/80'
  });
  const [forceRender, setForceRender] = useState(0);

  useFocusEffect(
    useCallback(() => {
      console.log('Home screen focused, water intake:', waterIntake, 'percentage:', percentage, 'steps:', steps, 'workout:', workoutPercentage, 'nutrition:', nutritionPercentage, 'sleep:', sleepQualityPercentage);
      setForceRender(prev => prev + 1);
    }, [waterIntake, percentage, steps, workoutPercentage, nutritionPercentage, sleepQualityPercentage])
  );

  // Calculate steps percentage (similar to water intake percentage)
  const stepsPercentage = Math.min(100, (steps / stepsDailyGoal) * 100);

  // Define weights for each metric (total should be 100%)
  const weights = {
    nutrition: 0.20, // 20%
    workout: 0.20,  // 20%
    water: 0.15,    // 15%
    mental: 0.15,   // 15%
    sleep: 0.20,    // 20%
    steps: 0.10     // 10%
  };

  // Calculate weighted overall score
  const overallScore = Math.round(
    (nutritionPercentage * weights.nutrition) +
    (workoutPercentage * weights.workout) +
    (percentage * weights.water) +
    (healthMetrics.mental * weights.mental) +
    (sleepQualityPercentage * weights.sleep) +
    (stepsPercentage * weights.steps)
  );

  const updateMetric = useCallback((metric, value) => {
    if (metric === 'water') {
      const mlValue = Math.round((parseInt(value) || 0) * dailyGoal / 100);
      updateWaterIntake(mlValue);
      return;
    }

    if (metric === 'steps') {
      const stepValue = Math.min(50000, Math.max(0, parseInt(value) || 0));
      updateSteps(stepValue);
      return;
    }

    if (metric === 'workout') {
      const workoutValue = Math.min(100, Math.max(0, parseInt(value) || 0));
      updateWorkoutPercentage(workoutValue);
      return;
    }

    if (metric === 'nutrition') {
      const nutritionValue = Math.min(100, Math.max(0, parseInt(value) || 0));
      updateNutritionPercentage(nutritionValue);
      return;
    }

    if (metric === 'sleep') {
      const sleepValue = Math.min(100, Math.max(0, parseInt(value) || 0));
      updateSleepQualityPercentage(sleepValue);
      return;
    }

    let processedValue = value;
    if (metric === 'bloodPressure') {
      processedValue = value.replace(/[^0-9/]/g, '');
    } else {
      processedValue = Math.min(100, Math.max(0, parseInt(value) || 0));
    }

    setHealthMetrics(prev => ({
      ...prev,
      [metric]: processedValue
    }));
  }, [dailyGoal, updateWaterIntake, updateSteps, updateWorkoutPercentage, updateNutritionPercentage, updateSleepQualityPercentage]);

  const renderHeader = () => {
    const firstName = user ? user.displayName?.split(' ')[0] || user.email?.split('@')[0] : 'Guest';
    
    // Determine greeting based on time of day
    const hour = new Date().getHours();
    let greeting = 'Good Morning';
    
    if (hour >= 12 && hour < 18) {
      greeting = 'Good Afternoon';
    } else if (hour >= 18) {
      greeting = 'Good Evening';
    }

    // Get first letter of name for avatar placeholder
    const firstLetter = firstName ? firstName.charAt(0).toUpperCase() : 'G';
    
    // Generate a consistent color based on user email or name
    const colorSeed = user ? (user.email || user.uid || firstName) : 'guest';
    const colors = ['#FF9F1C', '#2EC4B6', '#3A86FF', '#8338EC', '#FF006E', '#8AC926', '#FF595E'];
    const colorIndex = [...colorSeed].reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    const avatarColor = colors[colorIndex];
    
    return (
      <View style={styles.headerContainer}>
        <View style={styles.viewLeft}>
          {user?.photoURL ? (
            <Image
              source={{ uri: user.photoURL }}
              resizeMode='cover'
              style={styles.userIcon}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarText}>{firstLetter}</Text>
            </View>
          )}
          <View style={styles.viewNameContainer}>
            <Text style={styles.greeeting}>{greeting}👋</Text>
            <Text style={[styles.title, {
              color: dark ? COLORS.white : COLORS.greyscale900
            }]}>{firstName}</Text>
          </View>
        </View>
        <View style={styles.viewRight}>
          <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>
            <Image
              source={icons.notificationBell2}
              resizeMode='contain'
              style={[styles.bellIcon, { tintColor: dark ? COLORS.white : COLORS.greyscale900 }]}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Favourite")}>
            <Image
              source={icons.heartOutline}
              resizeMode='contain'
              style={[styles.bookmarkIcon, { tintColor: dark ? COLORS.white : COLORS.greyscale900 }]}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSearchBar = () => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("Search")}
        style={[styles.searchBarContainer, {
          backgroundColor: dark ? COLORS.dark2 : COLORS.secondaryWhite
        }]}>
        <Image
          source={icons.search2}
          resizeMode='contain'
          style={styles.searchIcon}
        />
        <TextInput
          placeholder='Search'
          placeholderTextColor={COLORS.gray}
          style={styles.searchInput}
          onFocus={() => navigation.navigate('Search')}
        />
        <Image
          source={icons.filter}
          resizeMode='contain'
          style={styles.filterIcon}
        />
      </TouchableOpacity>
    );
  };

  const renderHealthMetrics = () => (
    <View style={styles.healthContainer}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight]}
        style={styles.scoreCircle}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.scoreText}>{overallScore}</Text>
        <Text style={styles.scoreLabel}>Overall Score</Text>
      </LinearGradient>

      <View style={styles.metricsGrid}>
        <MetricCard
          icon={icons.nutrition}
          label="Nutrition"
          metric="nutrition"
          unit="%"
          color="#FF9F1C"
          dark={dark}
          value={nutritionPercentage}
          onUpdate={updateMetric}
          navigation={navigation}
        />
        <MetricCard
          icon={icons.workout}
          label="Workout"
          metric="workout"
          unit="%"
          color="#2EC4B6"
          dark={dark}
          value={workoutPercentage}
          onUpdate={updateMetric}
          navigation={navigation}
        />
        <MetricCard
          icon={icons.water}
          label="Water Intake"
          metric="water"
          unit="%"
          color="#3A86FF"
          dark={dark}
          value={percentage}
          onUpdate={updateMetric}
          navigation={navigation}
        />
        <MetricCard
          icon={icons.mentalHealth}
          label="Mental Health"
          metric="mental"
          unit="%"
          color="#8338EC"
          dark={dark}
          value={healthMetrics.mental}
          onUpdate={updateMetric}
          navigation={navigation}
        />
        <MetricCard
          icon={icons.sleep}
          label="Sleep Quality"
          metric="sleep"
          unit="%"
          color="#FF006E"
          dark={dark}
          value={sleepQualityPercentage}
          onUpdate={updateMetric}
          navigation={navigation}
        />
        <MetricCard
          icon={icons.steps}
          label="Daily Steps"
          metric="steps"
          color="#8AC926"
          dark={dark}
          value={steps}
          onUpdate={updateMetric}
          navigation={navigation}
        />
        <MetricCard
          icon={icons.bloodPressure}
          label="Blood Pressure"
          metric="bloodPressure"
          color="#FF595E"
          dark={dark}
          value={healthMetrics.bloodPressure}
          onUpdate={updateMetric}
          navigation={navigation}
        />
      </View>
    </View>
  );

  const renderCategories = () => {
    const categoriesSlice = categories.slice(1, 9);
    
    return (
      <View>
        <SubHeaderItem
          title="Categories"
          navTitle="See all"
          onPress={() => navigation.navigate("Categories")}
        />
        <View style={styles.categoriesContainer}>
          {categoriesSlice.map((item, index) => (
            <TouchableOpacity
              key={index.toString()}
              style={styles.categoryItem}
              onPress={() => navigation.navigate(item.screen)}>
              <Image source={item.icon} style={styles.categoryIcon} />
              <Text style={styles.categoryText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderTopDoctors = () => {
    const [selectedCategory, setSelectedCategory] = useState("1");
    
    // Health metrics categories to match the image
    const doctorCategories = [
      { id: "1", name: "All" },
      { id: "2", name: "Nutrition" },
      { id: "3", name: "Workout" },
      { id: "4", name: "Water Intake" },
      { id: "5", name: "Mental Health" },
      { id: "6", name: "Sleep" },
      { id: "7", name: "Steps" },
      { id: "8", name: "Blood Pressure" },
      { id: "9", name: "Others" }
    ];

    // Filter doctors based on selected category
    const filteredDoctors = useMemo(() => {
      if (selectedCategory === "1") {
        // If "All" is selected, show all doctors
        return recommendedDoctors;
      }
      
      // Map UI category names to doctor type/speciality
      const categoryTypeMap = {
        "2": ["Nutritionist", "Dietitian"],
        "3": ["Physical Therapist", "Workout Specialist", "Fitness Trainer"],
        "4": ["Nephrologist", "General Practitioner"],
        "5": ["Psychiatrist", "Therapist"],
        "6": ["Sleep Specialist"],
        "7": ["Sports Medicine", "Fitness Trainer"],
        "8": ["Cardiologist"],
        "9": ["Specialist"]
      };
      
      const allowedTypes = categoryTypeMap[selectedCategory] || [];
      
      return recommendedDoctors.filter(doctor => 
        allowedTypes.includes(doctor.type) ||
        (doctor.speciality && allowedTypes.includes(doctor.speciality))
      );
    }, [selectedCategory]);

    return (
      <View>
        <SubHeaderItem
          title="Top Doctors"
          navTitle="See all"
          onPress={() => navigation.navigate("TopDoctors")}
        />
        <View style={styles.categoryFilterWrapper}>
          <FlatList
            horizontal
            data={doctorCategories}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.categoryFilter,
                  selectedCategory === item.id && styles.selectedCategoryFilter
                ]}
                onPress={() => setSelectedCategory(item.id)}>
                <Text style={[
                  styles.categoryFilterText,
                  selectedCategory === item.id && styles.selectedCategoryFilterText
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
        <View
          style={[styles.doctorsList, {
            backgroundColor: dark ? COLORS.dark1 : COLORS.secondaryWhite
          }]}
        >
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map(item => (
              <HorizontalDoctorCard
                key={item.id}
                {...item}
                onPress={() => navigation.navigate("DoctorDetails", { doctor: item })}
              />
            ))
          ) : (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>
                No doctors found in this category
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderSearchBar()}
          {renderHealthMetrics()}
          {renderCategories()}
          {renderTopDoctors()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

// Styles remain unchanged
const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.white
  },
  container: {
    flex: 1,
    padding: 16
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  userIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  viewLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  greeeting: {
    fontSize: 12,
    fontFamily: "regular",
    color: COLORS.gray,
    marginBottom: 4
  },
  title: {
    fontSize: 20,
    fontFamily: "bold",
    color: COLORS.greyscale900
  },
  viewNameContainer: {
    marginLeft: 12
  },
  viewRight: {
    flexDirection: "row",
    alignItems: "center"
  },
  bellIcon: {
    height: 24,
    width: 24,
    marginRight: 8,
    tintColor: COLORS.greyscale900
  },
  bookmarkIcon: {
    height: 24,
    width: 24,
    tintColor: COLORS.greyscale900
  },
  searchBarContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    height: 52,
    marginVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondaryWhite,
  },
  searchIcon: {
    height: 24,
    width: 24,
    tintColor: COLORS.gray
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "regular",
    marginHorizontal: 8,
    color: COLORS.greyscale900
  },
  filterIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.primary
  },
  healthContainer: {
    marginBottom: 24,
  },
  scoreCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 32,
    backgroundColor: COLORS.primary,
    borderWidth: 4,
    borderColor: '#E8F0FE',
    elevation: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
  },
  scoreText: {
    fontSize: 48,
    fontFamily: 'bold',
    color: COLORS.white,
    letterSpacing: -1,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  scoreLabel: {
    fontSize: 16,
    fontFamily: 'medium',
    color: COLORS.white,
    opacity: 0.95,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  metricCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    backgroundColor: COLORS.white,
    elevation: 3,
    shadowColor: COLORS.gray,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grayscale100,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  metricLabel: {
    fontSize: 14,
    fontFamily: 'medium',
    color: COLORS.greyscale900
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontFamily: 'bold',
    color: COLORS.greyscale900,
    marginRight: 4,
  },
  metricUnit: {
    fontSize: 16,
    fontFamily: 'regular',
    color: COLORS.gray,
    marginLeft: 2,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.grayscale100,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: SIZES.width / 4 - 16,
    marginVertical: 8,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  categoryText: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'regular',
    color: COLORS.greyscale900
  },
  categoryFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 4,
    borderColor: COLORS.primary,
    borderWidth: 1.3,
    borderRadius: 24,
    backgroundColor: COLORS.secondaryWhite,
  },
  selectedCategoryFilter: {
    backgroundColor: COLORS.primary,
  },
  categoryFilterText: {
    fontFamily: 'medium',
    color: COLORS.primary,
  },
  selectedCategoryFilterText: {
    color: COLORS.white,
  },
  doctorsList: {
    marginVertical: 16,
    borderRadius: 12,
    padding: 8,
    backgroundColor: COLORS.secondaryWhite
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  categoryFilterWrapper: {
    marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'bold',
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    fontFamily: 'medium',
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
  },
});

export default Home;