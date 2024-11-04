import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useAuth } from '../AuthContext';

const AddNewsScreen = () => {
    const { userEmail } = useAuth();
    const [newsTitle, setNewsTitle] = useState('');
    const [newsContent, setNewsContent] = useState('');

    const handleSubmit = async () => {
        // Perform your logic to submit news (e.g., API call)
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
                // Reset fields
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
            <View>
                <Text>You do not have permission to add news updates.</Text>
            </View>
        );
    }

    return (
        <View>
            <Text>Add News Update</Text>
            <TextInput
                placeholder="News Title"
                value={newsTitle}
                onChangeText={setNewsTitle}
                style={{ borderBottomWidth: 1, marginBottom: 10 }}
            />
            <TextInput
                placeholder="News Content"
                value={newsContent}
                onChangeText={setNewsContent}
                style={{ borderBottomWidth: 1, marginBottom: 10 }}
                multiline
            />
            <Button title="Submit" onPress={handleSubmit} />
        </View>
    );
};

export default AddNewsScreen;
