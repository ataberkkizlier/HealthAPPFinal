import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Modal, TouchableWithoutFeedback } from 'react-native';
import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS, SIZES, icons, images } from '../constants';
import { ScrollView } from 'react-native-virtualized-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import CallCard from '../components/CallCard';
import { Ionicons } from '@expo/vector-icons';

const VoiceCallHistoryDetails = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const { colors, dark } = useTheme();

    const dropdownItems = [
        { label: 'Download Video', value: 'downloadVideo', icon: icons.download2 },
        { label: 'Delete Video', value: 'DeleteVideo', icon: icons.trash },
    ];

    const handleDropdownSelect = (item) => {
        setSelectedItem(item.value);
        setModalVisible(false);

        // Perform actions based on the selected item
        switch (item.value) {
            case 'downloadVideo':
                // Handle Download E-Receipt action
                setModalVisible(false);
                break;
            case 'DeleteVideo':
                // Handle Print action
                setModalVisible(false)
                break;
            default:
                break;
        }
    };
    /**
    * Render header
    */
    const renderHeader = () => {
        return (
            <View style={styles.headerContainer}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}>
                        <Image
                            source={icons.back}
                            resizeMode='contain'
                            style={[styles.backIcon, {
                                tintColor: dark ? COLORS.white : COLORS.black
                            }]} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, {
                        color: dark ? COLORS.white : COLORS.black
                    }]}></Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Image
                        source={icons.moreCircle}
                        resizeMode='contain'
                        style={[styles.moreIcon, {
                            tintColor: dark ? COLORS.secondaryWhite : COLORS.black
                        }]}
                    />
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {renderHeader()}
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={{ backgroundColor: dark ? COLORS.dark1 : COLORS.tertiaryWhite }}>
                        <CallCard
                            name="Dr. Jenny Watson"
                            image={images.doctor5}
                            type="Voice Call"
                            date="Dec 11, 2024"
                            time="13:00 PM"
                            icon={icons.telephone}
                            onPress={() => null}
                        />
                    </View>
                    <View style={styles.separateLine} />
                    <Text style={styles.description}>30 minutes of voice calls have been recorded.</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate("VoiceCallHistoryDetailsPlayRecordings")}
                        style={styles.btnContainer}>
                        <Ionicons name="play-circle" size={24} color={COLORS.white} />
                        <Text style={styles.btnText}>Play Audio Recordings</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
            {/* Modal for dropdown selection */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}>
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={{ position: "absolute", top: 112, right: 12 }}>
                        <View style={{
                            width: 202,
                            padding: 16,
                            backgroundColor: dark ? COLORS.dark2 : COLORS.tertiaryWhite,
                            borderRadius: 8
                        }}>
                            <FlatList
                                data={dropdownItems}
                                keyExtractor={(item) => item.value}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={{
                                            flexDirection: "row",
                                            alignItems: 'center',
                                            marginVertical: 12
                                        }}
                                        onPress={() => handleDropdownSelect(item)}>
                                        <Image
                                            source={item.icon}
                                            resizeMode='contain'
                                            style={{
                                                width: 20,
                                                height: 20,
                                                marginRight: 16,
                                                tintColor: dark ? COLORS.white : COLORS.black
                                            }}
                                        />
                                        <Text style={{
                                            fontSize: 14,
                                            fontFamily: "semiBold",
                                            color: dark ? COLORS.white : COLORS.black
                                        }}>{item.label}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    area: {
        flex: 1,
        backgroundColor: COLORS.white,
        padding: 16
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    headerContainer: {
        flexDirection: "row",
        width: SIZES.width - 32,
        justifyContent: "space-between",
        marginBottom: 0
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center"
    },
    backIcon: {
        height: 24,
        width: 24,
        tintColor: COLORS.black
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'bold',
        color: COLORS.black,
        marginLeft: 16
    },
    moreIcon: {
        width: 24,
        height: 24,
        tintColor: COLORS.black
    },
    separateLine: {
        height: .4,
        width: SIZES.width - 32,
        backgroundColor: COLORS.greyscale300,
        marginVertical: 12
    },
    description: {
        fontSize: 16,
        fontFamily: "medium",
        color: COLORS.grayscale700,
        textAlign: "center"
    },
    btnContainer: {
        height: 58,
        width: SIZES.width - 32,
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        borderRadius: 100,
        marginVertical: 24
    },
    btnText: {
        fontSize: 16,
        fontFamily: "bold",
        color: COLORS.white,
        marginLeft: 16
    }
})

export default VoiceCallHistoryDetails