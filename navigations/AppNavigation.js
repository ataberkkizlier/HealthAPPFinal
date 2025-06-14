import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native'
import {
    AddNewAddress,
    AddNewCard,
    Address,
    ArticlesDetails,
    ArticlesSeeAll,
    BookAppointment,
    CancelAppointment,
    CancelAppointmentPaymentMethods,
    Categories,
    ChangeEmail,
    ChangePIN,
    ChangePassword,
    Chat,
    CreateNewPIN,
    CreateNewPassword,
    CustomerService,
    DoctorDetails,
    DoctorReviews,
    EReceipt,
    EditProfile,
    EnterYourPIN,
    Favourite,
    FillYourProfile,
    Fingerprint,
    ForgotPasswordEmail,
    ForgotPasswordMethods,
    ForgotPasswordPhoneNumber,
    HelpCenter,
    InviteFriends,
    LeaveReview,
    Login,
    Messaging,
    MyAppointmentMessaging,
    MyAppointmentVideoCall,
    MyAppointmentVoiceCall,
    MyBookmarkedArticles,
    Notifications,
    OTPVerification,
    PatientDetails,
    PaymentMethods,
    RescheduleAppointment,
    ReviewSummary,
    Search,
    SelectPackage,
    SelectRescheduleAppointmentDate,
    SessionEnded,
    SettingsLanguage,
    SettingsNotifications,
    SettingsPayment,
    SettingsPrivacyPolicy,
    SettingsSecurity,
    Signup,
    TopDoctors,
    TrendingArticles,
    VideoCall,
    VideoCallHistoryDetails,
    VideoCallHistoryDetailsPlayRecordings,
    VoiceCall,
    VoiceCallHistoryDetails,
    VoiceCallHistoryDetailsPlayRecordings,
    Welcome,
} from '../screens'

import BottomTabNavigation from './BottomTabNavigation'
import OnboardingCarousel from '../screens/OnboardingCarousel'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ActivityIndicator, Text, View } from 'react-native'
import { COLORS } from '../constants'

// Health Dashboard Import
import HealthDashboard from '../screens/HealthDashboard'

// Health Category Screens
import Workout from '../screens/Workout'
import Nutrition from '../screens/Nutrition'
import WaterIntake from '../screens/WaterIntake'
import MentalHealth from '../screens/MentalHealth'
import Sleep from '../screens/Sleep'
import Steps from '../screens/Steps'
import BloodPressure from '../screens/BloodPressure'
import Others from '../screens/Others'

const Stack = createNativeStackNavigator()

const AppNavigation = () => {
    const { user, isAuthenticated, loading } = useAuth()
    const [isFirstLaunch, setIsFirstLaunch] = useState(null)
    const [appReady, setAppReady] = useState(false)

    useEffect(() => {
        const checkFirstLaunch = async () => {
            try {
                const value = await AsyncStorage.getItem('alreadyLaunched')
                if (value === null) {
                    await AsyncStorage.setItem('alreadyLaunched', 'true')
                    setIsFirstLaunch(true)
                } else {
                    setIsFirstLaunch(false)
                }
                setAppReady(true)
            } catch (error) {
                console.error('Error checking first launch:', error)
                setIsFirstLaunch(false)
                setAppReady(true)
            }
        }

        checkFirstLaunch()
    }, [])

    // Wait for auth to load and first launch check
    if (loading || !appReady) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 10, fontSize: 16 }}>
                    Yükleniyor...
                </Text>
            </View>
        )
    }

    // Determine initial route based on auth state and first launch status
    let initialRoute = 'Welcome'
    if (isFirstLaunch) {
        initialRoute = 'Onboarding'
    } else if (isAuthenticated) {
        initialRoute = 'Main'
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    detachPreviousScreen: false, // Critical fix for navigation params
                }}
                initialRouteName={initialRoute}
            >
                {/* Onboarding Flow */}
                <Stack.Screen
                    name="Onboarding"
                    component={OnboardingCarousel}
                />

                {/* Auth Flow */}
                <Stack.Screen name="Welcome" component={Welcome} />
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Signup" component={Signup} />
                <Stack.Screen
                    name="ForgotPasswordMethods"
                    component={ForgotPasswordMethods}
                />
                <Stack.Screen
                    name="ForgotPasswordEmail"
                    component={ForgotPasswordEmail}
                />
                <Stack.Screen
                    name="ForgotPasswordPhoneNumber"
                    component={ForgotPasswordPhoneNumber}
                />
                <Stack.Screen
                    name="OTPVerification"
                    component={OTPVerification}
                />
                <Stack.Screen
                    name="CreateNewPassword"
                    component={CreateNewPassword}
                />

                {/* MAIN FIX: DoctorDetails MUST be registered before BottomTabNavigation */}
                <Stack.Screen name="DoctorDetails" component={DoctorDetails} />

                {/* Main App */}
                <Stack.Screen
                    name="Main"
                    component={BottomTabNavigation}
                    options={{
                        // Prevent going back to login screen
                        gestureEnabled: false,
                    }}
                />

                {/* Profile Setup */}
                <Stack.Screen
                    name="FillYourProfile"
                    component={FillYourProfile}
                />
                <Stack.Screen name="CreateNewPIN" component={CreateNewPIN} />
                <Stack.Screen name="Fingerprint" component={Fingerprint} />

                {/* Health Dashboard */}
                <Stack.Screen name="HealthDashboard" component={HealthDashboard} />

                {/* Category Screens */}
                <Stack.Screen name="Workout" component={Workout} />
                <Stack.Screen name="Nutrition" component={Nutrition} />
                <Stack.Screen name="WaterIntake" component={WaterIntake} />
                <Stack.Screen name="MentalHealth" component={MentalHealth} />
                <Stack.Screen name="Sleep" component={Sleep} />
                <Stack.Screen name="Steps" component={Steps} />
                <Stack.Screen name="BloodPressure" component={BloodPressure} />
                <Stack.Screen name="Others" component={Others} />

                {/* Existing Screens */}
                <Stack.Screen name="EditProfile" component={EditProfile} />
                <Stack.Screen
                    name="SettingsNotifications"
                    component={SettingsNotifications}
                />
                <Stack.Screen
                    name="SettingsPayment"
                    component={SettingsPayment}
                />
                <Stack.Screen name="AddNewCard" component={AddNewCard} />
                <Stack.Screen
                    name="SettingsSecurity"
                    component={SettingsSecurity}
                />
                <Stack.Screen name="ChangePIN" component={ChangePIN} />
                <Stack.Screen
                    name="ChangePassword"
                    component={ChangePassword}
                />
                <Stack.Screen name="ChangeEmail" component={ChangeEmail} />
                <Stack.Screen
                    name="SettingsLanguage"
                    component={SettingsLanguage}
                />
                <Stack.Screen
                    name="SettingsPrivacyPolicy"
                    component={SettingsPrivacyPolicy}
                />
                <Stack.Screen name="InviteFriends" component={InviteFriends} />
                <Stack.Screen name="HelpCenter" component={HelpCenter} />
                <Stack.Screen
                    name="CustomerService"
                    component={CustomerService}
                />
                <Stack.Screen name="EReceipt" component={EReceipt} />
                <Stack.Screen name="Chat" component={Chat} />
                <Stack.Screen name="Notifications" component={Notifications} />
                <Stack.Screen name="Search" component={Search} />
                <Stack.Screen
                    name="PaymentMethods"
                    component={PaymentMethods}
                />
                <Stack.Screen name="ReviewSummary" component={ReviewSummary} />
                <Stack.Screen name="EnterYourPIN" component={EnterYourPIN} />
                <Stack.Screen name="TopDoctors" component={TopDoctors} />
                <Stack.Screen name="Categories" component={Categories} />
                <Stack.Screen name="Favourite" component={Favourite} />
                <Stack.Screen name="DoctorReviews" component={DoctorReviews} />
                <Stack.Screen
                    name="BookAppointment"
                    component={BookAppointment}
                />
                <Stack.Screen name="SelectPackage" component={SelectPackage} />
                <Stack.Screen
                    name="PatientDetails"
                    component={PatientDetails}
                />
                <Stack.Screen
                    name="CancelAppointment"
                    component={CancelAppointment}
                />
                <Stack.Screen
                    name="CancelAppointmentPaymentMethods"
                    component={CancelAppointmentPaymentMethods}
                />
                <Stack.Screen
                    name="RescheduleAppointment"
                    component={RescheduleAppointment}
                />
                <Stack.Screen
                    name="SelectRescheduleAppointmentDate"
                    component={SelectRescheduleAppointmentDate}
                />
                <Stack.Screen
                    name="MyAppointmentMessaging"
                    component={MyAppointmentMessaging}
                />
                <Stack.Screen
                    name="MyAppointmentVoiceCall"
                    component={MyAppointmentVoiceCall}
                />
                <Stack.Screen
                    name="MyAppointmentVideoCall"
                    component={MyAppointmentVideoCall}
                />
                <Stack.Screen name="VideoCall" component={VideoCall} />
                <Stack.Screen name="VoiceCall" component={VoiceCall} />
                <Stack.Screen name="SessionEnded" component={SessionEnded} />
                <Stack.Screen name="LeaveReview" component={LeaveReview} />
                <Stack.Screen
                    name="ArticlesDetails"
                    component={ArticlesDetails}
                />
                <Stack.Screen
                    name="ArticlesSeeAll"
                    component={ArticlesSeeAll}
                />
                <Stack.Screen
                    name="TrendingArticles"
                    component={TrendingArticles}
                />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default AppNavigation
