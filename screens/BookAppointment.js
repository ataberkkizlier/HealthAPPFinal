import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { ScrollView } from 'react-native-virtualized-view';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS, SIZES } from '../constants';
import { getFormatedDate } from "react-native-modern-datepicker";
import DatePickerView from '../components/DatePickerView';
import { hoursData } from '../data';
import Button from '../components/Button';

const BookAppointment = ({ navigation }) => {
    const { colors, dark } = useTheme();
    const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
    const [selectedHour, setSelectedHour] = useState(null);

    const today = new Date();
    const startDate = getFormatedDate(
        new Date(today.setDate(today.getDate() + 1)),
        "YYYY/MM/DD"
    );

    const [startedDate, setStartedDate] = useState("12/12/2023");

    const handleOnPressStartDate = () => {
        setOpenStartDatePicker(!openStartDatePicker);
    };

    // Function to handle hour selection
    const handleHourSelect = (hour) => {
        setSelectedHour(hour);
    };

    // Render each hour as a selectable button
    const renderHourItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={[
                    styles.hourButton,
                    selectedHour === item.id && styles.selectedHourButton]}
                onPress={() => handleHourSelect(item.id)}>
                <Text style={[styles.hourText,
                selectedHour === item.id && styles.selectedHourText]}>{item.hour}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Header title="Book Appointment" />
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={[styles.title, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>Select Date</Text>
                    <View style={styles.datePickerContainer}>
                        <DatePickerView
                            open={openStartDatePicker}
                            startDate={startDate}
                            selectedDate={startedDate}
                            onClose={() => setOpenStartDatePicker(false)}
                            onChangeStartDate={(date) => setStartedDate(date)}
                        />
                    </View>
                    <Text style={[styles.title, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>Select Hour</Text>
                    <FlatList
                        data={hoursData}
                        renderItem={renderHourItem}
                        numColumns={3}
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        style={{ marginVertical: 12 }}
                    />
                </ScrollView>
            </View>
            <View style={[styles.bottomContainer, {
                backgroundColor: dark ? COLORS.dark2 : COLORS.white
            }]}>
                <Button
                    title="Next"
                    filled
                    style={styles.btn}
                    onPress={() => navigation.navigate("SelectPackage")}
                />
            </View>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    area: {
        flex: 1,
        backgroundColor: COLORS.white
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        padding: 16
    },
    title: {
        fontSize: 20,
        fontFamily: "bold",
        color: COLORS.black,
        marginTop: 12
    },
    datePickerContainer: {
        marginVertical: 12
    },
    hourButton: {
        borderRadius: 32,
        borderWidth: 1,
        borderColor: '#ccc',
        marginHorizontal: 5,
        borderColor: COLORS.primary,
        borderWidth: 1.4,
        width: (SIZES.width - 32) / 3 - 9,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 6
    },
    selectedHourButton: {
        backgroundColor: COLORS.primary,
    },
    selectedHourText: {
        fontSize: 16,
        fontFamily: 'semiBold',
        color: COLORS.white
    },
    hourText: {
        fontSize: 16,
        fontFamily: 'semiBold',
        color: COLORS.primary
    },
    bottomContainer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: 99,
        borderRadius: 32,
        backgroundColor: COLORS.white,
        alignItems: "center",
        justifyContent: "center"
    },
    btn: {
        width: SIZES.width - 32
    }
})

export default BookAppointment