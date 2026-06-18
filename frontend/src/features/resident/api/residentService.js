import { apiClient } from '../../../lib/apiClient';

export const renameHouse = async (plotId, newName) => {
    return await apiClient(`/plots/${plotId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: newName })
    });
};