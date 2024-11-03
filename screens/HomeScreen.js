import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, ActivityIndicator, Alert, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../AuthContext';
import DocumentPicker from 'react-native-document-picker';
function HomeScreen({ navigation }) {
    const { logout, userEmail } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`http://10.0.2.2:5000/api/users/${userEmail}`);
                const data = await response.json();
                setUsers(data.users);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [userEmail]);

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loaderText}>Loading users...</Text>
            </View>
        );
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
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Welcome to the Home Screen</Text>
                <Button title="Logout" onPress={logout} color="#FF3D00" />
            </View>

            {/* Section Buttons */}
            <View style={styles.sectionsContainer}>
                <TouchableOpacity style={styles.sectionButton} onPress={() => navigation.navigate('AddNews')}>
                    <Text style={styles.sectionText}>News and Updates</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sectionButton} onPress={() => navigation.navigate('JobPortal')}>
                    <Text style={styles.sectionText}>Job Portal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sectionButton} onPress={() => navigation.navigate('AlumniCard', { email: userEmail })}>
                    <Text style={styles.sectionText}>Nearby Alumni</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sectionButton} onPress={() => navigation.navigate('PostDiscussion')}>
                    <Text style={styles.sectionText}>Post Discussion</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sectionButton} onPress={() => navigation.navigate('AlumniCard')}>
                    <Text style={styles.sectionText}>Alumni Card</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sectionButton} onPress={() => navigation.navigate('JoinGroup')}>
                    <Text style={styles.sectionText}>Join a Group</Text>
                </TouchableOpacity>
            </View>

            {/* List of Alumni */}
            <FlatList
                data={users}
                keyExtractor={(item) => item.email}
                renderItem={({ item }) => (
                    <View style={styles.userContainer}>
                        <Image
                            source={{ uri: item.profilePic ? convertToPath(item.profilePic) :'https://example.com/default-avatar.png' }}
                            style={styles.profileImage}
                        />
                        <Text style={styles.userName}>{item.fullName || "Unknown User"}</Text>
                        <Button
                            title="Message Request"
                            onPress={() => sendFriendRequest(item.email)}
                            color="#007AFF"
                        />
                    </View>
                )}
                contentContainerStyle={styles.userList}
                showsVerticalScrollIndicator={false}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F7F9FC',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#DDDDDD',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    sectionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    sectionButton: {
        width: '48%',
        backgroundColor: '#E0F7FA',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
    },
    sectionText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: 'bold',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#DDDDDD',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        marginVertical: 5,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
        backgroundColor: '#EFEFEF',
    },
    userName: {
        flex: 1,
        fontSize: 18,
        color: '#555',
    },
    userList: {
        paddingBottom: 20,
    },
});

export default HomeScreen;
