import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../constants'
import RNPickerSelect from 'react-native-picker-select';
import { useTheme } from '../theme/ThemeProvider';
import Header from '../components/Header';
import Button from '../components/Button';

const PatientDetails = ({ navigation }) => {
    const { colors, dark } = useTheme();
    /**
     * Render content
     */
    const renderContent = () => {
        const [age, setAge] = useState(null);

        return (
            <View>
                <Text style={[styles.title, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>Booking for</Text>
                <View>
                    <View>
                        <RNPickerSelect
                            onValueChange={(value) => console.log(value)}
                            placeholder={{ label: 'Self', value: 'Self' }}
                            items={[
                                { label: 'Self', value: 'Self' },
                                { label: 'My mother', value: 'My mother' },
                                { label: 'My child', value: 'My child' },
                                { label: 'Other', value: 'Other' },
                            ]}
                            style={{
                                inputIOS: {
                                    fontSize: 16,
                                    paddingHorizontal: 10,
                                    borderRadius: 4,
                                    color: COLORS.greyscale600,
                                    height: 52,
                                    width: SIZES.width - 32,
                                    alignItems: 'center',
                                    backgroundColor: dark ? COLORS.dark2 : COLORS.greyscale500,
                                    borderRadius: 16
                                },
                                inputAndroid: {
                                    fontSize: 16,
                                    paddingHorizontal: 10,
                                    borderRadius: 8,
                                    color: COLORS.greyscale600,
                                    height: 52,
                                    width: SIZES.width - 32,
                                    alignItems: 'center',
                                    backgroundColor: dark ? COLORS.dark2 : COLORS.greyscale500,
                                    borderRadius: 16
                                },
                            }}
                        />
                    </View>
                </View>
                <Text style={[styles.title, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>Gender</Text>
                <View>
                    <View>
                        <RNPickerSelect
                            onValueChange={(value) => console.log(value)}
                            placeholder={{ label: 'Female', value: 'Female' }}
                            items={[
                                { label: 'Female', value: 'Female' },
                                { label: 'Male', value: 'Male' },
                                { label: 'Male', value: 'Male' },
                            ]}
                            style={{
                                inputIOS: {
                                    fontSize: 16,
                                    paddingHorizontal: 10,
                                    borderRadius: 4,
                                    color: COLORS.greyscale600,
                                    height: 52,
                                    width: SIZES.width - 32,
                                    alignItems: 'center',
                                    backgroundColor: dark ? COLORS.dark2 : COLORS.greyscale500,
                                    borderRadius: 16
                                },
                                inputAndroid: {
                                    fontSize: 16,
                                    paddingHorizontal: 10,
                                    borderRadius: 8,
                                    color: COLORS.greyscale600,
                                    height: 52,
                                    width: SIZES.width - 32,
                                    alignItems: 'center',
                                    backgroundColor: dark ? COLORS.dark2 : COLORS.greyscale500,
                                    borderRadius: 16
                                },
                            }}
                        />
                    </View>
                </View>
                <Text style={[styles.title, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>Your Age</Text>
                <View style={[styles.inputContainer, { 
                    backgroundColor: dark ? COLORS.dark2 : COLORS.tertiaryWhite
                }]}>
                    <TextInput
                        style={[styles.picker, { 
                            height: 48,
                            color: dark ? COLORS.grayscale200 : COLORS.greyscale900
                        }]}
                        placeholder="24"
                        placeholderTextColor={dark ? COLORS.greyscale300 : COLORS.black}
                        value={age}
                        onChangeText={(value) => setAge(value)}
                        keyboardType="numeric"
                    />
                </View>
                <Text style={[styles.title, { color: dark ? COLORS.white : COLORS.greyscale900 }]}>Write Your Problem</Text>
                <View>
                    <TextInput
                        placeholder="Write here"
                        placeholderTextColor={dark ? COLORS.grayscale200 : COLORS.black}
                        style={[styles.inputComment, { 
                            backgroundColor: dark ? COLORS.dark2 : COLORS.tertiaryWhite,
                            color: dark ? COLORS.grayscale200 : COLORS.greyscale900
                        }]}
                        multiline={true}
                    />
                </View>
            </View>
        )
    }

    return (
        <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Header title="Patient Details" />
                <ScrollView showsVerticalScrollIndicator={false}>
                    {renderContent()}
                </ScrollView>
            </View>
            <View style={[styles.bottomContainer, { 
                backgroundColor: dark ? COLORS.dark2 : COLORS.white,
            }]}>
                <Button
                    title="Next"
                    filled
                    style={styles.btn}
                    onPress={() => navigation.navigate("PaymentMethods")}
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
    title: {
        fontSize: 20,
        fontFamily: "bold",
        color: COLORS.black,
        marginVertical: 12
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
        backgroundColor: COLORS.tertiaryWhite
    },
    picker: {
        flex: 1,
        height: 36,
    },
    inputComment: {
        height: 114,
        textAlignVertical: "top",
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: COLORS.tertiaryWhite
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

export default PatientDetails