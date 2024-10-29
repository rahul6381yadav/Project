import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import DetailsScreen from './screens/DetailsScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import { AuthProvider, useAuth } from './AuthContext';
import ProfileEditScreen from './screens/ProfileEditScreen';
import ChatScreen from './screens/ChatScreen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
    return (
        <Stack.Navigator initialRouteName="Register">
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}

function AppStack() {
    const { userEmail } = useAuth();
    return (
        <Tab.Navigator initialRouteName="Home" screenOptions={{
            tabBarActiveTintColor: '#e91e63',
        }}
         >
            <Tab.Screen name="Home" component={HomeScreen} options={{
                tabBarLabel: 'Home',
                tabBarIcon: ({ color, size }) => (
                    <MaterialCommunityIcons name="home" color={color} size={size} />
                ),
            }} />
            <Tab.Screen name="Profile" component={ProfileScreen}
                initialParams={{ email: userEmail }}
                options={{
                tabBarLabel: 'Profile',
                tabBarIcon: ({ color, size }) => (
                    <MaterialCommunityIcons name="account" color={color} size={size} />
                ),
            }} />
            <Tab.Screen name="Chat" component={ChatScreen} />
            <Tab.Screen name="ProfileEdit" component={ProfileEditScreen}
                initialParams={{ email: userEmail }}
                options={{
                tabBarLabel: 'Updates',
                tabBarIcon: ({ color, size }) => (
                    <MaterialCommunityIcons name="bell" color={color} size={size} />
                ),
            }} />
        </Tab.Navigator>
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


