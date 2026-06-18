import { API_BASE_URL } from '../config/constants';

// A master fetch wrapper that automatically adds the JWT token
export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('society_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || data.message || 'API Error');
  
  return data;
};