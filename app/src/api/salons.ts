import { apiClient } from './client';

export const getSalons = async () => {
  const response = await apiClient.get('/salons/');
  return response.data;
};
