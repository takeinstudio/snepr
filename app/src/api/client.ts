import axios from "axios";
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const DEV_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3001/api' : 'http://localhost:3001/api';
const API_URL = process.env.EXPO_PUBLIC_API_URL || DEV_API_URL;

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config: any) => {
  try {
    const token = await SecureStore.getItemAsync('session_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    // Ignore secure store errors
  }
  return config;
});
