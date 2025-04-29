import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { COLORS } from '../constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { ScrollView } from 'react-native-virtualized-view';
import { categories, recommendedDoctors } from '../data';
import { useTheme } from '../theme/ThemeProvider';
import HorizontalDoctorCard from '../components/HorizontalDoctorCard';
import { useNavigation } from '@react-navigation/native';

const TopDoctors = () => {
    const { dark, colors } = useTheme();
    const [selectedCategory, setSelectedCategory] = useState("0"); // Default to "All"
    const navigation = useNavigation();

    // Custom categories for filtering doctors
    const doctorCategories = [
        { id: "0", name: "All" },
        { id: "1", name: "Nutrition" },
        { id: "2", name: "Workout" },
        { id: "3", name: "Water Intake" }
    ];

    // Filter doctors based on selected category
    const filteredDoctors = React.useMemo(() => {
        if (selectedCategory === "0") {
            // If "All" is selected, show all doctors
            return recommendedDoctors;
        }
        
        // Map UI category names to doctor type/speciality
        const categoryTypeMap = {
            "1": ["Nutritionist", "Dietitian"],
            "2": ["Physical Therapist", "Workout Specialist", "Fitness Trainer"],
            "3": ["Nephrologist", "General Practitioner"]
        };
        
        const allowedTypes = categoryTypeMap[selectedCategory] || [];
        
        return recommendedDoctors.filter(doctor => 
            allowedTypes.includes(doctor.type) ||
            (doctor.speciality && allowedTypes.includes(doctor.speciality))
        );
    }, [selectedCategory]);

    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity
            style={{
                backgroundColor: selectedCategory === item.id ? COLORS.primary : "transparent",
                padding: 10,
                marginVertical: 5,
                borderColor: COLORS.primary,
                borderWidth: 1.3,
                borderRadius: 24,
                marginRight: 12,
            }}
            onPress={() => setSelectedCategory(item.id)}>
            <Text style={{
                color: selectedCategory === item.id ? COLORS.white : COLORS.primary
            }}>{item.name}</Text>
        </TouchableOpacity>
    );

    const handleDoctorPress = (doctor) => {
        // Data normalization
        const doctorData = {
            ...doctor,
            id: doctor.id || Date.now().toString(),
            type: doctor.type || "General Practitioner",
            hospital: doctor.hospital || "General Hospital",
            image: doctor.image,
            patients: parseInt(doctor.numReviews?.replace('k', '000')) || 0,
            yearsExperience: parseInt(doctor.yearsExperience) || 5,
            rating: doctor.rating?.toString() || "4.5",
            numReviews: doctor.numReviews || "0",
            workingTime: doctor.workingTime || "Mon-Fri: 9am-5pm",
            description: doctor.description || `${doctor.name} is a ${doctor.type} at ${doctor.hospital}`
        };

        // Navigation
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
                        data={doctorCategories}
                        keyExtractor={item => item.id}
                        showsHorizontalScrollIndicator={false}
                        horizontal
                        renderItem={renderCategoryItem}
                    />
                    <View style={{ backgroundColor: dark ? COLORS.dark1 : COLORS.secondaryWhite, marginVertical: 16 }}>
                        {filteredDoctors.length > 0 ? (
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
                        ) : (
                            <View style={styles.noResultsContainer}>
                                <Text style={styles.noResultsText}>
                                    No doctors found in this category
                                </Text>
                            </View>
                        )}
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
    noResultsContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noResultsText: {
        fontSize: 16,
        color: COLORS.gray,
        fontFamily: 'regular',
    },
});

export default TopDoctors;