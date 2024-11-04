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
        <View style={{ padding: 20 }}>
            <FlatList
                data={discussions}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={{ marginBottom: 20, padding: 10, borderBottomWidth: 1 }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{item.title}</Text>
                        <Text>{item.content}</Text>
                        <Text>{ item.author}</Text>
                        <Text>Likes: {item.likes}</Text>

                        <TouchableOpacity
                            onPress={() => handleLikeDiscussion(item._id)}
                            style={{ marginVertical: 10 }}
                        >
                            <Text style={{ color: 'blue' }}>Like</Text>
                        </TouchableOpacity>

                        <FlatList
                            data={item.comments}
                            keyExtractor={(comment) => comment._id}
                            renderItem={({ item: commentItem }) => (
                                <View style={{ marginBottom: 5 }}>
                                    <Text style={{ fontWeight: 'bold' }}>{commentItem.author}:</Text>
                                    <Text>{commentItem.content}</Text>
                                </View>
                            )}
                        />

                        {selectedDiscussionId === item._id && (
                            <View>
                                <TextInput
                                    placeholder="Add a comment"
                                    value={comment}
                                    onChangeText={setComment}
                                    style={{ borderBottomWidth: 1, marginBottom: 10 }}
                                />
                                <Button
                                    title="Post Comment"
                                    onPress={() => handleAddComment(item._id)}
                                />
                            </View>
                        )}

                        <Button
                            title="Comment"
                            onPress={() => setSelectedDiscussionId(item._id)}
                        />
                    </View>
                )}
            />
        </View>
    );
};

export default DiscussionDetailScreen;
