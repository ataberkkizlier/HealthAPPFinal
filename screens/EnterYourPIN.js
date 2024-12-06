import { View, Text, StyleSheet, Modal, TouchableWithoutFeedback, Image } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { ScrollView } from "react-native-virtualized-view";
import { COLORS, SIZES, icons, illustrations } from '../constants';
import { OtpInput } from "react-native-otp-entry";
import Button from "../components/Button";
import { useTheme } from '../theme/ThemeProvider';

const EnterYourPIN = ({ navigation }) => {
    const { colors, dark } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);

    // render modal
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
                                title="View E-Receipt"
                                onPress={() => {
                                    setModalVisible(false)
                                    navigation.navigate("EReceipt")
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
                <Header title="Enter Your PIN" />
                <ScrollView contentContainerStyle={styles.center}>
                    <Text style={[styles.title, {
                        color: dark ? COLORS.white : COLORS.greyscale900
                    }]}>Enter Your PIN to confirm payment</Text>
                    <OtpInput
                        numberOfDigits={4}
                        onTextChange={(text) => console.log(text)}
                        focusColor={COLORS.primary}
                        focusStickBlinkingDuration={500}
                        onFilled={(text) => console.log(`OTP is ${text}`)}
                        theme={{
                            pinCodeContainerStyle: {
                                backgroundColor: dark ? COLORS.dark2 : COLORS.secondaryWhite,
                                borderColor: dark ? COLORS.gray : COLORS.secondaryWhite,
                                borderWidth: .4,
                                borderRadius: 10,
                                height: 58,
                                width: 58,
                            },
                            pinCodeTextStyle: {
                                color: dark ? COLORS.white : COLORS.black,
                            }
                        }}
                    />
                    <Button
                        title="Continue"
                        filled
                        style={styles.button}
                        onPress={() => setModalVisible(true)}
                    />
                </ScrollView>
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
        padding: 16,
        backgroundColor: COLORS.white
    },
    title: {
        fontSize: 18,
        fontFamily: "medium",
        color: COLORS.greyscale900,
        textAlign: "center",
        marginVertical: 64
    },
    OTPStyle: {
        borderColor: COLORS.black,
        borderRadius: 8,
        height: 58,
        width: 58,
        backgroundColor: COLORS.secondaryWhite,
        borderBottomColor: "gray",
        borderBottomWidth: .4,
        borderWidth: .4,
        borderColor: "gray"
    },
    codeContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 24,
        justifyContent: "center"
    },
    code: {
        fontSize: 18,
        fontFamily: "medium",
        color: COLORS.greyscale900,
        textAlign: "center"
    },
    time: {
        fontFamily: "medium",
        fontSize: 18,
        color: COLORS.primary
    },
    button: {
        borderRadius: 32,
        marginVertical: 72
    },
    center: {
        flex: 1,
        justifyContent: "center",
        marginBottom: 144
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
    },
})

export default EnterYourPIN