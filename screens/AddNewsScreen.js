import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../AuthContext';

const AddNewsScreen = () => {
    const { userEmail } = useAuth();
    const [newsTitle, setNewsTitle] = useState('');
    const [newsContent, setNewsContent] = useState('');

    const handleSubmit = async () => {
        try {
            const response = await fetch('http://10.0.2.2:5000/api/news', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: newsTitle,
                    content: newsContent,
                    author: userEmail,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                Alert.alert('Success', data.message);
                setNewsTitle('');
                setNewsContent('');
            } else {
                Alert.alert('Error', data.message);
            }
        } catch (error) {
            console.error('Error adding news:', error);
            Alert.alert('Error', 'An error occurred while adding news.');
        }
    };

    if (userEmail !== 'rahul6381yadav@gmail.com') {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>You do not have permission to add news updates.</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Add News Update</Text>
            <TextInput
                placeholder="News Title"
                value={newsTitle}
                onChangeText={setNewsTitle}
                style={styles.input}
            />
            <TextInput
                placeholder="News Content"
                value={newsContent}
                onChangeText={setNewsContent}
                style={[styles.input, styles.contentInput]}
                multiline
            />
            <Button title="Submit" onPress={handleSubmit} color="#007AFF" />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#F5F7FA',
        justifyContent: 'center',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#DDD',
        marginBottom: 15,
    },
    contentInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    permissionText: {
        fontSize: 18,
        color: '#FF3D00',
        textAlign: 'center',
    },
});

export default AddNewsScreen;
