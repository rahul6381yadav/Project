import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [userEmail, setUserEmail] = useState(null); // State for user email

    // Load login state and user email from AsyncStorage
    useEffect(() => {
        const loadLoginState = async () => {
            try {
                const storedLoginState = await AsyncStorage.getItem('isLoggedIn');
                const storedEmail = await AsyncStorage.getItem('userEmail'); // Load user email

                if (storedLoginState !== null) {
                    setIsLoggedIn(JSON.parse(storedLoginState));
                } else {
                    setIsLoggedIn(false); // Default to logged out if no state is saved
                }

                if (storedEmail !== null) {
                    setUserEmail(storedEmail); // Set user email if it exists
                }
            } catch (error) {
                console.error('Failed to load login state', error);
            }
        };

        loadLoginState();
    }, []);

    const login = async (email) => {
        try {
            await AsyncStorage.setItem('isLoggedIn', JSON.stringify(true));

            if (email) { // Ensure email is defined
                await AsyncStorage.setItem('userEmail', email); // Save user email on login
                setUserEmail(email);
            } else {
                console.error('Email is required for login');
            }

            setIsLoggedIn(true);
        } catch (error) {
            console.error('Failed to save login state', error);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('isLoggedIn');
            await AsyncStorage.removeItem('userEmail'); // Remove user email on logout
            setIsLoggedIn(false);
            setUserEmail(null); // Clear user email state
        } catch (error) {
            console.error('Failed to remove login state', error);
        }
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, userEmail, login, logout }}>
            {isLoggedIn !== null && children} {/* Only render children after loading state */}
        </AuthContext.Provider>
    );
};

// Hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);
