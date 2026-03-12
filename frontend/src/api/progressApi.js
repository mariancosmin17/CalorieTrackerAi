import apiClient from './axios';

export const getProgress=async ()=>{
    const response=await apiClient.get('/progress');
    return response;
};

export const logWeight=async(weight_kg)=>{
    const formData=new URLSearchParams();
    formData.append('weight_kg',weight_kg);
    const response=await apiClient.post('/weight-log',formData,{
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
    });
    return response;
};