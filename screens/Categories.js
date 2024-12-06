import { View, StyleSheet, FlatList, Text, Image } from 'react-native';
import React from 'react';
import { COLORS } from '../constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { categories } from '../data';
import { useTheme } from '../theme/ThemeProvider';

const Categories = () => {
  const { colors } = useTheme();

  const renderCategoryItem = ({ item }) => {
    return (
      <View style={styles.categoryContainer}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: item.backgroundColor || 'rgba(36, 107, 253, 0.12)' }, // Light blue background
          ]}
        >
          <Image
            source={item.icon} // Render icons
            style={{
              width: 32,
              height: 32,
              tintColor: item.iconColor || 'rgba(36, 107, 253, 1)', // Blue icon tint
            }}
            resizeMode="contain"
          />
        </View>
        <Text style={[styles.categoryName, { color: colors.text }]}>
          {item.name}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="More Categories" />
        <FlatList
          data={categories.slice(1)} // Skip the first category if necessary
          keyExtractor={(item) => item.id.toString()}
          numColumns={4} // Display 4 items per row
          renderItem={renderCategoryItem}
          contentContainerStyle={styles.flatListContent}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
  },
  flatListContent: {
    justifyContent: 'space-between',
  },
  categoryContainer: {
    flex: 1,
    alignItems: 'center',
    marginVertical: 12,
    width: '22%', // Adjust for 4 items in a row
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
    color: COLORS.darkGray,
  },
});

export default Categories;
