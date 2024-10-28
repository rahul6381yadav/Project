import React, { useState } from 'react';
import { Button, View, Text, TextInput, Alert } from 'react-native';
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
                console.log(email)
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
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Login Screen</Text>
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={{
                    height: 40,
                    borderColor: 'gray',
                    borderWidth: 1,
                    marginBottom: 10,
                    width: '80%',
                    padding: 10,
                }}
            />
            <TextInput
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={{
                    height: 40,
                    borderColor: 'gray',
                    borderWidth: 1,
                    marginBottom: 10,
                    width: '80%',
                    padding: 10,
                }}
            />
            <Button title="Login" onPress={handleLogin} />
        </View>
    );
}

export default LoginScreen;
