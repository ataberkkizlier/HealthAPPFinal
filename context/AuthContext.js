import React, { createContext, useState, useEffect, useContext } from 'react'
import { auth } from '../firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Create Authentication Context
export const AuthContext = createContext()

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Handle auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
            if (userAuth) {
                // User is signed in
                setUser(userAuth)
                try {
                    // Store user info in AsyncStorage
                    await AsyncStorage.setItem('user', JSON.stringify(userAuth))
                } catch (error) {
                    console.error('Error storing user data:', error)
                }
            } else {
                // User is signed out
                setUser(null)
                try {
                    // Remove user info from AsyncStorage
                    await AsyncStorage.removeItem('user')
                } catch (error) {
                    console.error('Error removing user data:', error)
                }
            }
            setLoading(false)
        })

        // Check if user exists in AsyncStorage on app load
        const loadStoredUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('user')
                if (storedUser) {
                    setUser(JSON.parse(storedUser))
                }
            } catch (error) {
                console.error('Error loading stored user:', error)
            }
        }

        loadStoredUser()

        // Cleanup subscription on unmount
        return () => unsubscribe()
    }, [])

    // Auth context value
    const value = {
        user,
        loading,
        isAuthenticated: !!user,
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

// Custom hook to use Auth Context
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
