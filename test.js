import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import io from 'socket.io-client';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const socket = io('http://10.0.2.2:5000');

const ChatScreen = ({ route }) => {
    const navigation = useNavigation();
    const { userEmail, friendEmail } = route.params;
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [document, setDocument] = useState(null);

    useEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
            ),
        });

        // Inform server of user status
        socket.emit('online', userEmail);

        // Fetch chat history and set up message listener
        fetchChatHistory();
        socket.on('receiveMessage', (newMessage) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        return () => socket.off('receiveMessage');
    }, []);

    const fetchChatHistory = async () => {
        try {
            const response = await axios.get(`http://10.0.2.2:5000/api/messages/${userEmail}/${friendEmail}`);
            setMessages(response.data);
        } catch (error) {
            console.error("Error fetching chat history:", error);
        }
    };

    const sendMessage = () => {
        if (text.trim() || document) {
            const messageData = {
                senderEmail: userEmail,
                receiverEmail: friendEmail,
                text: text.trim(),
                timestamp: new Date().toISOString(),
                file: document,
            };
            try {
                socket.emit('send_message', messageData);
                setText('');
                setDocument(null);
            } catch (err) {
                Alert.alert('Error', 'Message failed to send');
                storeMessageLocally(messageData); // Store offline if failed
            }


        }
        console.log(text)
    };

    const pickDocument = async () => {
        try {
            const res = await DocumentPicker.pickSingle();
            setDocument(res.uri);
        } catch (err) {
            if (!DocumentPicker.isCancel(err)) {
                console.error('DocumentPicker Error:', err);
            }
        }
    };



    const renderMessage = ({ item }) => (
        <View style={[
            styles.message,
            item.senderEmail === userEmail ? styles.sent : styles.received
        ]}>
            <Text>{item.text}</Text>
            {item.documentUrl && <Text>📄 Document</Text>}
            <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
        </View>
    );


    const storeMessageLocally = (message) => {
        // Implementation for storing messages locally, e.g., AsyncStorage
        // Retrieve on reconnect and resend
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item._id}
                inverted
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={text}
                    onChangeText={setText}
                    placeholder="Type a message"
                />
                <TouchableOpacity onPress={pickDocument} style={styles.button}>
                    <Text>Attach</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={sendMessage} style={styles.button}>
                    <Text>Send</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    message: { padding: 10, borderRadius: 5, marginVertical: 5 },
    sent: { backgroundColor: '#DCF8C6', alignSelf: 'flex-end' },
    received: { backgroundColor: '#ECECEC' },
    inputContainer: { flexDirection: 'row', alignItems: 'center' },
    input: { flex: 1, borderColor: '#ccc', borderWidth: 1, borderRadius: 5, padding: 8 },
    button: { padding: 8 },
    timestamp: { fontSize: 10, color: '#888', alignSelf: 'flex-end' },
    backButton: { marginLeft: 10 },
    backButtonText: { color: '#007AFF' },
});

export default ChatScreen;
