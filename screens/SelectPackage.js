import { View, Text, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-virtualized-view';
import { COLORS, SIZES, icons } from "../constants";
import { Ionicons } from "@expo/vector-icons";
import RNPickerSelect from 'react-native-picker-select';
import PackageItem from '../components/PackageItem';
import { useTheme } from '../theme/ThemeProvider';
import Header from '../components/Header';
import Button from '../components/Button';

const SelectPackage = ({ navigation }) => {
    const { colors, dark } = useTheme();

    const renderContent = () => {
        const [selectedItem, setSelectedItem] = useState(null);

        const handleCheckboxPress = (itemTitle) => {
            if (selectedItem === itemTitle) {
                // If the clicked item is already selected, deselect it
                setSelectedItem(null);
            } else {
                // Otherwise, select the clicked item
                setSelectedItem(itemTitle);
            }
        };

        return (
            <View>
                <Text style={[styles.title, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>Select Duration</Text>
                <View style={{
                    backgroundColor: dark ? COLORS.dark1 : COLORS.white,
                    paddingVertical: 12
                }}>
                    <View style={[styles.inputContainer, {
                        backgroundColor: dark ? COLORS.dark2 : COLORS.tertiaryWhite,
                    }]}>
                        <Ionicons name="time" size={24} color={COLORS.primary} />
                        <View style={{ marginHorizontal: 12 }}>
                            <RNPickerSelect
                                placeholder={{ label: '30 minutes', value: '30 minutes' }}
                                onValueChange={(value) => console.log(value)}
                                style={{
                                    inputIOS: {
                                        fontSize: 16,
                                        color: dark ? COLORS.white : COLORS.grayscale700,
                                        fontFamily: "regular"
                                    },
                                    inputAndroid: {
                                        fontSize: 16,
                                        color: dark ? COLORS.white : COLORS.grayscale700,
                                        fontFamily: "regular"
                                    }
                                }}
                                items={[
                                    { label: '30 minutes', value: '30 minutes' },
                                    { label: '45 minutes', value: '45 minutes' },
                                    { label: '1 hour', value: '1 hour' },
                                    { label: '2 hours', value: '2 hours' },
                                ]}
                            />
                        </View>
                    </View>
                </View>
                <Text style={[styles.title, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>Select Package</Text>
                <View style={{
                    backgroundColor: dark ? COLORS.dark1 : COLORS.tertiaryWhite,
                    paddingTop: 12
                }}>
                    <PackageItem
                        checked={selectedItem === 'Messaging'} // Check if it's the selected item
                        onPress={() => handleCheckboxPress('Messaging')} // Pass the item title
                        title="Messaging"
                        subtitle="Chat with Doctor"
                        price="20"
                        duration="30 mins"
                        icon={icons.chatBubble2}
                    />
                    <PackageItem
                        checked={selectedItem === 'Voice call'}
                        onPress={() => handleCheckboxPress('Voice call')}
                        title="Voice call"
                        subtitle="Voice call with Doctor"
                        price="40"
                        duration="30 mins"
                        icon={icons.telephone}
                    />
                    <PackageItem
                        checked={selectedItem === 'Video call'}
                        onPress={() => handleCheckboxPress('Video call')}
                        title="Video call"
                        subtitle="Video call with Doctor"
                        price="60"
                        duration="30 mins"
                        icon={icons.videoCamera}
                    />
                    <PackageItem
                        checked={selectedItem === 'In Person'}
                        onPress={() => handleCheckboxPress('In Person')}
                        title="In Person"
                        subtitle="In person visit with Doctor"
                        price="100"
                        duration="30 mins"
                        icon={icons.user}
                    />
                </View>
            </View>
        )
    }

    return (
        <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Header title="Select Package" />
                <ScrollView showsVerticalScrollIndicator={false}>
                    {renderContent()}
                </ScrollView>
            </View>
            <View style={[styles.bottomContainer, {
                backgroundColor: dark ? COLORS.dark2 : COLORS.white
            }]}>
                <Button
                    title="Next"
                    filled
                    style={styles.btn}
                    onPress={() => navigation.navigate("PatientDetails")}
                />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    area: {
        flex: 1,
        backgroundColor: COLORS.white
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        padding: 12
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 12,
        alignItems: "center"
    },
    headerIcon: {
        height: 50,
        width: 50,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        backgroundColor: COLORS.gray
    },
    arrowLeft: {
        height: 24,
        width: 24,
        tintColor: COLORS.black
    },
    moreIcon: {
        height: 24,
        width: 24,
        tintColor: COLORS.black
    },
    locationContainer: {
        flexDirection: "row",
        alignItems: "center"
    },
    separateLine: {
        marginVertical: 8,
        borderBottomWidth: .3,
        borderBottomColor: COLORS.grayscale200,
        width: "100%"
    },
    separateLine2: {
        borderBottomWidth: .3,
        borderBottomColor: COLORS.grayscale200,
        width: "100%",
        marginBottom: 6
    },
    h4: {
        fontSize: 16,
        fontFamily: "medium",
        color: COLORS.black,
        marginVertical: 6
    },
    subtitle: {
        textTransform: "uppercase",
        color: "gray",
        fontSize: 16,
        fontFamily: "regular",
        marginVertical: 12
    },
    subName: {
        fontSize: 16,
        fontFamily: "medium",
        color: COLORS.black,
        marginVertical: 6
    },
    btnContainer: {
        position: "absolute",
        bottom: 22,
        height: 72,
        width: "100%",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        alignItems: "center"
    },
    btn: {
        width: SIZES.width - 32
    },
    btnText: {
        fontSize: 16,
        fontFamily: "medium",
        color: COLORS.white
    },
    inputTitle: {
        fontSize: 18,
        fontFamily: "medium",
        color: COLORS.black,
        marginVertical: 12
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 2,
        height: 52,
        backgroundColor: COLORS.tertiaryWhite,

    },
    icon: {
        marginRight: 10,
    },
    dropdownContainer: {
        flex: 1,
    },
    dropdown: {
        backgroundColor: 'white',
    },
    dropdownItem: {
        justifyContent: 'flex-start',
    },
    dropDown: {
        backgroundColor: 'white',
        zIndex: 1000,
    },
    picker: {
        flex: 1,
        height: 40,
    },
    title: {
        fontSize: 20,
        fontFamily: "bold",
        color: COLORS.black,
        marginVertical: 12
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
    }
})
export default SelectPackage