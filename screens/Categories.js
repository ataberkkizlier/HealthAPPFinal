import { View, StyleSheet, FlatList, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { categories } from '../data'; // ✅ Use the imported categories

const Categories = () => {
  const navigation = useNavigation();

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        console.log('Navigating to:', item.screen);
        if (navigation && item.screen) {
          navigation.navigate(item.screen);
        }
      }}
      style={styles.categoryContainer}
    >
      <View style={styles.iconContainer}>
        <Image source={item.icon} style={{ width: 32, height: 32 }} resizeMode="contain" />
      </View>
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="More Categories" />
      <FlatList
        data={categories} // ✅ Use the imported categories
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        renderItem={renderCategoryItem}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  categoryContainer: {
    alignItems: 'center',
    marginVertical: 12,
    width: '45%',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    textAlign: 'center',
    color: COLORS.darkGray,
  },
});

export default Categories;
