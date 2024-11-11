import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator,Button } from 'react-native';
import { useNavigation,useIsFocused } from '@react-navigation/native';
const path = require('path');

function ProfileScreen({ route }) {
    const { email } = route.params;
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const isFocused = useIsFocused(); // Track if the screen is focused

    useEffect(() => {
        // Fetch user profile data
        const fetchProfile = () => {
            setLoading(true);
            fetch(`http://10.0.2.2:5000/api/profile/${email}`)
                .then(res => res.json())
                .then(data => {
                    setProfile(data.user);
                    setLoading(false);
                })
                .catch(err => {
                    console.log(err);
                    setLoading(false);
                });
        };

        if (isFocused) {
            fetchProfile(); // Refetch profile when screen is focused
        }
    }, [isFocused]);

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
    }

    if (!profile) {
        return <Text style={styles.errorText}>Profile data not found.</Text>;
    }
  

    function convertToPath(inputString) {
        if (typeof inputString !== 'string') {
            return null;
        }
        // Normalize path and replace backslashes with forward slashes
        const normalizedPath = inputString.replace(/\\/g, '/');

        // Find the portion after "uploads/"
        const match = normalizedPath.match(/uploads\/.*/);

        // If the match exists, prepend the base URL with 'my-backend/'
        return match ? `http://10.0.2.2:8081/my-backend/${match[0]}` : null;
    }


    const pathFormat = profile.profilePic ? convertToPath(profile.profilePic) : null;
    // console.log(pathFormat)


    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.profilePicContainer}>
                <Image
                    source={
                        pathFormat
                            ? {uri:pathFormat}
                            : require('../fake.png') // Adjust the path if the folder structure is different
                    }
                    // source={'../fake.png'}
                    style={styles.profilePic}
                    // onError={() => setImageError(true)} // Optional: handle image loading errors
                />
                {/* {imageError && (
                    <Text style={styles.errorText}>Failed to load image.</Text>
                    )} */}
                
            </View>
                <Button
                        title="Edit Profile"
                        onPress={() => navigation.navigate('ProfileEdit', { email })}
                        color="#007AFF"
                />
            <Text style={styles.heading}>Profile Details</Text>

            <View style={styles.profileField}>
                <Text style={styles.label}>Full Name:</Text>
                <Text style={styles.value}>{profile.fullName || "Not available"}</Text>
            </View>

            <View style={styles.profileField}>
                <Text style={styles.label}>College:</Text>
                <Text style={styles.value}>{profile.college || "Not available"}</Text>
            </View>

            <View style={styles.profileField}>
                <Text style={styles.label}>Branch:</Text>
                <Text style={styles.value}>{profile.branch || "Not available"}</Text>
            </View>

            <View style={styles.profileField}>
                <Text style={styles.label}>Graduation Year:</Text>
                <Text style={styles.value}>{profile.graduationYear || "Not available"}</Text>
            </View>

            <View style={styles.profileField}>
                <Text style={styles.label}>Program:</Text>
                <Text style={styles.value}>{profile.program || "Not available"}</Text>
            </View>

            <View style={styles.profileField}>
                <Text style={styles.label}>Course Duration:</Text>
                <Text style={styles.value}>{profile.courseDuration || "Not available"}</Text>
            </View>

            <View style={styles.profileField}>
                <Text style={styles.label}>City:</Text>
                <Text style={styles.value}>{profile.city || "Not available"}</Text>
            </View>

            <View style={styles.profileField}>
                <Text style={styles.label}>Achievements:</Text>
                <Text style={styles.value}>{profile.achievements || "Not available"}</Text>
            </View>

            <View style={styles.profileField}>
                <Text style={styles.label}>Current Work:</Text>
                <Text style={styles.value}>{profile.currentWork || "Not available"}</Text>
            </View>

            <View style={styles.profileField}>
                <Text style={styles.label}>Education Details:</Text>
                <Text style={styles.value}>{profile.educationDetails || "Not available"}</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
    profilePicContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    profilePic: {
        width: 120,
        height: 120,
        borderRadius: 60, // Circular image
        borderWidth: 2,
        borderColor: '#007AFF',
    },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    profileField: {
        width: '100%',
        flexDirection: 'row',
        marginVertical: 5,
    },
    label: {
        fontWeight: 'bold',
        width: 150,
    },
    value: {
        flex: 1,
        color: '#333',
    },
});

export default ProfileScreen;
