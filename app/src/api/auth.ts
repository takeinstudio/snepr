import { apiClient } from './client';
import * as SecureStore from 'expo-secure-store';

export const login = async (username: string, password: string) => {
  const response = await apiClient.post('/auth/login', { username, password });
  const { token, user } = response.data;
  
  if (token) {
    await SecureStore.setItemAsync('session_token', token);
    await SecureStore.setItemAsync('user_data', JSON.stringify(user));
  }
  
  return user;
};

export const logout = async () => {
  await SecureStore.deleteItemAsync('session_token');
  await SecureStore.deleteItemAsync('user_data');
};
