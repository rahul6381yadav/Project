import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../AuthContext';

const DiscussionDetailScreen = () => {
    const [discussions, setDiscussions] = useState([]);
    const [comment, setComment] = useState('');
    const [selectedDiscussionId, setSelectedDiscussionId] = useState(null);
    const { userEmail: currentUserEmail } = useAuth();

    useEffect(() => {
        // Fetch all discussions
        const fetchDiscussions = async () => {
            try {
                const response = await fetch('http://10.0.2.2:5000/api/discussions');
                const data = await response.json();
                setDiscussions(data);
            } catch (error) {
                console.error(error);
                Alert.alert('Error', 'Failed to load discussions.');
            }
        };

        fetchDiscussions();
    }, [discussions]);

    const handleAddComment = async (discussionId) => {
        try {
            const response = await fetch(`http://10.0.2.2:5000/api/discussions/${discussionId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ author: currentUserEmail, content: comment })
            });

            const data = await response.json();
            if (response.ok) {
                setDiscussions((prevDiscussions) =>
                    prevDiscussions.map((discussion) =>
                        discussion._id === discussionId ? data.discussion : discussion
                    )
                );
                setComment('');
                setSelectedDiscussionId(null);
            } else {
                Alert.alert('Error', data.message);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to add comment.');
        }
    };

    const handleLikeDiscussion = async (discussionId) => {
        try {
            const response = await fetch(`http://10.0.2.2:5000/api/discussions/${discussionId}/like`, {
                method: 'POST',
            });

            const data = await response.json();
            if (response.ok) {
                setDiscussions((prevDiscussions) =>
                    prevDiscussions.map((discussion) =>
                        discussion._id === discussionId ? { ...discussion, likes: data.likes } : discussion
                    )
                );
            } else {
                Alert.alert('Error', data.message);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to like discussion.');
        }
    };

    return (
        <View style={{ padding: 15, backgroundColor: '#f5f5f5', flex: 1 }}>
            <FlatList
                data={discussions}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={{
                        backgroundColor: '#fff',
                        borderRadius: 10,
                        padding: 15,
                        marginVertical: 10,
                        shadowColor: '#000',
                        shadowOpacity: 0.1,
                        shadowOffset: { width: 0, height: 2 },
                        shadowRadius: 5,
                        elevation: 3,
                    }}>
                        <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 5 }}>{item.title}</Text>
                        <Text style={{ color: '#333', marginBottom: 10 }}>{item.content}</Text>
                        <Text style={{ fontSize: 12, color: '#6b6b6b' }}>Posted by {item.author}</Text>

                        <TouchableOpacity onPress={() => handleLikeDiscussion(item._id)}>
                        <Text style={{ marginVertical: 5 }}>❤️ {item.likes}</Text>
                           
                        </TouchableOpacity>

                        <FlatList
                            data={item.comments}
                            keyExtractor={(comment) => comment._id}
                            renderItem={({ item: commentItem }) => (
                                <View style={{
                                    backgroundColor: '#f0f0f0',
                                    borderRadius: 8,
                                    padding: 10,
                                    marginTop: 5,
                                }}>
                                    <Text style={{ fontWeight: 'bold' }}>{commentItem.author}:</Text>
                                    <Text>{commentItem.content}</Text>
                                </View>
                            )}
                        />

                        {selectedDiscussionId === item._id && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                                <TextInput
                                    placeholder="Add a comment"
                                    value={comment}
                                    onChangeText={setComment}
                                    style={{
                                        flex: 1,
                                        padding: 10,
                                        borderColor: '#ccc',
                                        borderWidth: 1,
                                        borderRadius: 10,
                                        marginRight: 10,
                                    }}
                                />
                                <Button title="Post" onPress={() => handleAddComment(item._id)} />
                            </View>
                        )}

                        <TouchableOpacity onPress={() => setSelectedDiscussionId(item._id)} style={{ marginTop: 10 }}>
                            <Text style={{ color: '#007bff' }}>Comment</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
};

export default DiscussionDetailScreen;
