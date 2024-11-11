import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, ActivityIndicator, Alert, Image, TouchableOpacity } from 'react-native';
import { useAuth } from '../AuthContext';
import axios from 'axios';

function HomeScreen({ navigation }) {
    const { logout, userEmail } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [friends, setFriends] = useState({ accepted: [], pending: [] });

    const fetchFriends = () => {
        setLoading(true);
        axios.get(`http://10.0.2.2:5000/api/friends/status/${userEmail}`)
            .then(response => {
                const { accepted = [], pending = [] } = response.data;
                setFriends({ accepted, pending });
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching friends:", error);
                setLoading(false);
            });
    };

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
        fetchFriends();
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
        const normalizedPath = inputString.replace(/\\/g, '/');
        const match = normalizedPath.match(/uploads\/.*/);
        return match ? `http://10.0.2.2:8081/my-backend/${match[0]}` : null;
    }

    const sendFriendRequest = async (email) => {
        try {
            const response = await fetch('http://10.0.2.2:5000/api/friend-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sender: userEmail, receiver: email }),
            });

            if (response.ok) {
                Alert.alert('Friend Request Sent', `Friend request sent to ${email}.`);
            } else {
                Alert.alert('Error', 'Failed to send friend request.');
            }
        } catch (error) {
            console.error('Error sending friend request:', error);
        }
    };

    const acceptRequest = (friendEmail) => {
        axios.post(`http://10.0.2.2:5000/api/friends/accept`, { friendEmail, userEmail })
            .then(() => {
                Alert.alert("Success", "Friend request accepted!");
                fetchFriends();
            })
            .catch(error => console.error("Error accepting friend request:", error));
    };

    const rejectRequest = (friendEmail) => {
        axios.post(`http://10.0.2.2:5000/api/friends/reject`, { friendEmail, userEmail })
            .then(() => {
                Alert.alert("Success", "Friend request rejected!");
                fetchFriends();
            })
            .catch(error => console.error("Error rejecting friend request:", error));
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View>
            <Text style={styles.headerText}>Welcome to the Home Screen</Text>
                <View style={styles.logoutButton}>
                    <Button title="Logout" onPress={logout} color="#FF3D00" />
                </View>
            </View>

            {/* Section Buttons */}
            <View style={styles.sectionsContainer}>
                <TouchableOpacity style={styles.sectionButton} onPress={() => navigation.navigate('AddNews')}>
                    <Text style={styles.sectionText}>News and Updates</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sectionButton} onPress={() => navigation.navigate('PostDiscussion')}>
                    <Text style={styles.sectionText}>Post Discussion</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sectionButton} onPress={() => navigation.navigate('AlumniCard')}>
                    <Text style={styles.sectionText}>Alumni Card</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <FlatList
            data={users}
            keyExtractor={(item) => item.email}
            ListHeaderComponent={renderHeader}
            renderItem={({ item }) => {
                const friendEmail = item.email;
                const isFriend = friends.accepted.some(friend => friend.email === friendEmail);
                const hasRequested = friends.pending.some(friend => friend.email === friendEmail);

                return (
                    <View style={styles.userContainer}>
                        <TouchableOpacity onPress={() => { navigation.navigate('ProfileDetails', { email: friendEmail }) }}>
                            <Image
                                source={{ uri: item.profilePic ? convertToPath(item.profilePic) : 'https://example.com/default-avatar.png' }}
                                style={styles.profileImage}
                            />
                            <Text style={styles.userName}>{item.fullName || "Unknown User"}</Text>
                            {isFriend ? (
                                <Text style={styles.friendText}>Already Friends</Text>
                            ) : hasRequested ? (
                                <View>
                                    <Button
                                        title="Accept Request"
                                        onPress={() => acceptRequest(friendEmail)}
                                        color="#007AFF"
                                    />
                                    <Button
                                        title="Reject Request"
                                        onPress={() => rejectRequest(friendEmail)}
                                        color="#FF3D00"
                                    />
                                </View>
                            ) : (
                                <Button
                                    title="Send Friend Request"
                                    onPress={() => sendFriendRequest(friendEmail)}
                                    color="#007AFF"
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                );
            }}
            contentContainerStyle={styles.userList}
            showsVerticalScrollIndicator={false}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F7F9FC',
    },
    header: {
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#DDDDDD',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
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
    logoutButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 80, // Smaller width for a compact button
        height: 50,
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
    friendText: {
        color: 'green',
        fontWeight: 'bold',
    },
    userList: {
        paddingBottom: 20,
    },
});

export default HomeScreen;
