import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet } from 'react-native';
import io from 'socket.io-client';

const socket = io("http://10.0.2.2:5000", {
    transports: ["websocket"],
    forceNew: true,
});

const ChatScreen = ({ route }) => {
    const { userEmail, friendEmail } = route.params;
    const [messageText, setMessageText] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // Emit online status when the component mounts
        socket.emit('online', userEmail);

        // Load previous messages from the backend
        loadMessages();

        // Listen for incoming messages
        socket.on('receiveMessage', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        // Cleanup on unmount
        return () => {
            socket.off('receiveMessage');
        };
    }, []);

    const loadMessages = async () => {
        try {
            const response = await fetch(`http://10.0.2.2:5000/api/messages/${userEmail}/${friendEmail}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error("Error loading messages:", error);
        }
    };

    const sendMessage = () => {
        if (messageText.trim() === '') return;

        const message = {
            senderEmail: userEmail,
            receiverEmail: friendEmail,
            text: messageText,
            timestamp: new Date(),
        };

        // Emit the message through the socket
        socket.emit('send_message', message);
        // Update local messages state immediately
        setMessages((prevMessages) => [...prevMessages, message]);

        setMessageText('');
    };


    const oldMessages = () => {
        
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={[
                        styles.messageContainer,
                        item.senderEmail === userEmail ? styles.sentMessage : styles.receivedMessage
                    ]}>
                        <Text style={styles.sender}>
                            {item.senderEmail === userEmail ? 'You' : userEmail}
                        </Text>
                        <Text style={styles.messageText}>{item.text}</Text>
                    </View>
                )}
            />
            <TextInput
                style={styles.input}
                placeholder="Type a message"
                value={messageText}
                onChangeText={setMessageText}
            />
            <Button title="Send" onPress={sendMessage} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    messageContainer: { marginVertical: 5, padding: 10, borderRadius: 10, maxWidth: '75%' },
    sentMessage: {
        backgroundColor: '#DCF8C6',
        alignSelf: 'flex-end',
        borderTopRightRadius: 0,
    },
    receivedMessage: {
        backgroundColor: '#ECECEC',
        alignSelf: 'flex-start',
        borderTopLeftRadius: 0,
    },
    sender: { fontWeight: 'bold' },
    messageText: { fontSize: 16 },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        padding: 10,
        marginBottom: 10,
    },
});

export default ChatScreen;
