import React, { useState } from 'react';
import { Button, View, Text, TextInput, Alert, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../AuthContext'; // Import useAuth from AuthContext

function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth(); // Destructure login function from AuthContext

    const handleLogin = async () => {
        try {
            const response = await fetch('http://10.0.2.2:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                Alert.alert('Success', data.message);
                login(email); // Set user as logged in
                navigation.navigate('Home'); // Navigate to Home screen
            } else {
                let errorMessage = 'Login Failed';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message;
                } catch (err) {
                    console.error('Error parsing error response:', err);
                }
                Alert.alert('Login Failed', errorMessage);
            }
        } catch (error) {
            console.error('Login Error:', error);
            Alert.alert('Login Failed', 'An error occurred. Please try again later.');
        }
    };

    return (
        <View style={styles.container}>
            <Image source={require('../Alumni-connect.jpg')} style={styles.logo} /> {/* Update with your logo path */}
            <Text style={styles.title}>Login</Text>
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.input}
            />
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Don't have an account? Register</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#F5F7FA',
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    input: {
        height: 50,
        width: '100%',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginVertical: 10,
        backgroundColor: '#FFFFFF',
    },
    loginButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        paddingHorizontal: 80,
        borderRadius: 10,
        marginVertical: 10,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    registerLink: {
        color: '#007AFF',
        marginTop: 20,
        fontSize: 16,
    },
});

export default LoginScreen;
