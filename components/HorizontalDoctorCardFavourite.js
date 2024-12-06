import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { COLORS, SIZES, icons } from '../constants';
import { useTheme } from '../theme/ThemeProvider';
import { FontAwesome } from "@expo/vector-icons";

const HorizontalDoctorCardFavourite = ({
    name,
    image,
    distance,
    hospital,
    consultationFee,
    rating,
    numReviews,
    isAvailable,
    onPress
}) => {
    const { dark } = useTheme();

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.container, {
                backgroundColor: dark ? COLORS.dark2 : COLORS.white
            }]}>
            <Image
                source={image}
                resizeMode='cover'
                style={styles.image}
            />
            {
                isAvailable && isAvailable === true && (
                    <View style={styles.reviewContainer}>
                        <Text style={styles.rating}>OPEN</Text>
                    </View>
                )
            }
            <View style={styles.columnContainer}>
                <View style={styles.topViewContainer}>
                    <Text style={[styles.name, {
                        color: dark ? COLORS.secondaryWhite : COLORS.greyscale900
                    }]}>{name}</Text>
                </View>
                <View style={styles.viewContainer}>
                    <FontAwesome name="star" size={14} color="rgb(250, 159, 28)" />
                    <Text style={[styles.hospital, {
                        color: dark ? COLORS.greyscale300 : COLORS.grayscale700,
                    }]}>{" "}{rating}  ({numReviews})</Text>
                    <Text style={[styles.hospital, {
                        color: dark ? COLORS.greyscale300 : COLORS.grayscale700,
                    }]}>{"  "}|  {distance}</Text>
                </View>
                <Text style={[styles.hospital, {
                    color: dark ? COLORS.grayscale400 : COLORS.grayscale700,
                }]}>{hospital}</Text>
                <View style={styles.bottomViewContainer}>
                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>{consultationFee}</Text>
                    </View>
                    <TouchableOpacity>
                        <Image
                            source={icons.heart2}
                            resizeMode='contain'
                            style={styles.heartIcon}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    )
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        width: SIZES.width - 32,
        backgroundColor: COLORS.white,
        padding: 6,
        borderRadius: 16,
        marginBottom: 12,
        height: 132,
        alignItems: "center",
    },
    image: {
        width: 120,
        height: 120,
        borderRadius: 16
    },
    columnContainer: {
        flexDirection: "column",
        marginLeft: 12,
        flex: 1
    },
    name: {
        fontSize: 17,
        fontFamily: "bold",
        color: COLORS.greyscale900,
        marginVertical: 4,
        marginRight: 40
    },
    hospital: {
        fontSize: 14,
        fontFamily: "regular",
        color: COLORS.grayscale700,
        marginVertical: 4
    },
    priceContainer: {
        flexDirection: "column",
        marginVertical: 4,
    },
    duration: {
        fontSize: 12,
        fontFamily: "semiBold",
        color: COLORS.primary,
        marginRight: 8
    },
    heartIcon: {
        width: 16,
        height: 16,
        tintColor: COLORS.primary,
        marginLeft: 6
    },
    reviewContainer: {
        position: "absolute",
        top: 16,
        left: 16,
        width: 40,
        height: 20,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
        zIndex: 999,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    rating: {
        fontSize: 10,
        fontFamily: "semiBold",
        color: COLORS.white,
        marginLeft: 4
    },
    topViewContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: SIZES.width - 164
    },
    bottomViewContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 2
    },
    viewContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 4
    },
    priceContainer: {
        flexDirection: "row",
        alignItems: "center"
    },
    price: {
        fontSize: 16,
        fontFamily: "semiBold",
        color: COLORS.primary,
        marginRight: 8
    },
    motoIcon: {
        height: 18,
        width: 18,
        tintColor: COLORS.primary,
        marginRight: 4
    }
});

export default HorizontalDoctorCardFavourite