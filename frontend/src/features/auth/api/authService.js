import { apiClient } from '../../../lib/apiClient';

export const loginUser = async (username, password) => {
    return await apiClient('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
};