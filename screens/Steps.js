// screens/Steps.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar, 
  ScrollView, 
  SafeAreaView,
  Platform
} from 'react-native';
import { useSteps } from '../context/StepsContext';
import { COLORS } from '../constants';
import { Ionicons } from '@expo/vector-icons';

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
    const [stepInput, setStepInput] = useState('');
    
    // Calculate percentage completion
    const percentage = Math.min(100, Math.round((steps / dailyGoal) * 100));
    
    // Calculate remaining steps
    const remainingSteps = Math.max(0, dailyGoal - steps);

    const handleAddSteps = () => {
        const stepValue = parseInt(stepInput);
        if (!isNaN(stepValue) && stepValue > 0) {
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

    // Quick add buttons for common step counts
    const quickAdd = (amount) => {
        const newSteps = steps + amount;
        updateSteps(newSteps);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.navigate('Home')}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Daily Steps Tracker</Text>
                    <TouchableOpacity 
                        style={styles.resetButton}
                        onPress={handleResetSteps}
                    >
                        <Ionicons name="refresh" size={22} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
            
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Progress Summary */}
                <View style={styles.summaryCard}>
                    <View style={styles.progressHeader}>
                        <View style={styles.progressInfo}>
                            <Text style={styles.progressTitle}>Today's Steps</Text>
                            <View style={styles.progressValues}>
                                <Text style={styles.intakeValue}>{steps}</Text>
                                <Text style={styles.goalValue}> / {dailyGoal} steps</Text>
                            </View>
                        </View>
                        <View style={styles.circleProgressContainer}>
                            <View style={styles.circleProgress}>
                                <Text style={styles.percentageText}>{percentage}%</Text>
                            </View>
                        </View>
                    </View>
                    
                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressBarTrack}>
                            <View 
                                style={[
                                    styles.progressBarFill, 
                                    { width: `${Math.min(100, percentage)}%` }
                                ]} 
                            />
                        </View>
                    </View>
                    
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{steps}</Text>
                            <Text style={styles.statLabel}>Steps Taken</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{remainingSteps}</Text>
                            <Text style={styles.statLabel}>Steps Left</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{Math.round(steps * 0.0005 * 100) / 100}</Text>
                            <Text style={styles.statLabel}>km Walked</Text>
                        </View>
                    </View>
                </View>
                
                {/* Add Steps Section */}
                <View style={styles.addStepsCard}>
                    <Text style={styles.sectionTitle}>Add Steps</Text>
                    
                    <View style={styles.quickAddContainer}>
                        <TouchableOpacity 
                            style={styles.quickAddButton} 
                            onPress={() => quickAdd(500)}
                        >
                            <Text style={styles.quickAddText}>500</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.quickAddButton} 
                            onPress={() => quickAdd(1000)}
                        >
                            <Text style={styles.quickAddText}>1,000</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.quickAddButton} 
                            onPress={() => quickAdd(2000)}
                        >
                            <Text style={styles.quickAddText}>2,000</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.customAddLabel}>Custom Amount:</Text>
                    <View style={styles.customAddContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter steps"
                            keyboardType="numeric"
                            value={stepInput}
                            onChangeText={setStepInput}
                            placeholderTextColor="#9E9E9E"
                        />
                        <TouchableOpacity 
                            style={styles.addButton} 
                            onPress={handleAddSteps}
                        >
                            <Text style={styles.addButtonText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                
                {/* Tips Section */}
                <View style={styles.tipsCard}>
                    <View style={styles.tipsHeader}>
                        <Ionicons name="footsteps-outline" size={22} color={COLORS.primary} style={styles.tipsIcon} />
                        <Text style={styles.tipsTitle}>Walking Tips</Text>
                    </View>
                    
                    <View style={styles.tipItem}>
                        <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                        <Text style={styles.tipText}>Aim for at least 10,000 steps daily for cardiovascular health</Text>
                    </View>
                    
                    <View style={styles.tipItem}>
                        <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                        <Text style={styles.tipText}>Take short walking breaks every hour if you work at a desk</Text>
                    </View>
                    
                    <View style={styles.tipItem}>
                        <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                        <Text style={styles.tipText}>Walking 30 minutes daily can reduce risk of chronic diseases</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        backgroundColor: COLORS.primary,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 15,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    resetButton: {
        padding: 8,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 30,
    },
    summaryCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    progressInfo: {
        flex: 1,
    },
    progressTitle: {
        fontSize: 16,
        color: '#757575',
        marginBottom: 5,
    },
    progressValues: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    intakeValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    goalValue: {
        fontSize: 18,
        color: '#757575',
    },
    circleProgressContainer: {
        width: 70,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
    },
    circleProgress: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 5,
        borderColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    percentageText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    progressBarContainer: {
        marginTop: 10,
        marginBottom: 20,
    },
    progressBarTrack: {
        height: 10,
        backgroundColor: '#E0E0E0',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 5,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    statLabel: {
        fontSize: 14,
        color: '#757575',
        marginTop: 5,
    },
    statDivider: {
        width: 1,
        height: '100%',
        backgroundColor: '#E0E0E0',
    },
    addStepsCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15,
    },
    quickAddContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    quickAddButton: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    quickAddText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    customAddLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 10,
    },
    customAddContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        height: 50,
        backgroundColor: '#F5F7FA',
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#333',
        marginRight: 10,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        height: 50,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    tipsCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 16,
    },
    tipsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    tipsIcon: {
        marginRight: 8,
    },
    tipsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    tipText: {
        fontSize: 14,
        color: '#616161',
        marginLeft: 10,
        flex: 1,
    }
});