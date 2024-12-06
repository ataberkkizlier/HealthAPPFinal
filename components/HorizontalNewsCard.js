import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { COLORS, SIZES } from '../constants';
import { useTheme } from '../theme/ThemeProvider';

const HorizontalNewsCard = ({
    title,
    category,
    image,
    date,
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
            <View style={styles.columnContainer}>
                <Text style={[styles.date, {
                    color: dark ? COLORS.greyscale500 : COLORS.grayscale700,
                }]}>{date}</Text>
                <View style={styles.topViewContainer}>
                    <Text style={[styles.name, {
                        color: dark ? COLORS.secondaryWhite : COLORS.greyscale900
                    }]}>{title}</Text>
                </View>
                <View style={styles.viewContainer}>
                    <View style={styles.categoryContainer}>
                        <Text style={styles.category}>{category}</Text>
                    </View>
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
        marginVertical: 6,
        marginRight: 40
    },
    date: {
        fontSize: 10,
        fontFamily: "medium",
        color: COLORS.grayscale700,
        marginVertical: 4
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
    categoryContainer: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: COLORS.tansparentPrimary,
        borderRadius: 3
    },
    category: {
        fontSize: 10,
        fontFamily: "semiBold",
        color: COLORS.primary,
        marginHorizontal: 4
    }
});

export default HorizontalNewsCard