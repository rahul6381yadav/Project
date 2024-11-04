import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '../AuthContext';
import QRCode from 'react-native-qrcode-svg'; // Make sure to install this package
import { useNavigation, useIsFocused } from '@react-navigation/native';

function AlumniCardScreen({ route }) {
    const { userEmail } = useAuth();
    const [profile, setProfile] = useState(null);
    const isFocused = useIsFocused();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch user profile data
        const fetchProfile = () => {
            setLoading(true);
            fetch(`http://10.0.2.2:5000/api/profile/${userEmail}`)
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
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Alumni Card</Text>
            <Image
                source={{ uri: profile.profilePic ? convertToPath(profile.profilePic) : null }} // Assuming profilePicture is the key for the image URL
                style={styles.profileImage}
            />
            <View style={styles.infoContainer}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{profile.fullName || 'Not available'}</Text>
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.label}>Batch Year:</Text>
                <Text style={styles.value}>{profile.graduationYear || 'Not available'}</Text>
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.label}>College:</Text>
                <Text style={styles.value}>{profile.college || 'Not available'}</Text>
            </View>
            <View style={styles.qrCodeContainer}>
                <QRCode
                    value={JSON.stringify(profile)} // QR code with profile details
                    size={150}
                />
            </View>
            <Text style={styles.note}>Scan this QR code to view full alumni details.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 20,
    },
    profileImage: {
        width: 100, // Adjust size as needed
        height: 100, // Adjust size as needed
        borderRadius: 50, // This makes the image circular
        marginBottom: 20,
    },
    infoContainer: {
        flexDirection: 'row',
        marginVertical: 10,
        width: '80%',
    },
    label: {
        fontWeight: 'bold',
        width: '40%',
    },
    value: {
        flex: 1,
        color: '#333',
    },
    qrCodeContainer: {
        marginVertical: 30,
        alignItems: 'center',
    },
    note: {
        fontSize: 14,
        color: '#888',
        marginTop: 10,
    },
});

export default AlumniCardScreen;