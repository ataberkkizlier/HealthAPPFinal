import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Switch,
    TextInput,
} from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
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

const Profile = ({ navigation }) => {
    const refRBSheet = useRef()
    const { dark, colors, setScheme } = useTheme()
    const { user, userData, saveHealthData } = useAuth()
    const [userName, setUserName] = useState('')
    const [userEmail, setUserEmail] = useState('')
    const [weight, setWeight] = useState('')
    const [height, setHeight] = useState('')
    const [bloodPressure, setBloodPressure] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (user) {
            setUserName(user.displayName || 'User')
            setUserEmail(user.email || '')
        }
        if (userData) {
            setWeight(userData.weight?.toString() || '')
            setHeight(userData.height?.toString() || '')
            setBloodPressure(userData.bloodPressure || '')
        }
    }, [user, userData])

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
        
        setLoading(true)
        try {
            const healthData = {
                weight: weight ? parseFloat(weight) : null,
                height: height ? parseFloat(height) : null,
                bloodPressure,
            }
            
            const result = await saveHealthData(healthData)
            
            if (result.success) {
                Alert.alert('Profile saved successfully!')
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
        const [image, setImage] = useState(images.user1)

        const pickImage = async () => {
            try {
                const tempUri = await launchImagePicker()

                if (!tempUri) return

                // set the image
                setImage({ uri: tempUri })
            } catch (error) {}
        }
        return (
            <View style={styles.profileContainer}>
                <View>
                    <Image
                        source={image}
                        resizeMode="cover"
                        style={styles.avatar}
                    />
                    <TouchableOpacity
                        onPress={pickImage}
                        style={styles.picContainer}
                    >
                        <MaterialIcons
                            name="edit"
                            size={16}
                            color={COLORS.white}
                        />
                    </TouchableOpacity>
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
        <SafeAreaView
            style={[styles.area, { backgroundColor: colors.background }]}
        >
            <View
                style={[
                    styles.container,
                    { backgroundColor: colors.background },
                ]}
            >
                {renderHeader()}
                <ScrollView showsVerticalScrollIndicator={false}>
                    {renderProfile()}
                    <Text style={styles.title}>Your Health Profile</Text>
                    
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{userEmail}</Text>
                    
                    <Text style={styles.label}>Weight (kg)</Text>
                    <TextInput
                        style={styles.input}
                        value={weight}
                        onChangeText={setWeight}
                        placeholder="Enter your weight"
                        keyboardType="numeric"
                    />
                    
                    <Text style={styles.label}>Height (cm)</Text>
                    <TextInput
                        style={styles.input}
                        value={height}
                        onChangeText={setHeight}
                        placeholder="Enter your height"
                        keyboardType="numeric"
                    />
                    
                    <Text style={styles.label}>Blood Pressure</Text>
                    <TextInput
                        style={styles.input}
                        value={bloodPressure}
                        onChangeText={setBloodPressure}
                        placeholder="e.g. 120/80"
                    />
                    
                    <TouchableOpacity 
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSaveProfile}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Saving...' : 'Save Profile'}
                        </Text>
                    </TouchableOpacity>
                    
                    {userData && userData.lastUpdated && (
                        <Text style={styles.lastUpdated}>
                            Last updated: {new Date(userData.lastUpdated).toLocaleString()}
                        </Text>
                    )}
                    
                    <View style={styles.spacer} />
                    {renderSettings()}
                </ScrollView>
            </View>
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
        </SafeAreaView>
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
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 999,
    },
    picContainer: {
        width: 20,
        height: 20,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        position: 'absolute',
        right: 0,
        bottom: 12,
    },
    title: {
        fontSize: 18,
        fontFamily: 'bold',
        color: COLORS.greyscale900,
        marginTop: 12,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.greyscale900,
        fontFamily: 'medium',
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
        marginTop: 10,
        marginBottom: 5,
    },
    value: {
        fontSize: 16,
        marginBottom: 15,
        color: '#555',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
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
})

export default Profile
