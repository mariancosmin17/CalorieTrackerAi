import apiClient from './axios';
import {API_ENDPOINTS} from '../utils/constants';

export const analyzeFoodImage=async (imageFile)=>{
    const formData=new FormData();
    formData.append('file',imageFile);
    const response=await apiClient.post(
        API_ENDPOINTS.PREDICT,
        formData,
        {
            headers:{
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    return response;
};

export const SaveMealToHistory=async (data)=>{
    const response=await apiClient.post(
        API_ENDPOINTS.HISTORY_SAVE,
        data
    );
    return response;
};

export const getFoodHistory=async (date=null)=>{
    let url=API_ENDPOINTS.HISTORY;
    if (date){
        url+=`?date=${date}`;
    }
    const response=await apiClient.get(url);
    return response;
};