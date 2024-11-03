import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [userEmail, setUserEmail] = useState(null);
    const [userRole, setUserRole] = useState(null); // Add user role state

    // Load login state, user email, and user role from AsyncStorage
    useEffect(() => {
        const loadLoginState = async () => {
            try {
                const storedLoginState = await AsyncStorage.getItem('isLoggedIn');
                const storedEmail = await AsyncStorage.getItem('userEmail');
                const storedRole = await AsyncStorage.getItem('userRole'); // Load user role

                setIsLoggedIn(storedLoginState ? JSON.parse(storedLoginState) : false);
                setUserEmail(storedEmail || null);
                setUserRole(storedRole || null); // Set user role if it exists
            } catch (error) {
                console.error('Failed to load login state', error);
            }
        };

        loadLoginState();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch('http://10.0.2.2:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (response.ok) {
                const { role } = data;
                await AsyncStorage.setItem('isLoggedIn', JSON.stringify(true));
                await AsyncStorage.setItem('userEmail', email);
                await AsyncStorage.setItem('userRole', role); // Store the role

                setIsLoggedIn(true);
                setUserEmail(email);
                setUserRole(role); // Set role in state
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error('Login error', error);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('isLoggedIn');
            await AsyncStorage.removeItem('userEmail');
            await AsyncStorage.removeItem('userRole'); // Remove user role on logout

            setIsLoggedIn(false);
            setUserEmail(null);
            setUserRole(null);
        } catch (error) {
            console.error('Failed to remove login state', error);
        }
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, userEmail, userRole, login, logout }}>
            {isLoggedIn !== null && children} {/* Only render children after loading state */}
        </AuthContext.Provider>
    );
};

// Hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);
