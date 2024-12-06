import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, icons, images } from '../constants';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// Voice call
const VoiceCall = ({ navigation }) => {
    const [volumeOff, setVolumeOff] = useState(false);
    const [microOff, setMicroOff] = useState(false);

    return (
        <LinearGradient
            // Button Linear Gradient
            colors={['#3EDCF4', '#AA8AF8', '#E97AF3', '#FD6866', '#f57c57']}
            style={styles.container}>
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backBtn}>
                <Image
                    source={icons.back}
                    resizeMode='contain'
                    style={styles.arrowBackIcon}
                />
            </TouchableOpacity>
            <Image
                source={images.doctor5}
                resizeMode='contain'
                style={styles.avatar}
            />
            <Text style={styles.driverName}>Dr. Jenny Watson</Text>
            <Text style={styles.duration}>02:25 mins</Text>
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    onPress={() => setVolumeOff(!volumeOff)}
                    style={styles.actionBtn}>
                    <Ionicons name={volumeOff ? "volume-mute" : "volume-medium"} size={24} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setMicroOff(!microOff)}
                    style={styles.actionBtn}>
                    <MaterialCommunityIcons name={microOff ? "microphone-off" : "microphone"} size={24} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => navigation.navigate("SessionEnded")}
                    style={[styles.actionBtn, {
                        backgroundColor: "#F75555"
                    }]}>
                    <MaterialCommunityIcons name="phone-remove" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>
        </LinearGradient>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    avatar: {
        height: 172,
        width: 172,
        borderRadius: 999
    },
    driverName: {
        fontSize: 26,
        fontWeight: "bold",
        color: COLORS.white,
        marginVertical: 12
    },
    duration: {
        fontSize: 14,
        color: COLORS.white,
        fontFamily: "regular"
    },
    backBtn: {
        position: "absolute",
        left: 22,
        top: 22
    },
    arrowBackIcon: {
        height: 24,
        width: 24,
        tintColor: COLORS.white
    },
    bottomContainer: {
        position: "absolute",
        bottom: 36,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        width: SIZES.width - 32,
        height: 52
    },
    actionBtn: {
        height: 58,
        width: 58,
        borderRadius: 26,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255,.4)",
        marginHorizontal: 12
    }
})

export default VoiceCall