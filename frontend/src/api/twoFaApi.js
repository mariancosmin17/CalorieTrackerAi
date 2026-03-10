import apiClient from './axios';
import { API_ENDPOINTS } from '../utils/constants';

export const enable2FA = async () => {
    const response = await apiClient.post(API_ENDPOINTS.ENABLE_2FA);
    return response;
};

export const verify2FASetup = async (code) => {
    const formData = new URLSearchParams();
    formData.append('code', code);
    const response = await apiClient.post(API_ENDPOINTS.VERIFY_2FA_SETUP, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response;
};

export const disable2FA = async (code) => {
    const formData = new URLSearchParams();
    formData.append('code', code);
    const response = await apiClient.post(API_ENDPOINTS.DISABLE_2FA, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response;
};