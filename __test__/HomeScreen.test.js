import 'react-native';
import React from 'react';
import { render } from '@testing-library/react-native'
import HomeScreen from '../screens/HomeScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

test('HomeScreen snapshot', () => {
    const { toJSON } = render(<HomeScreen />);
    expect(toJSON()).toMatchSnapshot();
});
