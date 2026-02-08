import apiClient from './axios';
import { API_ENDPOINTS } from '../utils/constants';

export const loginUser=async (credentials) =>{
  const formData=new URLSearchParams();
  formData.append('username',credentials.username);
  formData.append('password',credentials.password);
  const response=await apiClient.post(
    API_ENDPOINTS.LOGIN,
    formData,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  return response;
};

export const login2FA=async (data) =>{
  const formData=new URLSearchParams();
  formData.append('temp_token',data.temp_token);
  formData.append('code',data.code);
  const response=await apiClient.post(
    '/login/2fa',
    formData,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  return response;
};

export const registerUser=async (userData) =>{
  const formData=new URLSearchParams();
  formData.append('username',userData.username);
  formData.append('email',userData.email);
  formData.append('password',userData.password);
  const response=await apiClient.post(
    API_ENDPOINTS.REGISTER,
    formData,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  return response;
};

export const requestPasswordReset=async (email) =>{
  const formData=new URLSearchParams();
  formData.append('email',email);

  const response=await apiClient.post(
    API_ENDPOINTS.FORGOT_PASSWORD,
    formData,
    {
      headers: {
        'Content-Type':'application/x-www-form-urlencoded',
      },
    }
  );
  return response;
};

export const resetPassword=async (data) =>{
  const formData=new URLSearchParams();
  formData.append('email',data.email);
  formData.append('reset_code',data.code);
  formData.append('new_password',data.new_password);
  const response=await apiClient.post(
    API_ENDPOINTS.RESET_PASSWORD,
    formData,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  return response;
};

export const logoutUser=async () =>{
  try {
    const response=await apiClient.post(API_ENDPOINTS.LOGOUT);
    return response;
  } catch (error) {
    return { success: true };
  }
};