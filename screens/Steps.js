// screens/Steps.js
import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useSteps } from '../context/StepsContext';

export default function Steps({ navigation }) {
    const context = useSteps();

    if (!context) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Error: Steps Context Not Available</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.backButtonText}>Back to Home</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const { updateSteps, steps, dailyGoal, resetSteps } = context;
    const [stepInput, setStepInput] = React.useState('');

    const handleAddSteps = () => {
        const stepValue = parseInt(stepInput);
        if (!isNaN(stepValue)) {
            const newSteps = steps + stepValue;
            updateSteps(newSteps);
            console.log('Added steps:', stepValue, 'New total:', newSteps);
            setStepInput('');
        }
    };

    const handleResetSteps = () => {
        resetSteps();
        setStepInput('');
    };

    console.log('Steps.js render - Current steps:', steps);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Daily Steps Tracker</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter number of steps"
                keyboardType="numeric"
                value={stepInput}
                onChangeText={setStepInput}
            />
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.addButton} onPress={handleAddSteps}>
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resetButton} onPress={handleResetSteps}>
                    <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.result}>
                Total Steps: {steps} / {dailyGoal}
            </Text>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
                <Text style={styles.backButtonText}>Back to Home</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f0f8ff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    input: {
        height: 50,
        width: '100%',
        borderColor: '#007bff',
        borderWidth: 2,
        borderRadius: 10,
        marginBottom: 20,
        paddingHorizontal: 15,
        fontSize: 18,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '60%',
        marginBottom: 20,
    },
    addButton: {
        backgroundColor: '#007bff',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resetButton: {
        backgroundColor: '#ff4d4d',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    resetButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    result: {
        marginTop: 20,
        fontSize: 22,
        color: '#333',
    },
    backButton: {
        marginTop: 30,
        backgroundColor: '#ccc',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    backButtonText: {
        color: '#333',
        fontSize: 18,
        fontWeight: 'bold',
    },
});