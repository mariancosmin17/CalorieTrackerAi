import apiClient from './axios';

export const completeSetup = async (data) => {
    const response = await apiClient.post('/setup/complete', data, {
        headers: { 'Content-Type': 'application/json' },
    });
    return response;
};