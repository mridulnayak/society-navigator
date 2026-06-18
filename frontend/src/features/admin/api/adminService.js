import { apiClient } from '../../../lib/apiClient';

export const addPlotToDatabase = async (plotData) => {
    return await apiClient('/plots', {
        method: 'POST',
        body: JSON.stringify(plotData)
    });
};