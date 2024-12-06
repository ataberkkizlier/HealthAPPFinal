import { View, Text, StyleSheet, Image } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { useTheme } from '../theme/ThemeProvider';
import { COLORS, SIZES, images } from '../constants';
import Button from '../components/Button';
import { ScrollView } from 'react-native-virtualized-view';

const SessionEnded = ({ navigation }) => {
    const { colors, dark } = useTheme();

    return (
        <SafeAreaView style={[styles.area, { backgroundColor: colors.background }]}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Header title="" />
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.background}>
                    <View style={{ alignItems: "center" }}>
                        <Image
                            source={images.clock}
                            resizeMode="contain"
                            style={styles.clockImage}
                        />
                        <Text style={[styles.title, { 
                            color: dark ? COLORS.grayscale200 : COLORS.greyscale900,
                        }]}>The consultation session has ended.</Text>
                        <Text style={[styles.subtitle, {
                            color: dark ? COLORS.white : COLORS.grayscale700
                        }]}>You can start a new consultation session.</Text>
                        <View style={styles.separateLine} />
                        <Image
                            source={images.doctor5}
                            resizeMode='contain'
                            style={styles.doctorImage}
                        />
                        <Text style={[styles.doctorName, { 
                            color: dark ? COLORS.grayscale200 : COLORS.greyscale900,
                        }]}>Dr. Drake Boeson</Text>
                        <Text style={[styles.doctorTitle, { 
                            color: dark ? COLORS.grayscale200 : COLORS.grayscale700
                        }]}>Immunologists</Text>
                        <Text style={[styles.doctorHospital, { 
                            color: dark ? COLORS.grayscale200 : COLORS.grayscale700
                        }]}>The Valley Hospital in California, US</Text>
                        <View style={styles.separateLine} />
                    </View>
                </ScrollView>
            </View>
            <View style={[styles.bottomContainer, { 
                backgroundColor: dark ? COLORS.dark1 : COLORS.white,
            }]}>
                <Button
                    title="Back to Home"
                    style={styles.btnBack}
                    onPress={()=>navigation.navigate("Home")}
                />
                <Button
                    title="Leave Review"
                    filled
                    style={styles.btnReview}
                    onPress={() =>navigation.navigate("LeaveReview")}
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
    background: {
        alignItems: "center"
    },
    clockImage: {
        height: 180,
        width: 185,
        marginTop: 22,
        marginBottom: 12
    },
    title: {
        fontSize: 20,
        fontFamily: "bold",
        color: COLORS.greyscale900,
        marginVertical: 8
    },
    subtitle: {
        fontSize: 14,
        fontFamily: "regular",
        color: COLORS.grayscale700
    },
    doctorImage: {
        height: 200,
        width: 200,
        borderRadius: 999,
        marginVertical: 16
    },
    doctorName: {
        fontSize: 24,
        fontFamily: "bold",
        color: COLORS.greyscale900,
        marginVertical: 8
    },
    doctorTitle: {
        fontSize: 14,
        fontFamily: "medium",
        color: COLORS.grayscale700,
        marginVertical: 8
    },
    doctorHospital: {
        fontSize: 14,
        fontFamily: "medium",
        color: COLORS.grayscale700,
    },
    separateLine: {
        width: "100%",
        height: .3,
        backgroundColor: COLORS.grayscale400,
        marginVertical: 16
    },
    bottomContainer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: 99,
        borderRadius: 32,
        backgroundColor: COLORS.white,
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row",
        paddingHorizontal: 16
    },
    btnBack: {
        width: (SIZES.width - 32) / 2 - 18,
        backgroundColor: COLORS.tansparentPrimary,
        borderWidth: 0
    },
    btnReview: {
        width: (SIZES.width - 32) / 2 - 18
    }
})

export default SessionEnded