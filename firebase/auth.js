import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithCredential,
    FacebookAuthProvider,
    OAuthProvider,
} from 'firebase/auth'
import { auth } from './config'

// Debug Firebase Auth
console.log('Firebase Auth in firebase/auth.js:', !!auth);

// Register with email and password
export const registerWithEmailAndPassword = async (email, password) => {
    try {
        console.log('Registering with email:', email);
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        )
        console.log('Registration successful:', userCredential.user.uid);
        return { user: userCredential.user, error: null }
    } catch (error) {
        console.error('Registration failed:', error.code, error.message);
        return { user: null, error: error.message }
    }
}

// Login with email and password
export const loginWithEmailAndPassword = async (email, password) => {
    try {
        console.log('Logging in with email:', email);
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        )
        console.log('Login successful:', userCredential.user.uid);
        return { user: userCredential.user, error: null }
    } catch (error) {
        console.error('Login failed:', error.code, error.message);
        return { user: null, error: error.message }
    }
}

// Send password reset email
export const sendPasswordReset = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email)
        return { success: true, error: null }
    } catch (error) {
        return { success: false, error: error.message }
    }
}

// Update user profile
export const updateUserProfile = async (displayName, photoURL = null) => {
    try {
        await updateProfile(auth.currentUser, {
            displayName: displayName,
            photoURL: photoURL,
        })
        return { success: true, error: null }
    } catch (error) {
        return { success: false, error: error.message }
    }
}

// Logout
export const logout = async () => {
    try {
        await signOut(auth)
        return { success: true, error: null }
    } catch (error) {
        return { success: false, error: error.message }
    }
}

// Google sign in
export const googleSignIn = async (idToken) => {
    try {
        const credential = GoogleAuthProvider.credential(idToken)
        const userCredential = await signInWithCredential(auth, credential)
        return { user: userCredential.user, error: null }
    } catch (error) {
        return { user: null, error: error.message }
    }
}

// Facebook sign in
export const facebookSignIn = async (accessToken) => {
    try {
        const credential = FacebookAuthProvider.credential(accessToken)
        const userCredential = await signInWithCredential(auth, credential)
        return { user: userCredential.user, error: null }
    } catch (error) {
        return { user: null, error: error.message }
    }
}

// Apple sign in
export const appleSignIn = async (idToken, nonce) => {
    try {
        const provider = new OAuthProvider('apple.com')
        const credential = provider.credential({
            idToken,
            rawNonce: nonce,
        })
        const userCredential = await signInWithCredential(auth, credential)
        return { user: userCredential.user, error: null }
    } catch (error) {
        return { user: null, error: error.message }
    }
}

// Get current user
export const getCurrentUser = () => {
    return auth.currentUser
}
