import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SectionList, StyleSheet, Alert,Image } from 'react-native';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const ChatListScreen = ({ navigation }) => {
    const { userEmail } = useAuth();
    const [friends, setFriends] = useState({ accepted: [], pending: [] });
    const [profileImages, setProfileImages] = useState({});
    useEffect(() => {
        fetchFriends();
    }, [userEmail]);

    const fetchFriends = () => {
        axios.get(`http://10.0.2.2:5000/api/friends/status/${userEmail}`)
            .then(response => {
                const { accepted = [], pending = [] } = response.data;
                setFriends({ accepted, pending });

                // Fetch profile images for each friend
                accepted.concat(pending).forEach(friend => {
                    fetchImage(friend.email);
                });
            })
            .catch(error => console.error("Error fetching friends:", error));
        
    };



    const fetchImage = (email) => {
        axios.get(`http://10.0.2.2:5000/api/profile/image/${email}`)
            .then(response => {
                if (response.data.profilePic) {
                    setProfileImages(prevImages => ({
                        ...prevImages,
                        [email]: response.data.profilePic,
                    }));
                }
            })
            .catch(error => console.error(`Error fetching image for ${email}:`, error));
    };


    const openChat = (friend) => {
        navigation.navigate('Chat', { friendId: friend._id, friendEmail: friend.email,userEmail:userEmail });
    };

    const acceptRequest = (friendEmail) => {
        axios.post(`http://10.0.2.2:5000/api/friends/accept`, { friendEmail, userEmail })
            .then(() => {
                Alert.alert("Success", "Friend request accepted!");
                fetchFriends(); // Refresh the friends list
            })
            .catch(error => console.error("Error accepting friend request:", error));
    };

    const rejectRequest = (friendEmail) => {
        axios.post(`http://10.0.2.2:5000/api/friends/reject`, { friendEmail, userEmail })
            .then(() => {
                Alert.alert("Success", "Friend request rejected!");
                fetchFriends(); // Refresh the friends list
            })
            .catch(error => console.error("Error rejecting friend request:", error));
    };

    function convertToPath(inputString) {
        if (typeof inputString !== 'string') {
            return null;
        }
        const normalizedPath = inputString.replace(/\\/g, '/');
        const match = normalizedPath.match(/uploads\/.*/);
        return match ? `http://10.0.2.2:8081/my-backend/${match[0]}` : null;
    }
    // uri: item.profilePic ? convertToPath(item.profilePic) : 'https://example.com/default-avatar.png';
    const renderFriend = ({ item }) => (
        <View style={styles.friendItem}>
            <Image
                source={{ uri: convertToPath(profileImages[item.email])}}
                style={styles.profileImage}
                onError={() => setProfileImages(prevImages => ({ ...prevImages, [item.email]: null }))}
            />
            {friends.pending.includes(item) && ( // Check if item is in pending requests
                <View style={styles.buttonContainer}>
                    <Text>{item.email}</Text>
                    <TouchableOpacity onPress={() => acceptRequest(item.email)} style={styles.button}>
                        <Text style={styles.buttonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => rejectRequest(item.email)} style={styles.button}>
                        <Text style={styles.buttonText}>Reject</Text>
                    </TouchableOpacity>
                </View>
            )}
            {friends.accepted.includes(item) && ( // Open chat for accepted friends
                <TouchableOpacity onPress={() => openChat(item)} >
                    <Text>{item.email}</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const sections = [
        { title: 'Accepted Friends', data: friends.accepted },
        { title: 'Pending Requests', data: friends.pending },
    ];

    return (
        <View style={styles.container}>
            <SectionList
                sections={sections}
                keyExtractor={(item) => item._id}
                renderItem={renderFriend}
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={styles.sectionHeader}>{title}</Text>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    friendItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    }, profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        backgroundColor: '#4CAF50', // Green
        padding: 10,
        margin: 5,
        borderRadius: 5,
    },
    chatButton: {
        backgroundColor: '#2196F3', // Blue
        padding: 10,
        marginTop: 5,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
    },
});

export default ChatListScreen;