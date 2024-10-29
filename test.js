import React from 'react';
import { View, Text, Button } from 'react-native';
import { useAuth } from '../AuthContext';

function HomeScreen({ navigation }) {
    const { logout, userEmail } = useAuth(); // Destructure userEmail from context

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Welcome to the Home Screen</Text>
            <Button
                title="Edit Profile"
                onPress={() => navigation.navigate('ProfileEditScreen', { email: userEmail })}
            />
            <Button title="Go to Profile" onPress={() => navigation.navigate('Profile', { email: userEmail })} />
            <Button title="Logout" onPress={logout} />

        </View>
    );
}

export default HomeScreen;





