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
import { loginWithEmailAndPassword } from '../firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'

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

const Login = ({ navigation }) => {
    const [formState, dispatchFormState] = useReducer(reducer, initialState)
    const [error, setError] = useState(null)
    const [isChecked, setChecked] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
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
            Alert.alert('Login Error', error)
            setError(null)
        }
    }, [error])

    // Check if "remember me" is enabled on app load
    useEffect(() => {
        const loadSavedCredentials = async () => {
            try {
                const savedEmail = await AsyncStorage.getItem('savedEmail')
                const savedPassword =
                    await AsyncStorage.getItem('savedPassword')

                if (savedEmail && savedPassword) {
                    inputChangedHandler('email', savedEmail)
                    inputChangedHandler('password', savedPassword)
                    setChecked(true)

                    // Update formState manually since inputChangedHandler is async
                    dispatchFormState({
                        inputId: 'email',
                        validationResult: validateInput('email', savedEmail),
                        inputValue: savedEmail,
                    })
                    dispatchFormState({
                        inputId: 'password',
                        validationResult: validateInput(
                            'password',
                            savedPassword
                        ),
                        inputValue: savedPassword,
                    })
                }
            } catch (error) {
                console.error('Error loading saved credentials:', error)
            }
        }

        loadSavedCredentials()
    }, [])

    const loginHandler = async () => {
        if (!formState.formIsValid) {
            Alert.alert('Invalid Input', 'Please check the errors in the form.')
            return
        }

        setIsLoading(true)
        try {
            const email = formState.inputValues.email
            const password = formState.inputValues.password

            // Save credentials if "remember me" is checked
            if (isChecked) {
                await AsyncStorage.setItem('savedEmail', email)
                await AsyncStorage.setItem('savedPassword', password)
            } else {
                // Remove saved credentials if not checked
                await AsyncStorage.removeItem('savedEmail')
                await AsyncStorage.removeItem('savedPassword')
            }

            const { user, error: loginError } = await loginWithEmailAndPassword(
                email,
                password
            )

            if (loginError) {
                setError(loginError)
                setIsLoading(false)
                return
            }

            // Login successful
            console.log('Login successful:', user.uid)
            setIsLoading(false)
            navigation.navigate('Main')
        } catch (err) {
            setError(err.message || 'An error occurred during login.')
            setIsLoading(false)
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

    return (
        <SafeAreaView
            style={[
                styles.area,
                {
                    backgroundColor: colors.background,
                },
            ]}
        >
            <View
                style={[
                    styles.container,
                    {
                        backgroundColor: colors.background,
                    },
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
                        Login to Your Account
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
                                    Remember me
                                </Text>
                            </View>
                        </View>
                    </View>
                    <Button
                        title={isLoading ? 'Logging in...' : 'Login'}
                        filled
                        onPress={loginHandler}
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
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate('ForgotPasswordMethods')
                        }
                    >
                        <Text style={styles.forgotPasswordBtnText}>
                            Forgot the password?
                        </Text>
                    </TouchableOpacity>
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
                        Don't have an account ?
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Signup')}
                    >
                        <Text style={styles.bottomRight}>{'  '}Sign Up</Text>
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
    forgotPasswordBtnText: {
        fontSize: 16,
        fontFamily: 'semiBold',
        color: COLORS.primary,
        textAlign: 'center',
        marginTop: 12,
    },
})

export default Login
