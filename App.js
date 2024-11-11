import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import DetailsScreen from './screens/DetailsScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import { AuthProvider ,useAuth} from './AuthContext';
import ProfileEditScreen from './screens/ProfileEditScreen';
import ChatListScreen from './screens/ChatListScreen';
import ChatScreen from './screens/ChatScreen';
import NewsListScreen from './screens/NewsListScreen';
// Importing images for the tab icons
import HomeIcon from './assets/images/home.png';
import ProfileIcon from './assets/images/profile.png';
import ChatIcon from './assets/images/chat.png';
import newsIcon from './assets/images/news.png';
import postIcon from './assets/images/post.png';
import AlumniCardScreen from './screens/AlumniCardScreen';
import AddNewsScreen from './screens/AddNewsScreen';
import PostDiscussionScreen from './screens/PostDiscussionScreen';
import DiscussionDetailScreen from './screens/DiscussionDetailScreen';
import ProfileDetailsScreen from './screens/ProfileDetailsScreen';
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
    return (
        <Stack.Navigator initialRouteName="Register">
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}

function ChatStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="ChatList" component={ChatListScreen} options={{ title: 'Chat List' }} />
            <Stack.Screen name="Chat" component={ChatScreen} options={({ route }) => ({ title: route.params.friendEmail })} />
        </Stack.Navigator>
    );
}

function HomeStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="HomePage" component={HomeScreen} />
            <Stack.Screen name="AlumniCard" component={AlumniCardScreen} />
            <Stack.Screen name="AddNews" component={AddNewsScreen} />
            <Stack.Screen name="PostDiscussion" component={PostDiscussionScreen} />
            <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen}/>
            
        </Stack.Navigator>
    );
}

function AppTabs() {
    const { userEmail } = useAuth();

    return (
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={{
                tabBarActiveTintColor: '#e91e63',
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeStack}
                options={{
                    headerShown: false,
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Image source={HomeIcon} style={{ width: size, height: size, tintColor: color }} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                initialParams={{ email: userEmail }}
                options={{
                    headerShown: false,
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Image source={ProfileIcon} style={{ width: size, height: size, tintColor: color }} />
                    ),
                }}
            />
            <Tab.Screen
                name="News"
                component={NewsListScreen}
                initialParams={{ email: userEmail }}
                options={{
                    headerShown: false,
                    tabBarLabel: 'News',
                    tabBarIcon: ({ color, size }) => (
                        <Image source={newsIcon} style={{ width: size, height: size, tintColor: color }} />
                    ),
                }}
            />
            <Tab.Screen
                name="Post"
                component={DiscussionDetailScreen}
                initialParams={{ email: userEmail }}
                options={{
                    headerShown: false,
                    tabBarLabel: 'Post',
                    tabBarIcon: ({ color, size }) => (
                        <Image source={postIcon} style={{ width: size, height: size, tintColor: color }} />
                    ),
                }}
            />
            <Tab.Screen
                name="ChatTabs"
                component={ChatStack}
                options={{
                    headerShown: false,
                    tabBarLabel: 'Chat List',
                    tabBarIcon: ({ color, size }) => (
                        <Image source={ChatIcon} style={{ width: size, height: size, tintColor: color }} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

function MainStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="MainTabs" component={AppTabs} options={{ headerShown: false }} />
            <Stack.Screen
                name="ProfileEdit"
                component={ProfileEditScreen}
                options={{ title: 'Edit Profile' }}
            />
        </Stack.Navigator>
    );
}

function RootNavigator() {
    const { isLoggedIn } = useAuth();

    return isLoggedIn ? <MainStack /> : <AuthStack />;
}

export default function App() {
    return (
        <AuthProvider>
            <NavigationContainer>
                <RootNavigator />
            </NavigationContainer>
        </AuthProvider>
    );
}    