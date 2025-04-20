import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native'
import React, { useCallback, useEffect, useReducer, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS, SIZES, icons, images } from '../constants'
import Header from '../components/Header'
import { reducer } from '../utils/reducers/formReducers'
import { validateInput } from '../utils/actions/formActions'
import Input from '../components/Input'
import Checkbox from 'expo-checkbox'
import Button from '../components/Button'
import SocialButton from '../components/SocialButton'
import OrSeparator from '../components/OrSeparator'
import { useTheme } from '../theme/ThemeProvider'
import { registerWithEmailAndPassword } from '../firebase/auth'
import { auth } from '../firebase/config'
import testFirebase from '../firebase/firebaseTest'

const isTestMode = false

const initialState = {
    inputValues: {
        email: isTestMode ? 'example@gmail.com' : '',
        password: isTestMode ? '**********' : '',
    },
    inputValidities: {
        email: false,
        password: false,
    },
    formIsValid: false,
}

const Signup = ({ navigation }) => {
    const [formState, dispatchFormState] = useReducer(reducer, initialState)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [isChecked, setChecked] = useState(false)
    const { colors, dark } = useTheme()

    const inputChangedHandler = useCallback(
        (inputId, inputValue) => {
            const result = validateInput(inputId, inputValue)
            dispatchFormState({ inputId, validationResult: result, inputValue })
        },
        [dispatchFormState]
    )

    useEffect(() => {
        if (error) {
            Alert.alert('Registration Error', error)
            setError(null)
        }
    }, [error])

    const signupHandler = async () => {
        if (!formState.formIsValid) {
            Alert.alert('Invalid Input', 'Please check the errors in the form.')
            return
        }

        if (!isChecked) {
            Alert.alert(
                'Terms & Privacy',
                'Please accept our privacy policy to continue.'
            )
            return
        }

        setIsLoading(true)
        try {
            const email = formState.inputValues.email
            const password = formState.inputValues.password

            console.log('Attempting to register with email:', email);
            
            // Debug Firebase auth object
            console.log('Firebase auth available:', !!auth);
            
            const { user, error: signupError } =
                await registerWithEmailAndPassword(email, password)

            if (signupError) {
                console.error('Signup error from Firebase:', signupError);
                setError(signupError)
                setIsLoading(false)
                
                // Show more specific error to user
                Alert.alert(
                    'Registration Error',
                    `Could not register: ${signupError}`
                );
                return
            }

            // Registration successful
            console.log('Registration successful:', user.uid)
            setIsLoading(false)
            navigation.navigate('FillYourProfile', { userId: user.uid })
        } catch (err) {
            console.error('Uncaught signup error:', err);
            setError(err.message || 'An error occurred during registration.')
            setIsLoading(false)
            
            // Show detailed error
            Alert.alert(
                'Registration Error',
                `Error details: ${err.message || 'Unknown error'}`
            );
        }
    }

    // Implementing apple authentication
    const appleAuthHandler = () => {
        console.log('Apple Authentication')
        // Implement Firebase Apple Authentication
    }

    // Implementing facebook authentication
    const facebookAuthHandler = () => {
        console.log('Facebook Authentication')
        // Implement Firebase Facebook Authentication
    }

    // Implementing google authentication
    const googleAuthHandler = () => {
        console.log('Google Authentication')
        // Implement Firebase Google Authentication
    }

    // Test Firebase connection
    const testFirebaseConnection = async () => {
        try {
            console.log("Testing Firebase connection...");
            const result = await testFirebase();
            console.log("Firebase test result:", result);
            
            Alert.alert(
                result.success ? "Firebase Test Success" : "Firebase Test Failed",
                result.message
            );
        } catch (error) {
            console.error("Firebase test error:", error);
            Alert.alert(
                "Firebase Test Error",
                "Error testing Firebase: " + error.message
            );
        }
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
                <Header />
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={images.logo}
                            resizeMode="contain"
                            style={styles.logo}
                        />
                    </View>
                    <Text
                        style={[
                            styles.title,
                            {
                                color: dark ? COLORS.white : COLORS.black,
                            },
                        ]}
                    >
                        Create Your Account
                    </Text>
                    <Input
                        id="email"
                        onInputChanged={inputChangedHandler}
                        errorText={formState.inputValidities['email']}
                        placeholder="Email"
                        placeholderTextColor={
                            dark ? COLORS.grayTie : COLORS.black
                        }
                        icon={icons.email}
                        keyboardType="email-address"
                        value={formState.inputValues.email}
                    />
                    <Input
                        onInputChanged={inputChangedHandler}
                        errorText={formState.inputValidities['password']}
                        autoCapitalize="none"
                        id="password"
                        placeholder="Password"
                        placeholderTextColor={
                            dark ? COLORS.grayTie : COLORS.black
                        }
                        icon={icons.padlock}
                        secureTextEntry={true}
                        value={formState.inputValues.password}
                    />
                    <View style={styles.checkBoxContainer}>
                        <View style={{ flexDirection: 'row' }}>
                            <Checkbox
                                style={styles.checkbox}
                                value={isChecked}
                                color={
                                    isChecked
                                        ? COLORS.primary
                                        : dark
                                          ? COLORS.primary
                                          : 'gray'
                                }
                                onValueChange={setChecked}
                            />
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={[
                                        styles.privacy,
                                        {
                                            color: dark
                                                ? COLORS.white
                                                : COLORS.black,
                                        },
                                    ]}
                                >
                                    By continuing you accept our Privacy Policy
                                </Text>
                            </View>
                        </View>
                    </View>
                    <Button
                        title={isLoading ? 'Signing up...' : 'Sign Up'}
                        filled
                        onPress={signupHandler}
                        style={styles.button}
                        disabled={isLoading}
                    >
                        {isLoading && (
                            <ActivityIndicator
                                size="small"
                                color={COLORS.white}
                                style={{ marginLeft: 10 }}
                            />
                        )}
                    </Button>
                    <Button
                        title="Test Firebase Connection"
                        onPress={testFirebaseConnection}
                        style={[styles.button, { marginTop: 10, backgroundColor: '#ff9900' }]}
                    />
                    <View>
                        <OrSeparator text="or continue with" />
                        <View style={styles.socialBtnContainer}>
                            <SocialButton
                                icon={icons.appleLogo}
                                onPress={appleAuthHandler}
                                tintColor={dark ? COLORS.white : COLORS.black}
                            />
                            <SocialButton
                                icon={icons.facebook}
                                onPress={facebookAuthHandler}
                            />
                            <SocialButton
                                icon={icons.google}
                                onPress={googleAuthHandler}
                            />
                        </View>
                    </View>
                </ScrollView>
                <View style={styles.bottomContainer}>
                    <Text
                        style={[
                            styles.bottomLeft,
                            {
                                color: dark ? COLORS.white : COLORS.black,
                            },
                        ]}
                    >
                        Already have an account ?
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.bottomRight}> Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
        padding: 16,
        backgroundColor: COLORS.white,
    },
    logo: {
        width: 100,
        height: 100,
        tintColor: COLORS.primary,
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 32,
    },
    title: {
        fontSize: 28,
        fontFamily: 'bold',
        color: COLORS.black,
        textAlign: 'center',
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 26,
        fontFamily: 'semiBold',
        color: COLORS.black,
        textAlign: 'center',
        marginBottom: 22,
    },
    checkBoxContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 18,
    },
    checkbox: {
        marginRight: 8,
        height: 16,
        width: 16,
        borderRadius: 4,
        borderColor: COLORS.primary,
        borderWidth: 2,
    },
    privacy: {
        fontSize: 12,
        fontFamily: 'regular',
        color: COLORS.black,
    },
    socialTitle: {
        fontSize: 19.25,
        fontFamily: 'medium',
        color: COLORS.black,
        textAlign: 'center',
        marginVertical: 26,
    },
    socialBtnContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 18,
        position: 'absolute',
        bottom: 12,
        right: 0,
        left: 0,
    },
    bottomLeft: {
        fontSize: 14,
        fontFamily: 'regular',
        color: 'black',
    },
    bottomRight: {
        fontSize: 16,
        fontFamily: 'medium',
        color: COLORS.primary,
    },
    button: {
        marginVertical: 6,
        width: SIZES.width - 32,
        borderRadius: 30,
    },
})

export default Signup
