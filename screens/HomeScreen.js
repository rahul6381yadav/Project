import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../AuthContext';

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

    const sendFriendRequest = async (friendEmail) => {
        try {
            // Use the friend's email directly in the request
            const response = await fetch(`http://10.0.2.2:5000/api/request/${friendEmail}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fromId: userEmail }), // Ensure userEmail is the sender's ID
            });
            console.log(JSON.stringify({ fromId: userEmail }));
            if (response.ok) {
                Alert.alert('Request Sent', `Message request sent to ${friendEmail}`);
            } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.message || 'Failed to send request.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Network error. Please try again.');
        }
    };


    const handleAddFriend = (friendEmail) => {
        sendFriendRequest(friendEmail); // Pass the userId of the friend instead of email
    };


    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loaderText}>Loading users...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Welcome to the Home Screen</Text>
                <Button title="Logout" onPress={logout} color="#FF3D00" />
            </View>
            <FlatList
                data={users}
                keyExtractor={(item) => item.email}
                renderItem={({ item }) => (
                    <View style={styles.userContainer}>
                        <Text style={styles.userName}>{item.email || "Unknown User"}</Text>
                        <Button
                            title="Message Request"
                            onPress={() => handleAddFriend(item.email)}
                            color="#007AFF"
                        />
                    </View>
                )}
                contentContainerStyle={styles.userList}
                showsVerticalScrollIndicator={false}
            />
        </View>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#DDDDDD',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        marginVertical: 5,
    },
    userName: {
        fontSize: 18,
        color: '#555',
    },
    userList: {
        paddingBottom: 20,
    },
});

export default HomeScreen;
