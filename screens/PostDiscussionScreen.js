import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../AuthContext';

const PostDiscussionScreen = ({ navigation }) => {
    const { userEmail } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handlePostDiscussion = async () => {
        if (!title || !content) {
            Alert.alert('Error', 'Please fill out both the title and content fields.');
            return;
        }

        try {
            const response = await fetch('http://10.0.2.2:5000/api/discussions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content,
                    author: userEmail
                })
            });

            const data = await response.json();
            if (response.ok) {
                Alert.alert('Success', data.message);
                setTitle('');
                setContent('');
                navigation.goBack(); // Navigate back to the discussions list
            } else {
                Alert.alert('Error', data.message);
            }
        } catch (error) {
            console.error('Error posting discussion:', error);
            Alert.alert('Error', 'An error occurred while posting the discussion.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Post a New Discussion</Text>
            <TextInput
                placeholder="Discussion Title"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
            />
            <TextInput
                placeholder="Discussion Content"
                value={content}
                onChangeText={setContent}
                style={[styles.input, styles.textArea]}
                multiline
            />
            <Button title="Post Discussion" onPress={handlePostDiscussion} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff'
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20
    },
    input: {
        borderBottomWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        marginBottom: 15,
        borderRadius: 5,
        fontSize: 16
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top'
    }
});

export default PostDiscussionScreen;
