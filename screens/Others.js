import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Nutrition = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            { /* Back Button */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate('Main')} // Go back to Home
            >
                <Image source={require('../assets/icons/back.png')} style={styles.backIcon} />
                <Text style={styles.backText}>Home</Text>
            </TouchableOpacity>

            {/* Screen Title */}
            <Text style={styles.text}>Others</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingTop: 50,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    backIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
    backText: {
        marginLeft: 5,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007bff',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 50,
    },
});

export default Nutrition;
