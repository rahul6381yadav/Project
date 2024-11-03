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
            console.log("Response Status:", response.status);
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
            {/* Logo */}
            <Image
                source={require('../Alumni-connect.jpg')}
                style={styles.logo}
            />

            <Text style={styles.title}>Register</Text>

            {/* Input Fields */}
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
            />
            <TextInput
                placeholder="Mobile Number"
                value={mobile}
                onChangeText={setMobile}
                style={styles.input}
            />
            <TextInput
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.input}
            />

            {/* Profile Picture */}
            <TouchableOpacity onPress={handlePickImage} style={styles.profilePicContainer}>
                {profilePic ? (
                    <Image source={profilePic} style={styles.profilePic} />
                ) : (
                    <Text style={styles.selectPhotoText}>Select Profile Picture</Text>
                )}
            </TouchableOpacity>

            {/* Buttons */}
            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Already have an account? Login</Text>
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
    profilePicContainer: {
        marginTop: 15,
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profilePic: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    selectPhotoText: {
        color: '#007AFF',
        fontSize: 16,
    },
    registerButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        paddingHorizontal: 80,
        borderRadius: 10,
        marginVertical: 10,
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loginLink: {
        color: '#007AFF',
        marginTop: 20,
        fontSize: 16,
    },
});

export default RegisterScreen;
