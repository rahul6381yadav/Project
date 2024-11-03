// screens/AddNewsScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useAuth } from '../AuthContext';

const AddNewsScreen = () => {
    const { userRole } = useAuth();
    const [newsTitle, setNewsTitle] = useState('');
    const [newsContent, setNewsContent] = useState('');

    const handleSubmit = () => {
        // Perform your logic to submit news (e.g., API call)
        Alert.alert('News Added', `Title: ${newsTitle}\nContent: ${newsContent}`);
        // Reset fields
        setNewsTitle('');
        setNewsContent('');
    };

    if (userRole !== 'admin') {
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
