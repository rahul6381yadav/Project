import React from 'react';
import { useState } from 'react';
import { Button, View, Text, TextInput, Image, TouchableOpacity } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import DeviceInfo from 'react-native-device-info';
import { NetworkInfo } from 'react-native-network-info';

function RegisterScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [profilePic, setProfilePic] = useState(null);
    
    const handlePickImage = () => {
        const options = {
            mediaType: 'photo',
            includeBase64: false,
        };
        
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
            console.log("Response Status:", response.status); // Log response status
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
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Register Screen</Text>
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={{height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, width: '80%', padding: 10 }}
            />
            <TextInput
                placeholder="Mobile Number"
                value={mobile}
                onChangeText={setMobile}
                style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, width: '80%', padding: 10 }}
            />
            <TextInput
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, width: '80%', padding: 10 }}
            />
            <TouchableOpacity onPress={handlePickImage}>
                {profilePic ? (
                    <Image source={profilePic} style={{ width: 100, height: 100 }} />
                ) : (
                    <Text>Select Profile Picture</Text>
                )}
            </TouchableOpacity>
            <Button title="Register" onPress={handleRegister} />
            <Button title="Go to Login" onPress={() => navigation.navigate('Login')} />
        </View>
    );
}

export default RegisterScreen;