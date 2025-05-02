import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Switch,
    TextInput,
    Alert,
    ActivityIndicator,
    Modal,
    ScrollView as RNScrollView,
    Keyboard,
    KeyboardAvoidingView,
    Platform
} from 'react-native'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { COLORS, SIZES, icons, images } from '../constants'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView } from 'react-native-virtualized-view'
import { MaterialIcons } from '@expo/vector-icons'
import { launchImagePicker } from '../utils/ImagePickerHelper'
import SettingsItem from '../components/SettingsItem'
import { useTheme } from '../theme/ThemeProvider'
import RBSheet from 'react-native-raw-bottom-sheet'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { logout } from '../firebase/auth'
import { calculateBMI, getBMICategory, getBMIStatusInfo, getNutritionPlan } from '../utils/BMICalculator'
import { useNutrition } from '../context/NutritionContext'

// Simple Number Input Component
const NumberInput = ({ value, onChangeText, style }) => {
    return (
        <TextInput
            style={[{
                height: 50, 
                backgroundColor: '#F5F7FA', 
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 10, 
                padding: 10, 
                marginBottom: 15
            }, style]}
            value={value}
            onChangeText={onChangeText}
            keyboardType="number-pad"
        />
    );
};

const Profile = ({ navigation }) => {
    const refRBSheet = useRef()
    const genderSheet = useRef()
    const activitySheet = useRef()
    const { dark, colors, setScheme } = useTheme()
    const { user, userData, saveHealthData, profileImage, updateProfileImage } = useAuth()
    const { nutritionPlan } = useNutrition()
    
    const [userName, setUserName] = useState('')
    const [userEmail, setUserEmail] = useState('')
    const [gender, setGender] = useState('Male')
    const [activityLevel, setActivityLevel] = useState('Moderate')
    const [loading, setLoading] = useState(false)
    const [userImage, setUserImage] = useState(null)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [showBmiInfo, setShowBmiInfo] = useState(false)
    
    // Use separate state variables for each field
    const [age, setAge] = useState('')
    const [weight, setWeight] = useState('')
    const [height, setHeight] = useState('')
    const [bloodPressure, setBloodPressure] = useState('')
    
    // BMI calculation 
    const bmi = weight && height 
        ? calculateBMI(parseFloat(weight), parseFloat(height))
        : 0;
    const bmiCategory = getBMICategory(bmi);
    const bmiInfo = getBMIStatusInfo(bmiCategory);
    
    // Activity level options
    const activityLevels = [
        { value: 'Sedentary', description: 'Little or no exercise' },
        { value: 'Light', description: 'Light exercise 1-3 days/week' },
        { value: 'Moderate', description: 'Moderate exercise 3-5 days/week' },
        { value: 'Active', description: 'Heavy exercise 6-7 days/week' },
        { value: 'Very Active', description: 'Very heavy exercise, physical job or training twice a day' },
    ];

    // Track keyboard visibility
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    
    // Set up keyboard listeners
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );

        // Cleanup function
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    useEffect(() => {
        if (user) {
            setUserName(user.displayName || 'User')
            setUserEmail(user.email || '')
        }
        
        if (userData) {
            // Update each state variable directly
            setAge(userData.age?.toString() || '')
            setWeight(userData.weight?.toString() || '')
            setHeight(userData.height?.toString() || '')
            setBloodPressure(userData.bloodPressure || '')
            
            setGender(userData.gender || 'Male')
            setActivityLevel(userData.activityLevel || 'Moderate')
        }
        
        // Set profile image if available
        if (profileImage) {
            setUserImage({ uri: profileImage })
        }
    }, [user, userData, profileImage])

    /**
     * Logout handler
     */
    const handleLogout = async () => {
        try {
            const { success, error } = await logout()
            if (success) {
                refRBSheet.current.close()
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Welcome' }],
                })
            } else {
                Alert.alert(
                    'Logout Error',
                    error || 'An error occurred while logging out'
                )
            }
        } catch (error) {
            console.error('Logout error:', error)
            Alert.alert('Logout Error', 'An error occurred while logging out')
        }
    }

    const handleSaveProfile = async () => {
        if (!user) {
            Alert.alert('Please login to save your profile')
            return
        }
        
        // Validate inputs
        if (!weight || !height || !age) {
            Alert.alert('Required Fields', 'Please fill in your weight, height, and age to calculate your BMI and nutrition plan.')
            return
        }
        
        setLoading(true)
        try {
            const healthData = {
                weight: weight ? parseFloat(weight) : null,
                height: height ? parseFloat(height) : null,
                bloodPressure: bloodPressure,
                age: age ? parseInt(age) : null,
                gender,
                activityLevel,
            }
            
            const result = await saveHealthData(healthData)
            
            if (result.success) {
                Alert.alert('Profile saved successfully!')
                
                // Show BMI information
                setShowBmiInfo(true)
            } else {
                Alert.alert('Failed to save profile: ' + (result.error || 'Unknown error'))
            }
        } catch (error) {
            console.error('Error saving profile:', error)
            Alert.alert('An error occurred while saving your profile')
        } finally {
            setLoading(false)
        }
    }

    /**
     * Render header
     */
    const renderHeader = () => {
        return (
            <TouchableOpacity style={styles.headerContainer}>
                <View style={styles.headerLeft}>
                    <Image
                        source={images.logo}
                        resizeMode="contain"
                        style={styles.logo}
                    />
                    <Text
                        style={[
                            styles.headerTitle,
                            {
                                color: dark
                                    ? COLORS.white
                                    : COLORS.greyscale900,
                            },
                        ]}
                    >
                        Profile
                    </Text>
                </View>
                <TouchableOpacity>
                    <Image
                        source={icons.moreCircle}
                        resizeMode="contain"
                        style={[
                            styles.headerIcon,
                            {
                                tintColor: dark
                                    ? COLORS.secondaryWhite
                                    : COLORS.greyscale900,
                            },
                        ]}
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        )
    }
    /**
     * Render User Profile
     */
    const renderProfile = () => {
        // Use profileImage from context or default user image
        const defaultImage = profileImage ? { uri: profileImage } : images.user1

        const pickImage = async () => {
            try {
                setUploadingImage(true)
                const tempUri = await launchImagePicker()

                if (!tempUri) {
                    setUploadingImage(false)
                    return
                }

                // Set the image locally for immediate UI update
                setUserImage({ uri: tempUri })

                // Update profile image in Firebase and context
                const result = await updateProfileImage(tempUri)
                
                if (!result.success) {
                    console.error('Failed to update profile image:', result.error)
                    Alert.alert('Image Upload Failed', 'The image could not be uploaded. Please try again.')
                } else {
                    // Success feedback
                    Alert.alert('Success', 'Your profile picture has been updated successfully!')
                }
                
                setUploadingImage(false)
            } catch (error) {
                console.error('Error picking image:', error)
                Alert.alert('Error', 'An error occurred while selecting an image')
                setUploadingImage(false)
            }
        }
        
        return (
            <View style={styles.profileContainer}>
                <View style={styles.imageContainer}>
                    <Image
                        source={userImage || defaultImage}
                        resizeMode="cover"
                        style={styles.avatar}
                    />
                    {uploadingImage ? (
                        <View style={styles.uploadingOverlay}>
                            <ActivityIndicator size="large" color={COLORS.white} />
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={pickImage}
                            style={styles.picContainer}
                        >
                            <MaterialIcons
                                name="camera-alt"
                                size={18}
                                color={COLORS.white}
                            />
                        </TouchableOpacity>
                    )}
                </View>
                <Text
                    style={[
                        styles.title,
                        {
                            color: dark
                                ? COLORS.secondaryWhite
                                : COLORS.greyscale900,
                        },
                    ]}
                >
                    {userName}
                </Text>
                <Text
                    style={[
                        styles.subtitle,
                        {
                            color: dark
                                ? COLORS.secondaryWhite
                                : COLORS.greyscale900,
                        },
                    ]}
                >
                    {userEmail}
                </Text>
            </View>
        )
    }
    
    // Render BMI Information Modal
    const renderBmiInfoModal = () => {
        return (
            <Modal
                visible={showBmiInfo}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowBmiInfo(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, {backgroundColor: dark ? COLORS.dark2 : COLORS.white}]}>
                        <Text style={[styles.modalTitle, {color: dark ? COLORS.white : COLORS.black}]}>
                            Your Health Profile
                        </Text>
                        
                        <View style={styles.bmiCircle}>
                            <Text style={styles.bmiValue}>{bmi}</Text>
                            <Text style={styles.bmiLabel}>BMI</Text>
                        </View>
                        
                        <Text style={[styles.bmiStatus, {
                            color: bmi > 0 ? getBmiStatusColor(bmiCategory) : COLORS.gray
                        }]}>
                            {bmi > 0 ? bmiInfo.status : 'Unknown'}
                        </Text>
                        
                        <Text style={[styles.bmiDescription, {color: dark ? COLORS.white : COLORS.black}]}>
                            {bmiInfo.description}
                        </Text>
                        
                        <View style={styles.nutritionPlanContainer}>
                            <Text style={[styles.nutritionTitle, {color: dark ? COLORS.white : COLORS.black}]}>
                                Daily Nutrition Goals:
                            </Text>
                            
                            {nutritionPlan ? (
                                <View style={styles.nutrientGoalsContainer}>
                                    <View style={styles.nutrientItem}>
                                        <Text style={styles.nutrientLabel}>Calories:</Text>
                                        <Text style={styles.nutrientValue}>{nutritionPlan.dailyCalories} kcal</Text>
                                    </View>
                                    <View style={styles.nutrientItem}>
                                        <Text style={styles.nutrientLabel}>Protein:</Text>
                                        <Text style={styles.nutrientValue}>{nutritionPlan.nutrientGoals.protein}g</Text>
                                    </View>
                                    <View style={styles.nutrientItem}>
                                        <Text style={styles.nutrientLabel}>Carbs:</Text>
                                        <Text style={styles.nutrientValue}>{nutritionPlan.nutrientGoals.carbs}g</Text>
                                    </View>
                                    <View style={styles.nutrientItem}>
                                        <Text style={styles.nutrientLabel}>Fat:</Text>
                                        <Text style={styles.nutrientValue}>{nutritionPlan.nutrientGoals.fat}g</Text>
                                    </View>
                                </View>
                            ) : (
                                <Text style={styles.noNutritionPlan}>
                                    Nutrition plan will be calculated based on your profile
                                </Text>
                            )}
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.modalButton}
                            onPress={() => setShowBmiInfo(false)}
                        >
                            <Text style={styles.modalButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };
    
    // Helper function to get color based on BMI category
    const getBmiStatusColor = (category) => {
        switch (category) {
            case 'underweight':
                return '#3498db'; // Blue
            case 'normal':
                return '#2ecc71'; // Green
            case 'overweight':
                return '#f39c12'; // Orange
            case 'obese':
                return '#e74c3c'; // Red
            case 'severely_obese':
                return '#c0392b'; // Dark Red
            default:
                return COLORS.gray;
        }
    };
    
    // Gender selection bottom sheet
    const renderGenderSheet = () => {
        return (
            <RBSheet
                ref={genderSheet}
                closeOnDragDown={true}
                closeOnPressMask={true}
                height={200}
                customStyles={{
                    wrapper: { backgroundColor: 'rgba(0,0,0,0.5)' },
                    draggableIcon: { backgroundColor: dark ? COLORS.gray2 : COLORS.grayscale200 },
                    container: {
                        borderTopRightRadius: 20, 
                        borderTopLeftRadius: 20,
                        backgroundColor: dark ? COLORS.dark2 : COLORS.white
                    }
                }}
            >
                <RNScrollView>
                    <Text style={[styles.sheetTitle, {color: dark ? COLORS.white : COLORS.black}]}>
                        Select Gender
                    </Text>
                    <TouchableOpacity 
                        style={[styles.sheetOption, gender === 'Male' && styles.selectedOption]}
                        onPress={() => {
                            setGender('Male');
                            genderSheet.current.close();
                        }}
                    >
                        <Text style={[styles.sheetOptionText, gender === 'Male' && styles.selectedOptionText]}>
                            Male
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.sheetOption, gender === 'Female' && styles.selectedOption]}
                        onPress={() => {
                            setGender('Female');
                            genderSheet.current.close();
                        }}
                    >
                        <Text style={[styles.sheetOptionText, gender === 'Female' && styles.selectedOptionText]}>
                            Female
                        </Text>
                    </TouchableOpacity>
                </RNScrollView>
            </RBSheet>
        );
    };
    
    // Activity level selection bottom sheet
    const renderActivitySheet = () => {
        return (
            <RBSheet
                ref={activitySheet}
                closeOnDragDown={true}
                closeOnPressMask={true}
                height={400}
                customStyles={{
                    wrapper: { backgroundColor: 'rgba(0,0,0,0.5)' },
                    draggableIcon: { backgroundColor: dark ? COLORS.gray2 : COLORS.grayscale200 },
                    container: {
                        borderTopRightRadius: 20, 
                        borderTopLeftRadius: 20,
                        backgroundColor: dark ? COLORS.dark2 : COLORS.white
                    }
                }}
            >
                <RNScrollView>
                    <Text style={[styles.sheetTitle, {color: dark ? COLORS.white : COLORS.black}]}>
                        Activity Level
                    </Text>
                    {activityLevels.map((level, index) => (
                        <TouchableOpacity 
                            key={index}
                            style={[styles.sheetOption, activityLevel === level.value && styles.selectedOption]}
                            onPress={() => {
                                setActivityLevel(level.value);
                                activitySheet.current.close();
                            }}
                        >
                            <Text style={[styles.sheetOptionText, activityLevel === level.value && styles.selectedOptionText]}>
                                {level.value}
                            </Text>
                            <Text style={styles.sheetOptionDescription}>
                                {level.description}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </RNScrollView>
            </RBSheet>
        );
    };
    
    // Simple focus handlers with no side effects
    const handleFocus = useCallback((inputName) => {
        // Intentionally left empty to avoid any focus-related issues
    }, []);
    
    const handleBlur = useCallback(() => {
        // Intentionally left empty to avoid any focus-related issues
    }, []);
    
    // Dismiss keyboard only when explicitly requested
    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };
    
    // Don't show any keyboard dismiss button
    const renderKeyboardDismissButton = () => {
        return null;
    };
    
    /**
     * Render Settings
     */
    const renderSettings = () => {
        const [isDarkMode, setIsDarkMode] = useState(false)

        const toggleDarkMode = () => {
            setIsDarkMode((prev) => !prev)
            dark ? setScheme('light') : setScheme('dark')
        }

        return (
            <View style={styles.settingsContainer}>
                <SettingsItem
                    icon={icons.location2Outline}
                    name="Address"
                    onPress={() => navigation.navigate('Address')}
                />
                <SettingsItem
                    icon={icons.userOutline}
                    name="Edit Profile"
                    onPress={() => navigation.navigate('EditProfile')}
                />
                <SettingsItem
                    icon={icons.bell2}
                    name="Notification"
                    onPress={() => navigation.navigate('SettingsNotifications')}
                />
                <SettingsItem
                    icon={icons.wallet2Outline}
                    name="Payment"
                    onPress={() => navigation.navigate('SettingsPayment')}
                />
                <SettingsItem
                    icon={icons.shieldOutline}
                    name="Security"
                    onPress={() => navigation.navigate('SettingsSecurity')}
                />
                <TouchableOpacity
                    onPress={() => navigation.navigate('SettingsLanguage')}
                    style={styles.settingsItemContainer}
                >
                    <View style={styles.leftContainer}>
                        <Image
                            source={icons.more}
                            resizeMode="contain"
                            style={[
                                styles.settingsIcon,
                                {
                                    tintColor: dark
                                        ? COLORS.white
                                        : COLORS.greyscale900,
                                },
                            ]}
                        />
                        <Text
                            style={[
                                styles.settingsName,
                                {
                                    color: dark
                                        ? COLORS.white
                                        : COLORS.greyscale900,
                                },
                            ]}
                        >
                            Language & Region
                        </Text>
                    </View>
                    <View style={styles.rightContainer}>
                        <Text
                            style={[
                                styles.rightLanguage,
                                {
                                    color: dark
                                        ? COLORS.white
                                        : COLORS.greyscale900,
                                },
                            ]}
                        >
                            English (US)
                        </Text>
                        <Image
                            source={icons.arrowRight}
                            resizeMode="contain"
                            style={[
                                styles.settingsArrowRight,
                                {
                                    tintColor: dark
                                        ? COLORS.white
                                        : COLORS.greyscale900,
                                },
                            ]}
                        />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingsItemContainer}>
                    <View style={styles.leftContainer}>
                        <Image
                            source={icons.show}
                            resizeMode="contain"
                            style={[
                                styles.settingsIcon,
                                {
                                    tintColor: dark
                                        ? COLORS.white
                                        : COLORS.greyscale900,
                                },
                            ]}
                        />
                        <Text
                            style={[
                                styles.settingsName,
                                {
                                    color: dark
                                        ? COLORS.white
                                        : COLORS.greyscale900,
                                },
                            ]}
                        >
                            Dark Mode
                        </Text>
                    </View>
                    <View style={styles.rightContainer}>
                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleDarkMode}
                            thumbColor={isDarkMode ? '#fff' : COLORS.white}
                            trackColor={{
                                false: '#EEEEEE',
                                true: COLORS.primary,
                            }}
                            ios_backgroundColor={COLORS.white}
                            style={styles.switch}
                        />
                    </View>
                </TouchableOpacity>
                <SettingsItem
                    icon={icons.lockedComputerOutline}
                    name="Privacy Policy"
                    onPress={() => navigation.navigate('SettingsPrivacyPolicy')}
                />
                <SettingsItem
                    icon={icons.infoCircle}
                    name="Help Center"
                    onPress={() => navigation.navigate('HelpCenter')}
                />
                <SettingsItem
                    icon={icons.people4}
                    name="Invite Friends"
                    onPress={() => navigation.navigate('InviteFriends')}
                />
                <TouchableOpacity
                    onPress={() => refRBSheet.current.open()}
                    style={styles.logoutContainer}
                >
                    <View style={styles.logoutLeftContainer}>
                        <Image
                            source={icons.logout}
                            resizeMode="contain"
                            style={[
                                styles.logoutIcon,
                                {
                                    tintColor: 'red',
                                },
                            ]}
                        />
                        <Text
                            style={[
                                styles.logoutName,
                                {
                                    color: 'red',
                                },
                            ]}
                        >
                            Logout
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
    return (
        <View style={{flex: 1, backgroundColor: colors.background}}>
            {renderHeader()}
            <ScrollView>
                {renderProfile()}
                <View style={{padding: 16}}>
                    <Text style={styles.title}>Your Health Profile</Text>
                    
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{userEmail}</Text>
                    
                    <Text style={styles.label}>Gender</Text>
                    <TouchableOpacity 
                        style={[styles.input, styles.selectInput, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}
                        onPress={() => genderSheet.current.open()}
                    >
                        <Text style={[styles.selectText, {color: dark ? COLORS.white : COLORS.black}]}>
                            {gender || 'Select gender'}
                        </Text>
                        <MaterialIcons name="arrow-drop-down" size={24} color={dark ? COLORS.white : COLORS.black} />
                    </TouchableOpacity>
                    
                    <Text style={styles.label}>Age</Text>
                    <NumberInput 
                        value={age}
                        onChangeText={(text) => setAge(text)}
                    />
                    
                    <Text style={styles.label}>Weight (kg)</Text>
                    <NumberInput 
                        value={weight}
                        onChangeText={(text) => setWeight(text)}
                    />
                    
                    <Text style={styles.label}>Height (cm)</Text>
                    <NumberInput 
                        value={height}
                        onChangeText={(text) => setHeight(text)}
                    />
                    
                    <Text style={styles.label}>Activity Level</Text>
                    <TouchableOpacity 
                        style={[styles.input, styles.selectInput, { backgroundColor: dark ? COLORS.dark2 : COLORS.white }]}
                        onPress={() => activitySheet.current.open()}
                    >
                        <Text style={[styles.selectText, {color: dark ? COLORS.white : COLORS.black}]}>
                            {activityLevel || 'Select activity level'}
                        </Text>
                        <MaterialIcons name="arrow-drop-down" size={24} color={dark ? COLORS.white : COLORS.black} />
                    </TouchableOpacity>
                    
                    <Text style={styles.label}>Blood Pressure</Text>
                    <NumberInput 
                        value={bloodPressure}
                        onChangeText={(text) => setBloodPressure(text)}
                    />
                    
                    {bmi > 0 && (
                        <TouchableOpacity 
                            style={styles.bmiContainer}
                            onPress={() => setShowBmiInfo(true)}
                        >
                            <View style={styles.bmiHeader}>
                                <Text style={styles.bmiHeaderText}>Your BMI</Text>
                                <MaterialIcons name="info-outline" size={20} color={COLORS.primary} />
                            </View>
                            <View style={styles.bmiContent}>
                                <Text style={styles.bmiValueText}>{bmi}</Text>
                                <Text style={[styles.bmiCategoryText, {color: getBmiStatusColor(bmiCategory)}]}>
                                    {bmiInfo.status}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity 
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSaveProfile}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.buttonText}>Save Profile</Text>
                        )}
                    </TouchableOpacity>
                    
                    {userData && userData.lastUpdated && (
                        <Text style={styles.lastUpdated}>
                            Last updated: {new Date(userData.lastUpdated).toLocaleString()}
                        </Text>
                    )}
                    
                    <View style={styles.spacer} />
                    {renderSettings()}
                </View>
            </ScrollView>
            
            {renderGenderSheet()}
            {renderActivitySheet()}
            {renderBmiInfoModal()}
            
            <RBSheet
                ref={refRBSheet}
                closeOnDragDown={true}
                closeOnPressMask={false}
                height={SIZES.height * 0.8}
                customStyles={{
                    wrapper: {
                        backgroundColor: 'rgba(0,0,0,0.5)',
                    },
                    draggableIcon: {
                        backgroundColor: dark
                            ? COLORS.gray2
                            : COLORS.grayscale200,
                        height: 4,
                    },
                    container: {
                        borderTopRightRadius: 32,
                        borderTopLeftRadius: 32,
                        height: 260,
                        backgroundColor: dark ? COLORS.dark2 : COLORS.white,
                    },
                }}
            >
                <Text style={styles.bottomTitle}>Logout</Text>
                <View
                    style={[
                        styles.separateLine,
                        {
                            backgroundColor: dark
                                ? COLORS.greyScale800
                                : COLORS.grayscale200,
                        },
                    ]}
                />
                <Text
                    style={[
                        styles.bottomSubtitle,
                        {
                            color: dark ? COLORS.white : COLORS.black,
                        },
                    ]}
                >
                    Are you sure you want to log out?
                </Text>
                <View style={styles.bottomContainer}>
                    <Button
                        title="Cancel"
                        style={{
                            width: (SIZES.width - 32) / 2 - 8,
                            backgroundColor: dark
                                ? COLORS.dark3
                                : COLORS.tansparentPrimary,
                            borderRadius: 32,
                            borderColor: dark
                                ? COLORS.dark3
                                : COLORS.tansparentPrimary,
                        }}
                        onPress={() => refRBSheet.current.close()}
                    />
                    <Button
                        title="Yes, Logout"
                        filled
                        style={{
                            width: (SIZES.width - 32) / 2 - 8,
                            backgroundColor: COLORS.primary,
                            borderRadius: 32,
                        }}
                        onPress={handleLogout}
                    />
                </View>
            </RBSheet>
        </View>
    )
}

const styles = StyleSheet.create({
    area: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        padding: 16,
        marginBottom: 32,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        height: 32,
        width: 32,
        tintColor: COLORS.primary,
    },
    headerTitle: {
        fontSize: 22,
        fontFamily: 'bold',
        color: COLORS.greyscale900,
        marginLeft: 12,
    },
    headerIcon: {
        height: 24,
        width: 24,
        tintColor: COLORS.greyscale900,
    },
    profileContainer: {
        alignItems: 'center',
        borderBottomColor: COLORS.grayscale400,
        borderBottomWidth: 0.4,
        paddingVertical: 20,
    },
    imageContainer: {
        position: 'relative',
        width: 140,
        height: 140,
        borderRadius: 70,
        elevation: 10,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    avatar: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 3,
        borderColor: COLORS.white,
    },
    uploadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
    },
    picContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        position: 'absolute',
        right: 5,
        bottom: 5,
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    title: {
        fontSize: 20,
        fontFamily: 'bold',
        color: COLORS.greyscale900,
        marginTop: 16,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.greyscale900,
        fontFamily: 'regular',
        marginTop: 4,
    },
    settingsContainer: {
        marginVertical: 12,
    },
    settingsItemContainer: {
        width: SIZES.width - 32,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 12,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingsIcon: {
        height: 24,
        width: 24,
        tintColor: COLORS.greyscale900,
    },
    settingsName: {
        fontSize: 18,
        fontFamily: 'semiBold',
        color: COLORS.greyscale900,
        marginLeft: 12,
    },
    settingsArrowRight: {
        width: 24,
        height: 24,
        tintColor: COLORS.greyscale900,
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rightLanguage: {
        fontSize: 18,
        fontFamily: 'semiBold',
        color: COLORS.greyscale900,
        marginRight: 8,
    },
    switch: {
        marginLeft: 8,
        transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }], // Adjust the size of the switch
    },
    logoutContainer: {
        width: SIZES.width - 32,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 12,
    },
    logoutLeftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoutIcon: {
        height: 24,
        width: 24,
        tintColor: COLORS.greyscale900,
    },
    logoutName: {
        fontSize: 18,
        fontFamily: 'semiBold',
        color: COLORS.greyscale900,
        marginLeft: 12,
    },
    bottomContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 12,
        paddingHorizontal: 16,
    },
    bottomTitle: {
        fontSize: 24,
        fontFamily: 'semiBold',
        color: 'red',
        textAlign: 'center',
        marginTop: 12,
    },
    bottomSubtitle: {
        fontSize: 20,
        fontFamily: 'semiBold',
        color: COLORS.greyscale900,
        textAlign: 'center',
        marginVertical: 28,
    },
    separateLine: {
        width: SIZES.width,
        height: 1,
        backgroundColor: COLORS.grayscale200,
        marginTop: 12,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    value: {
        fontSize: 16,
        marginBottom: 15,
        color: '#555',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        marginBottom: 15,
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        height: 50,
        justifyContent: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    lastUpdated: {
        marginTop: 15,
        color: '#888',
        fontSize: 12,
        textAlign: 'center',
    },
    spacer: {
        height: 50,
    },
    // Selection inputs
    selectInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectText: {
        fontSize: 16,
    },
    
    // Bottom sheets
    sheetTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 15,
    },
    sheetOption: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    selectedOption: {
        backgroundColor: COLORS.primary + '20',
    },
    sheetOptionText: {
        fontSize: 16,
    },
    selectedOptionText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    sheetOptionDescription: {
        fontSize: 12,
        color: COLORS.gray,
        marginTop: 4,
    },
    
    // BMI display
    bmiContainer: {
        backgroundColor: COLORS.secondaryWhite,
        borderRadius: 10,
        padding: 15,
        marginTop: 20,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    bmiHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    bmiHeaderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    bmiContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bmiValueText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginRight: 15,
    },
    bmiCategoryText: {
        fontSize: 18,
        fontWeight: '500',
    },
    
    // BMI info modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        maxHeight: '80%',
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    bmiCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    bmiValue: {
        fontSize: 30,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    bmiLabel: {
        fontSize: 14,
        color: COLORS.white,
        opacity: 0.8,
    },
    bmiStatus: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    bmiDescription: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    nutritionPlanContainer: {
        width: '100%',
        marginTop: 5,
        marginBottom: 15,
    },
    nutritionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    nutrientGoalsContainer: {
        width: '100%',
    },
    nutrientItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    nutrientLabel: {
        fontSize: 16,
        color: COLORS.gray,
    },
    nutrientValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    noNutritionPlan: {
        fontSize: 14,
        color: COLORS.gray,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    modalButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
        marginTop: 10,
    },
    modalButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    focusedInput: {
        borderColor: COLORS.primary,
        borderWidth: 2,
    },
    focusedInputWrapper: {
        borderColor: COLORS.primary,
        borderWidth: 2,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        overflow: 'hidden',
    },
    inputField: {
        padding: 12,
        fontSize: 16,
        flex: 1,
        borderWidth: 0,
    },
    keyboardDismissButton: {
        position: 'absolute',
        right: 20,
        bottom: 30,
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        zIndex: 999,
    },
    keyboardDismissText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
})

export default Profile
