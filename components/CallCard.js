import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { COLORS, SIZES } from '../constants';
import { useTheme } from '../theme/ThemeProvider';

const CallCard = ({
    name,
    image,
    type,
    date,
    time,
    icon,
    onPress
}) => {
    const { dark } = useTheme();

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.cardContainer, {
                backgroundColor: dark ? COLORS.dark2 : COLORS.white,
            }]}>
            <View style={styles.doctorCard}>
                <Image
                    source={image}
                    resizeMode='contain'
                    style={styles.doctorImage}
                />
                <View>
                    <Text style={[styles.doctorName, {
                        color: dark ? COLORS.grayscale200 : COLORS.greyscale900,
                    }]}>{name}</Text>
                    <Text style={[styles.doctorSpeciality, {
                        color: dark ? COLORS.grayscale400 : COLORS.greyScale800,
                    }]}>{type}</Text>
                    <Text style={[styles.doctorHospital, {
                        color: dark ? COLORS.grayscale400 : COLORS.greyScale800,
                    }]}>{date} | {time}</Text>
                </View>
            </View>
            <TouchableOpacity
                style={styles.iconContainer}
                onPress={onPress}>
                <Image
                    source={icon}
                    resizeMode='contain'
                    style={styles.nextIcon}
                />
            </TouchableOpacity>
        </TouchableOpacity>
    )
};

const styles = StyleSheet.create({
    cardContainer: {
        height: 142,
        width: SIZES.width - 32,
        borderRadius: 32,
        backgroundColor: COLORS.white,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 8
    },
    doctorCard: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1
    },
    doctorImage: {
        height: 110,
        width: 110,
        borderRadius: 16,
        marginHorizontal: 16
    },
    doctorName: {
        fontSize: 18,
        color: COLORS.greyscale900,
        fontFamily: "bold",
        marginBottom: 8
    },
    separateLine: {
        height: 1,
        width: "100%",
        backgroundColor: COLORS.grayscale200,
        marginVertical: 12
    },
    doctorSpeciality: {
        fontSize: 12,
        color: COLORS.greyScale800,
        fontFamily: "medium",
        marginBottom: 8
    },
    doctorHospital: {
        fontSize: 12,
        color: COLORS.greyScale800,
        fontFamily: "medium"
    },
    iconContainer: {
        height: 60,
        width: 60,
        backgroundColor: COLORS.tansparentPrimary,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        marginRight: 8
    },
    nextIcon: {
        height: 24,
        width: 24,
        tintColor: COLORS.primary
    }
})

export default CallCard