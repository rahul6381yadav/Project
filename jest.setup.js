import { jest } from '@jest/globals';
import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock any native modules here
jest.mock('react-native-document-picker', () => require('./__mocks__/react-native-document-picker'));
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('@react-native-async-storage/async-storage', () => {
    return {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
        // add other methods as needed
    };
});