import axios from "axios";
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// During development, we point to the local backend because the new API endpoints 
// (like /api/auth/login) haven't been deployed to snper.in yet.
// Once deployed, you can change this to 'https://snper.in/api'
const PRODUCTION_API_URL = 'https://snepr.in/api';
const DEV_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3001/api' : 'http://localhost:3001/api';
const API_URL = process.env.EXPO_PUBLIC_API_URL || PRODUCTION_API_URL;

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
