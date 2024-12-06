import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TouchableWithoutFeedback, Image } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { ScrollView } from 'react-native-virtualized-view';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS, SIZES, icons, illustrations } from '../constants';
import { getFormatedDate } from "react-native-modern-datepicker";
import DatePickerView from '../components/DatePickerView';
import { hoursData } from '../data';
import Button from '../components/Button';

const SelectRescheduleAppointmentDate = ({ navigation }) => {
    const { colors, dark } = useTheme();
    const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
    const [selectedHour, setSelectedHour] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

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

    // Render modal
    const renderModal = () => {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}>
                <TouchableWithoutFeedback
                    onPress={() => setModalVisible(false)}>
                    <View style={styles.modalContainer}>
                        <View style={[styles.modalSubContainer, {
                            backgroundColor: dark ? COLORS.dark2 : COLORS.white,
                        }]}>
                            <View style={styles.backgroundIllustration}>
                                <Image
                                    source={illustrations.background}
                                    resizeMode='contain'
                                    style={styles.modalIllustration}
                                />
                                <Image
                                    source={icons.calendar5}
                                    resizeMode='contain'
                                    style={styles.editPencilIcon}
                                />
                            </View>
                            <Text style={styles.modalTitle}>Congratulations!</Text>
                            <Text style={[styles.modalSubtitle, {
                                color: dark ? COLORS.white : COLORS.black,
                            }]}>
                                Appointment successfully booked. You will receive a notification and the doctor you selected will contact you.
                            </Text>
                            <Button
                                title="Continue"
                                filled
                                onPress={() => {
                                    setModalVisible(false)
                                    navigation.navigate("Home")
                                }}
                                style={styles.successBtn}
                            />
                            <Button
                                title="View Appointment"
                                onPress={() => {
                                    setModalVisible(false)
                                    navigation.navigate("MyAppointmentMessaging")
                                }}
                                textColor={dark ? COLORS.white : COLORS.primary}
                                style={{
                                    width: "100%",
                                    marginTop: 12,
                                    borderRadius: 32,
                                    backgroundColor: dark ? COLORS.dark3 : COLORS.tansparentPrimary,
                                    borderColor: dark ? COLORS.dark3 : COLORS.tansparentPrimary
                                }}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        )
    }

    return (
        <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Header title="Reschedule Appointment" />
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
                    onPress={() => setModalVisible(true)}
                />
            </View>
            {renderModal()}
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
    },
    modalTitle: {
        fontSize: 24,
        fontFamily: "bold",
        color: COLORS.primary,
        textAlign: "center",
        marginVertical: 12
    },
    modalSubtitle: {
        fontSize: 16,
        fontFamily: "regular",
        color: COLORS.black,
        textAlign: "center",
        marginVertical: 12
    },
    modalContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.4)"
    },
    modalSubContainer: {
        height: 520,
        width: SIZES.width * 0.9,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        padding: 16
    },
    modalIllustration: {
        height: 180,
        width: 180,
        marginVertical: 22
    },
    successBtn: {
        width: "100%",
        marginTop: 12,
        borderRadius: 32
    },
    receiptBtn: {
        width: "100%",
        marginTop: 12,
        borderRadius: 32,
        backgroundColor: COLORS.tansparentPrimary,
        borderColor: COLORS.tansparentPrimary
    },
    editPencilIcon: {
        width: 54,
        height: 54,
        tintColor: COLORS.white,
        zIndex: 99999,
        position: "absolute",
        top: 50,
        left: 52,
    },
    backgroundIllustration: {
        height: 150,
        width: 150,
        marginVertical: 22,
        alignItems: "center",
        justifyContent: "center",
        zIndex: -999
    }
})

export default SelectRescheduleAppointmentDate