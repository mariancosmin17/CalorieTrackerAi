import apiClient from './axios';

export const getProfile=async ()=>{
const response=await apiClient.get('/profile');
return response;
};

export const updateProfile=async (data)=>{
const response=await apiClient.put('/profile',data);
return response;
};