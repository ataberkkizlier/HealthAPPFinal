import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import {
  AddNewAddress, AddNewCard, Address, ArticlesDetails, ArticlesSeeAll, BookAppointment,
  CancelAppointment, CancelAppointmentPaymentMethods, Categories, ChangeEmail, ChangePIN,
  ChangePassword, Chat, CreateNewPIN, CreateNewPassword, CustomerService, DoctorDetails,
  DoctorReviews, EReceipt, EditProfile, EnterYourPIN, Favourite, FillYourProfile,
  Fingerprint, ForgotPasswordEmail, ForgotPasswordMethods, ForgotPasswordPhoneNumber,
  HelpCenter, InviteFriends, LeaveReview, Login, Messaging, MyAppointmentMessaging,
  MyAppointmentVideoCall, MyAppointmentVoiceCall, MyBookmarkedArticles, Notifications,
  OTPVerification, Onboarding1, Onboarding2, Onboarding3, Onboarding4, PatientDetails,
  PaymentMethods, RescheduleAppointment, ReviewSummary, Search, SelectPackage,
  SelectRescheduleAppointmentDate, SessionEnded, SettingsLanguage, SettingsNotifications,
  SettingsPayment, SettingsPrivacyPolicy, SettingsSecurity, Signup, TopDoctors,
  TrendingArticles, VideoCall, VideoCallHistoryDetails, VideoCallHistoryDetailsPlayRecordings,
  VoiceCall, VoiceCallHistoryDetails, VoiceCallHistoryDetailsPlayRecordings, Welcome
} from '../screens';

import BottomTabNavigation from './BottomTabNavigation';

// ✅ Import All Category Screens
import Workout from '../screens/Workout';
import Nutrition from '../screens/Nutrition';
import WaterIntake from '../screens/WaterIntake';
import MentalHealth from '../screens/MentalHealth';
import Sleep from '../screens/Sleep';
import Steps from '../screens/Steps';
import BloodPressure from '../screens/BloodPressure';
import Others from '../screens/Others';

const Stack = createNativeStackNavigator();

const AppNavigation = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkIfFirstLaunch = async () => {
      try {
        const value = await AsyncStorage.getItem('alreadyLaunched');
        if (value === null) {
          await AsyncStorage.setItem('alreadyLaunched', 'true');
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
      } catch (error) {
        setIsFirstLaunch(false);
      }
      setIsLoading(false); // Set loading state to false once the check is complete
    };

    checkIfFirstLaunch();
  }, []);

  if (isLoading) {
    return null; // Render a loader or any other loading state component
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={isFirstLaunch ? 'Onboarding1' : 'Onboarding1'}
      >
        {/* ✅ Add Missing Category Screens */}
        <Stack.Screen name="CategoryWorkout" component={Workout} />
        <Stack.Screen name="CategoryNutrition" component={Nutrition} />
        <Stack.Screen name="CategoryWaterIntake" component={WaterIntake} />
        <Stack.Screen name="CategoryMentalHealth" component={MentalHealth} />
        <Stack.Screen name="CategorySleep" component={Sleep} />
        <Stack.Screen name="CategorySteps" component={Steps} />
        <Stack.Screen name="CategoryBloodPressure" component={BloodPressure} />
        <Stack.Screen name="CategoryOthers" component={Others} />

        {/* ✅ Keep Existing Screens */}
        <Stack.Screen name="Onboarding1" component={Onboarding1} />
        <Stack.Screen name="Onboarding2" component={Onboarding2} />
        <Stack.Screen name="Onboarding3" component={Onboarding3} />
        <Stack.Screen name="Onboarding4" component={Onboarding4} />
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="ForgotPasswordMethods" component={ForgotPasswordMethods} />
        <Stack.Screen name="ForgotPasswordEmail" component={ForgotPasswordEmail} />
        <Stack.Screen name="ForgotPasswordPhoneNumber" component={ForgotPasswordPhoneNumber} />
        <Stack.Screen name="OTPVerification" component={OTPVerification} />
        <Stack.Screen name="CreateNewPassword" component={CreateNewPassword} />
        <Stack.Screen name="FillYourProfile" component={FillYourProfile} />
        <Stack.Screen name="CreateNewPIN" component={CreateNewPIN} />
        <Stack.Screen name="Fingerprint" component={Fingerprint} />
        <Stack.Screen name="Main" component={BottomTabNavigation} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="SettingsNotifications" component={SettingsNotifications} />
        <Stack.Screen name="SettingsPayment" component={SettingsPayment} />
        <Stack.Screen name="AddNewCard" component={AddNewCard} />
        <Stack.Screen name="SettingsSecurity" component={SettingsSecurity} />
        <Stack.Screen name="ChangePIN" component={ChangePIN} />
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
        <Stack.Screen name="ChangeEmail" component={ChangeEmail} />
        <Stack.Screen name="SettingsLanguage" component={SettingsLanguage} />
        <Stack.Screen name="SettingsPrivacyPolicy" component={SettingsPrivacyPolicy} />
        <Stack.Screen name="InviteFriends" component={InviteFriends} />
        <Stack.Screen name="HelpCenter" component={HelpCenter} />
        <Stack.Screen name="CustomerService" component={CustomerService} />
        <Stack.Screen name="EReceipt" component={EReceipt} />
        <Stack.Screen name="Chat" component={Chat} />
        <Stack.Screen name="Notifications" component={Notifications} />
        <Stack.Screen name="Search" component={Search} />
        <Stack.Screen name="PaymentMethods" component={PaymentMethods} />
        <Stack.Screen name="ReviewSummary" component={ReviewSummary} />
        <Stack.Screen name="EnterYourPIN" component={EnterYourPIN} />
        <Stack.Screen name="TopDoctors" component={TopDoctors} />
        <Stack.Screen name="Categories" component={Categories} />
        <Stack.Screen name="Favourite" component={Favourite} />
        <Stack.Screen name="DoctorDetails" component={DoctorDetails} />
        <Stack.Screen name="DoctorReviews" component={DoctorReviews} />
        <Stack.Screen name="BookAppointment" component={BookAppointment} />
        <Stack.Screen name="SelectPackage" component={SelectPackage} />
        <Stack.Screen name="PatientDetails" component={PatientDetails} />
        <Stack.Screen name="CancelAppointment" component={CancelAppointment} />
        <Stack.Screen name="CancelAppointmentPaymentMethods" component={CancelAppointmentPaymentMethods} />
        <Stack.Screen name="RescheduleAppointment" component={RescheduleAppointment} />
        <Stack.Screen name="SelectRescheduleAppointmentDate" component={SelectRescheduleAppointmentDate} />
        <Stack.Screen name="MyAppointmentMessaging" component={MyAppointmentMessaging} />
        <Stack.Screen name="MyAppointmentVoiceCall" component={MyAppointmentVoiceCall} />
        <Stack.Screen name="MyAppointmentVideoCall" component={MyAppointmentVideoCall} />
        <Stack.Screen name="VideoCall" component={VideoCall} />
        <Stack.Screen name="VoiceCall" component={VoiceCall} />
        <Stack.Screen name="SessionEnded" component={SessionEnded} />
        <Stack.Screen name="LeaveReview" component={LeaveReview} />
        <Stack.Screen name="ArticlesDetails" component={ArticlesDetails} />
        <Stack.Screen name="ArticlesSeeAll" component={ArticlesSeeAll} />
        <Stack.Screen name="TrendingArticles" component={TrendingArticles} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;
