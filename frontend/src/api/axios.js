import axios from 'axios';
import {API_BASE_URL,STORAGE_KEYS} from '../utils/constants';

const apiClient=axios.create({
    baseURL:API_BASE_URL,
    timeout:30000,
    headers:{'Content-Type':'application/json',
    },
  });

apiClient.interceptors.request.use(
    (config)=>{
        const token=localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (token) {
        config.headers.Authorization=`Bearer ${token}`;
        }
        return config;
    },

    (error)=>{return Promise.reject(error);
    }
   );

apiClient.interceptors.response.use(
    (response)=>{
    return response.data;
    },
    (error)=>{
        if(error.response){
            const {status,data}=error.response;
            if(status===401){
                localStorage.removeItem(STORAGE_KEYS.TOKEN);
                localStorage.removeItem(STORAGE_KEYS.USER);
                window.location.href='/login';
            }

            let errorMessage = 'An error occurred';
            if (data?.detail) {
                errorMessage = data.detail;
            }
            else if (data?.message) {
                errorMessage = data.message;
            }
            else if (typeof data === 'string') {
                errorMessage = data;
            }
            return Promise.reject(errorMessage)
        }
        else if (error.request){
            return Promise.reject('Network error.Please check your connection');
        }
        else{
            return Promise.reject(error.message||'An error occurred');
        }
    }
);

export default apiClient;
