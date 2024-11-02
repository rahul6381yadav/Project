import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
function ProfileEditScreen({route }) {
    const { email } = route.params;
    const [profile, setProfile] = useState({
        fullName: '',
        college: '',
        branch: '',
        graduationYear: '',
        courseDuration: 4,
        program: 'BTech',
        city: '',
        achievements: '',
        currentWork: '',
        educationDetails: '',
        profilePic: '', // Add profilePic field for storing image URI
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigation = useNavigation();


    const colleges = ["IIT Delhi", "IIT Bombay", "IIT Madras", "IIT Kharagpur", "IIIT Hyderabad", "IIIT Bangalore"];
    const programs = ['BTech', 'MTech', 'PhD'];
    const durations = [4, 5];

    // Fetch profile data when the component mounts
    useEffect(() => {
        fetch(`http://10.0.2.2:5000/api/profile/${email}`)
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setProfile({
                        fullName: data.user.fullName ?? '',
                        college: data.user.college ?? '',
                        branch: data.user.branch ?? '',
                        graduationYear: data.user.graduationYear ?? '',
                        courseDuration: data.user.courseDuration ?? 4,
                        program: data.user.program ?? 'BTech',
                        city: data.user.city ?? '',
                        achievements: data.user.achievements ?? '',
                        currentWork: data.user.currentWork ?? '',
                        educationDetails: data.user.educationDetails ?? '',
                        profilePic: data.user.profilePic ?? '', // Set profilePic from fetched data
                    });
                    setError(null); // Clear any existing error
                } else {
                    setError("User not found. Please check the email or try again.");
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching profile data:', err);
                setError('Failed to fetch profile data. Please try again later.');
                setLoading(false);
            });
    }, []);

    const handleSave = () => {
        setLoading(true);
        fetch(`http://10.0.2.2:5000/api/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, ...profile }),
        })
            .then(res => res.json())
            .then(data => {
                setLoading(false);
                if (data.message === 'Profile updated successfully') {
                    Alert.alert('Success', 'Profile updated successfully');
                    navigation.goBack();
                } else {
                    Alert.alert('Error', data.message);
                }
            })
            .catch(err => {
                console.error('Error updating profile:', err);
                Alert.alert('Error', 'Failed to update profile');
                setLoading(false);
            });
    };

    const selectImage = () => {
        launchImageLibrary({}, response => {
            if (response.assets && response.assets.length > 0) {
                const selectedImage = response.assets[0].uri;
                setProfile({ ...profile, profilePic: selectedImage });
            }
        });
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <Button title="Go Back" onPress={() => navigation.goBack()} color="#007AFF" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Profile Picture Section */}
            <Text style={styles.label}>Profile Picture</Text>
            <View style={styles.profilePicContainer}>
                {profile.profilePic ? (
                    <Image source={{ uri: profile.profilePic }} style={styles.profilePic} />
                ) : (
                    <Text>No Image Selected</Text>
                )}
                <Button title="Change Profile Picture" onPress={selectImage} color="#007AFF" />
            </View>

            {/* Full Name Field */}
            <Text style={styles.label}>Full Name</Text>
            <TextInput
                style={styles.input}
                value={profile.fullName}
                onChangeText={(text) => setProfile({ ...profile, fullName: text })}
                placeholder="Enter your full name"
            />

            {/* College Picker */}
            <Text style={styles.label}>College</Text>
            <Picker
                selectedValue={profile.college}
                onValueChange={(itemValue) => setProfile({ ...profile, college: itemValue })}
                style={styles.picker}
            >
                {colleges.map((college) => (
                    <Picker.Item key={college} label={college} value={college} />
                ))}
            </Picker>

            {/* Branch Field */}
            <Text style={styles.label}>Branch</Text>
            <TextInput
                style={styles.input}
                value={profile.branch}
                onChangeText={(text) => setProfile({ ...profile, branch: text })}
                placeholder="Enter your branch"
            />

            {/* Graduation Year Field */}
            <Text style={styles.label}>Graduation Year</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={profile.graduationYear.toString()}
                onChangeText={(text) => setProfile({ ...profile, graduationYear: parseInt(text) })}
                placeholder="Enter graduation year"
            />

            {/* Course Duration Picker */}
            <Text style={styles.label}>Course Duration</Text>
            <Picker
                selectedValue={profile.courseDuration}
                onValueChange={(itemValue) => setProfile({ ...profile, courseDuration: itemValue })}
                style={styles.picker}
            >
                {durations.map((year) => (
                    <Picker.Item key={year} label={`${year} years`} value={year} />
                ))}
            </Picker>

            {/* Program Picker */}
            <Text style={styles.label}>Program</Text>
            <Picker
                selectedValue={profile.program}
                onValueChange={(itemValue) => setProfile({ ...profile, program: itemValue })}
                style={styles.picker}
            >
                {programs.map((prog) => (
                    <Picker.Item key={prog} label={prog} value={prog} />
                ))}
            </Picker>

            {/* City Field */}
            <Text style={styles.label}>City</Text>
            <TextInput
                style={styles.input}
                value={profile.city}
                onChangeText={(text) => setProfile({ ...profile, city: text })}
                placeholder="Enter your city"
            />

            {/* Achievements Field */}
            <Text style={styles.label}>Achievements</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                value={profile.achievements}
                onChangeText={(text) => setProfile({ ...profile, achievements: text })}
                placeholder="List your achievements"
            />

            {/* Current Work Field */}
            <Text style={styles.label}>Current Work</Text>
            <TextInput
                style={styles.input}
                value={profile.currentWork}
                onChangeText={(text) => setProfile({ ...profile, currentWork: text })}
                placeholder="Current job or project"
            />

            {/* Education Details Field */}
            <Text style={styles.label}>Education Details</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                value={profile.educationDetails}
                onChangeText={(text) => setProfile({ ...profile, educationDetails: text })}
                placeholder="Add education details"
            />

            {/* Save Button */}
            <Button title="Save Profile" onPress={handleSave} color="#007AFF" />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    label: { fontWeight: 'bold', marginTop: 10 },
    input: { borderBottomWidth: 1, borderColor: '#ccc', marginBottom: 10, padding: 8 },
    profilePicContainer: { alignItems: 'center', marginBottom: 20 },
    profilePic: { width: 120, height: 120, borderRadius: 60, marginBottom: 10 },
    picker: { marginVertical: 10 },
    textArea: { height: 80, textAlignVertical: 'top' },
    loader: { flex: 1, justifyContent: 'center' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: 'red', marginBottom: 10 },
});

export default ProfileEditScreen;
