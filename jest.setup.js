// Jest setup file
import 'jest-expo/extend-expect';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  multiSet: jest.fn(),
  multiGet: jest.fn(),
  getAllKeys: jest.fn(),
  clear: jest.fn(),
}));

// Mock axios
jest.mock('axios');
