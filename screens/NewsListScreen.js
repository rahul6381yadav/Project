import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';

const NewsListScreen = ({ navigation }) => {
    const [news, setNews] = useState([]);

    useEffect(() => {
        // Fetch news updates from API
        const fetchNews = async () => {
            try {
                const response = await fetch('http://10.0.2.2:5000/api/news');
                const data = await response.json();
                setNews(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchNews();
    }, []);

    const renderItem = ({ item }) => (
        <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.title}</Text>
            <Text>{item.content}</Text>
        </View>
    );

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={news}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
            />
        </View>
    );
};

export default NewsListScreen;
