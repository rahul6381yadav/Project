import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../AuthContext';

function HomeScreen({ navigation }) {
    const { logout, userEmail } = useAuth(); // Get user email and logout function
    const [users, setUsers] = useState([]); // State to hold the list of users
    const [loading, setLoading] = useState(true); // Loading state

    useEffect(() => {
        // Fetch the list of users
        const fetchUsers = async () => {
            try {
                const response = await fetch(`http://10.0.2.2:5000/api/users/${userEmail}`); // Fetch users excluding the current user
                const data = await response.json();
                setUsers(data.users);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [userEmail]);

    const handleAddFriend = (friendEmail) => {
        // Logic to add a friend can be implemented here
        console.log(`Request to add friend: ${friendEmail}`);
        // You can also navigate to a friend request screen or similar
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
