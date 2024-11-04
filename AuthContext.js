import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [userEmail, setUserEmail] = useState(null);
    // Load login state, user email, and user role from AsyncStorage
    useEffect(() => {
        const loadLoginState = async () => {
            try {
                const storedLoginState = await AsyncStorage.getItem('isLoggedIn');
                const storedEmail = await AsyncStorage.getItem('userEmail');

                setIsLoggedIn(storedLoginState ? JSON.parse(storedLoginState) : false);
                setUserEmail(storedEmail || null);// Set user role if it exists
            } catch (error) {
                console.error('Failed to load login state', error);
            }
        };

        loadLoginState();
    }, []);

    const login = async (email) => {
        try {
            if (!email) {
                console.error('Email is required for login');
                return;
            }

            await AsyncStorage.setItem('isLoggedIn', JSON.stringify(true));
            await AsyncStorage.setItem('userEmail', email);

            setIsLoggedIn(true);
            setUserEmail(email);
        } catch (error) {
            console.error('Failed to save login state', error);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('isLoggedIn');
            await AsyncStorage.removeItem('userEmail');

            setIsLoggedIn(false);
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

export const useAuth = () => useContext(AuthContext);