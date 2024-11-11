import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';

const ProfileDetailsScreen = ({ route }) => {
    const { email } = route.params;
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    useEffect(() => {
        const fetchUserData = () => {
            setLoading(true);
            fetch(`http://10.0.2.2:5000/api/profile/${email}`)
                .then(res => res.json())
                .then(data => {
                    setUserData(data.user);
                    setLoading(false);
                })
                .catch(err => {
                    console.log(err);
                    setLoading(false);
                });
        };



        if (isFocused) {
            fetchUserData(); // Refetch profile when screen is focused
        }
    }, [isFocused]);

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
    }

    if (!userData) {
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


    const pathFormat = userData.profilePic ? convertToPath(userData.profilePic) : null;


    return (
        <ScrollView style={styles.container}>
            <Image source={{ uri: userData.profilePic ? convertToPath(userData.profilePic) : null }} style={styles.profileImage} />
            <Text style={styles.name}>{userData.fullName}</Text>
            <Text style={styles.detail}>Email: {userData.email}</Text>
            <Text style={styles.detail}>College: {userData.college || "Not available"}</Text>
            <Text style={styles.detail}>Branch: {userData.branch || "Not available"}</Text>
            <Text style={styles.detail}>Program: {userData.program || "Not available"}</Text>
            <Text style={styles.detail}>Course Duration: {userData.courseDuration || "Not available"}</Text>
            <Text style={styles.detail}>City: {userData.city || "Not available"}</Text>
            <Text style={styles.detail}>Achievements: {userData.achievement || "Not available"}</Text>
            <Text style={styles.detail}>Current Work: {userData.currentWork || "Not available"}</Text>
            <Text style={styles.detail}>Education Details: {userData.educationDetails || "Not available"}</Text>
            <Text style={styles.detail}>Graduation Year: {userData.graduationYear || "Not available"}</Text>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    profileImage: { width: 100, height: 100, borderRadius: 50, alignSelf: 'center' },
    name: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 8 },
    detail: { fontSize: 16, marginVertical: 4 },
});

export default ProfileDetailsScreen;
