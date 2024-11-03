import 'react-native';
import React from 'react';
import { render } from '@testing-library/react-native'
import HomeScreen from '../screens/HomeScreen';

test('HomeScreen snapshot', () => {
    const { toJSON } = render(<HomeScreen />);
    expect(toJSON()).toMatchSnapshot();
});
