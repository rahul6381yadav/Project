import React, { useState } from 'react';
import { Button, View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

function RegisterScreen({ navigation }) {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [profilePic, setProfilePic] = useState(null);

    const handlePickImage = () => {
        const options = { mediaType: 'photo', includeBase64: false };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else {
                const source = { uri: response.assets[0].uri };
                setProfilePic(source);
            }
        });
    };

    const handleRegister = async () => {
        const formData = new FormData();
        formData.append('fullName', fullName);
        formData.append('email', email);
        formData.append('mobile', mobile);
        formData.append('password', password);
        if (profilePic) {
            const uriParts = profilePic.uri.split('.');
            const fileType = uriParts[uriParts.length - 1];
            formData.append('profilePic', {
                uri: profilePic.uri,
                name: `profile.${fileType}`,
                type: `image/${fileType}`,
            });
        }

        try {
            const response = await fetch('http://10.0.2.2:5000/api/register', {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const data = await response.json();
            alert(data.message);
            if (response.ok) {
                navigation.navigate('Login');
            }
        } catch (error) {
            alert('Registration failed, please try again.');
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <Image source={require('../Alumni-connect.jpg')} style={styles.logo} /> {/* Update with your logo path */}
            <Text style={styles.title}>Register</Text>
            <TextInput
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
                style={styles.input}
            />
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                placeholder="Mobile Number"
                value={mobile}
                onChangeText={setMobile}
                style={styles.input}
                keyboardType="phone-pad"
            />
            <TextInput
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.input}
            />
            <TouchableOpacity onPress={handlePickImage} style={styles.imagePicker}>
                {profilePic ? (
                    <Image source={profilePic} style={styles.profileImage} />
                ) : (
                    <Text style={styles.imagePickerText}>Select Profile Picture</Text>
                )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginButton}>
                <Text style={styles.loginButtonText}>Go to Login</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    input: {
        height: 50,
        width: '100%',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    imagePicker: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#e0e0e0',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
    },
    imagePickerText: {
        color: '#555',
    },
    registerButton: {
        backgroundColor: '#007bff',
        borderRadius: 8,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 15,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginButton: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#007bff',
        fontSize: 16,
    },
});

export default RegisterScreen;
