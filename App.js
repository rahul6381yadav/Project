import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import DetailsScreen from './screens/DetailsScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import { AuthProvider, useAuth } from './AuthContext';
import ProfileEditScreen from './screens/ProfileEditScreen';

const Stack = createStackNavigator();

function AuthStack() {
    return (
        <Stack.Navigator initialRouteName="Register">
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}

function AppStack() {
    return (
        <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="ProfileEditScreen" component={ProfileEditScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Details" component={DetailsScreen} />
        </Stack.Navigator>
    );
}

function RootNavigator() {
    const { isLoggedIn } = useAuth();

    return (
        isLoggedIn ? <AppStack /> : <AuthStack />
    );
}

export default function App() {
    return (
        <AuthProvider>
            <NavigationContainer>
                <RootNavigator />
            </NavigationContainer>
        </AuthProvider>
    );
}


