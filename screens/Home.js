import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image } from 'react-native';
import React, { useState, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';

const MetricCard = React.memo(({
  icon,
  label,
  metric,
  unit,
  color,
  dark,
  value,
  onUpdate
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

  return (
    <View style={[styles.metricCard, {
      backgroundColor: dark ? COLORS.dark2 : COLORS.white,
      shadowColor: dark ? COLORS.white : COLORS.gray
    }]}>
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
    </View>
  );
});

const Home = ({ navigation }) => {
  const { dark, colors } = useTheme();
  const { waterIntake, percentage, dailyGoal, updateWaterIntake } = useWaterIntake();
  const { steps, dailyGoal: stepsDailyGoal, updateSteps } = useSteps();
  const [healthMetrics, setHealthMetrics] = useState({
    nutrition: 90,
    workout: 75,
    mental: 80,
    sleep: 70,
    bloodPressure: '120/80'
  });
  const [forceRender, setForceRender] = useState(0);

  useFocusEffect(
    useCallback(() => {
      console.log('Home screen focused, water intake:', waterIntake, 'percentage:', percentage, 'steps:', steps);
      setForceRender(prev => prev + 1);
    }, [waterIntake, percentage, steps])
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
    (healthMetrics.nutrition * weights.nutrition) +
    (healthMetrics.workout * weights.workout) +
    (percentage * weights.water) +
    (healthMetrics.mental * weights.mental) +
    (healthMetrics.sleep * weights.sleep) +
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
  }, [dailyGoal, updateWaterIntake, updateSteps]);

  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <View style={styles.viewLeft}>
          <Image
            source={images.user1}
            resizeMode='contain'
            style={styles.userIcon}
          />
          <View style={styles.viewNameContainer}>
            <Text style={styles.greeeting}>Good Morning👋</Text>
            <Text style={[styles.title, {
              color: dark ? COLORS.white : COLORS.greyscale900
            }]}>Ataberk Kizlier</Text>
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
          value={healthMetrics.nutrition}
          onUpdate={updateMetric}
        />
        <MetricCard
          icon={icons.workout}
          label="Workout"
          metric="workout"
          unit="%"
          color="#2EC4B6"
          dark={dark}
          value={healthMetrics.workout}
          onUpdate={updateMetric}
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
        />
        <MetricCard
          icon={icons.sleep}
          label="Sleep Quality"
          metric="sleep"
          unit="%"
          color="#FF006E"
          dark={dark}
          value={healthMetrics.sleep}
          onUpdate={updateMetric}
        />
        <MetricCard
          icon={icons.steps}
          label="Daily Steps"
          metric="steps"
          color="#8AC926"
          dark={dark}
          value={steps}
          onUpdate={updateMetric}
        />
        <MetricCard
          icon={icons.bloodPressure}
          label="Blood Pressure"
          metric="bloodPressure"
          color="#FF595E"
          dark={dark}
          value={healthMetrics.bloodPressure}
          onUpdate={updateMetric}
        />
      </View>
    </View>
  );

  const renderCategories = () => (
    <View>
      <SubHeaderItem
        title="Categories"
        navTitle="See all"
        onPress={() => navigation.navigate("Categories")}
      />
      <FlatList
        data={categories.slice(1, 9)}
        keyExtractor={(_, index) => index.toString()}
        numColumns={4}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => navigation.navigate(item.screen)}>
            <Image source={item.icon} style={styles.categoryIcon} />
            <Text style={styles.categoryText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderTopDoctors = () => {
    const [selectedCategories, setSelectedCategories] = useState(["1"]);

    const toggleCategory = (categoryId) => {
      setSelectedCategories(prev =>
        prev.includes(categoryId)
          ? prev.filter(id => id !== categoryId)
          : [...prev, categoryId]
      );
    };

    return (
      <View>
        <SubHeaderItem
          title="Top Doctors"
          navTitle="See all"
          onPress={() => navigation.navigate("TopDoctors")}
        />
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryFilter,
                selectedCategories.includes(item.id) && styles.selectedCategoryFilter
              ]}
              onPress={() => toggleCategory(item.id)}>
              <Text style={[
                styles.categoryFilterText,
                selectedCategories.includes(item.id) && styles.selectedCategoryFilterText
              ]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
        <FlatList
          data={recommendedDoctors}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <HorizontalDoctorCard
              {...item}
              onPress={() => navigation.navigate("DoctorDetails", { doctor: item })}
            />
          )}
          contentContainerStyle={[styles.doctorsList, {
            backgroundColor: dark ? COLORS.dark1 : COLORS.secondaryWhite
          }]}
        />
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
    borderRadius: 32
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
    marginVertical: 5,
    borderColor: COLORS.primary,
    borderWidth: 1.3,
    borderRadius: 24,
    marginRight: 12,
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
  }
});

export default Home;