import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { COLORS } from '../constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { ScrollView } from 'react-native-virtualized-view';
import { categories, recommendedDoctors } from '../data';
import { useTheme } from '../theme/ThemeProvider';
import HorizontalDoctorCard from '../components/HorizontalDoctorCard';
import { useNavigation } from '@react-navigation/native'; // Critical import

const TopDoctors = () => {
    const { dark, colors } = useTheme();
    const [selectedCategories, setSelectedCategories] = useState(["0"]);
    const navigation = useNavigation(); // Critical fix

    const filteredDoctors = recommendedDoctors.filter(doctor =>
        selectedCategories.includes("0") ||
        selectedCategories.includes(doctor.categoryId)
    );

    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity
            style={{
                backgroundColor: selectedCategories.includes(item.id) ? COLORS.primary : "transparent",
                padding: 10,
                marginVertical: 5,
                borderColor: COLORS.primary,
                borderWidth: 1.3,
                borderRadius: 24,
                marginRight: 12,
            }}
            onPress={() => toggleCategory(item.id)}>
            <Text style={{
                color: selectedCategories.includes(item.id) ? COLORS.white : COLORS.primary
            }}>{item.name}</Text>
        </TouchableOpacity>
    );

    const toggleCategory = (categoryId) => {
        const updatedCategories = [...selectedCategories];
        const index = updatedCategories.indexOf(categoryId);

        if (index === -1) {
            updatedCategories.push(categoryId);
        } else {
            updatedCategories.splice(index, 1);
        }
        setSelectedCategories(updatedCategories);
    };

    const handleDoctorPress = (doctor) => {
        // Critical data normalization
        const doctorData = {
            ...doctor,
            id: doctor.id || Date.now().toString(),
            type: doctor.type || "General Practitioner",
            hospital: doctor.hospital || "General Hospital",
            image: doctor.image || images.doctor1,
            patients: parseInt(doctor.numReviews?.replace('k', '000')) || 0,
            yearsExperience: parseInt(doctor.yearsExperience) || 5,
            rating: doctor.rating?.toString() || "4.5",
            numReviews: doctor.numReviews || "0",
            workingTime: doctor.workingTime || "Mon-Fri: 9am-5pm",
            description: doctor.description || `${doctor.name} is a ${doctor.type} at ${doctor.hospital}`
        };

        // Critical navigation fix with timeout
        setTimeout(() => {
            navigation.navigate("DoctorDetails", {
                doctor: doctorData
            });
        }, 50);
    };

    return (
        <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Header title="Top Doctors" />
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <FlatList
                        data={categories}
                        keyExtractor={item => item.id}
                        showsHorizontalScrollIndicator={false}
                        horizontal
                        renderItem={renderCategoryItem}
                    />
                    <View style={{ backgroundColor: dark ? COLORS.dark1 : COLORS.secondaryWhite, marginVertical: 16 }}>
                        <FlatList
                            data={filteredDoctors}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <HorizontalDoctorCard
                                    name={item.name}
                                    image={item.image}
                                    distance={item.distance}
                                    price={item.consultationFee}
                                    consultationFee={item.consultationFee}
                                    hospital={item.hospital}
                                    rating={item.rating}
                                    numReviews={item.numReviews}
                                    isAvailable={item.isAvailable}
                                    onPress={() => handleDoctorPress(item)}
                                />
                            )}
                        />
                    </View>
                </ScrollView>
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
    scrollView: {
        marginVertical: 16,
    },
});

export default TopDoctors;