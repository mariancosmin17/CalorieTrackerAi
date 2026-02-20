import { createContext,useContext,useState,useEffect } from 'react';
import { loginUser,login2FA,registerUser,logoutUser,requestPasswordReset,resetPassword } from '../api/authApi';
import { STORAGE_KEYS } from '../utils/constants';

const AuthContext=createContext(null);

export function AuthProvider({children}){
    const [user,setUser]=useState(null);
    const [isLoading,setIsLoading]=useState(true);
    const isLoggedIn=user!==null;
    useEffect(()=>{
        checkAuth();},[]);

    const checkAuth=async ()=>{
        try{
            const token=localStorage.getItem(STORAGE_KEYS.TOKEN);
            if(!token){
                setIsLoading(false);
                return;
                }
            const userData=localStorage.getItem(STORAGE_KEYS.USER);
            if(userData){
                const parsedUser=JSON.parse(userData);
                setUser(parsedUser);
                }

            }
        catch(error){
            console.error('Auth check failed:',error);
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
            }
        finally{
            setIsLoading(false);}
        };

    const login=async (credentials)=>{
        try{
            const response=await loginUser(credentials);
            if(response.requires_2fa){
                return{
                    success:false,
                    requires2FA:true,
                    tempToken:response.temp_token,
                    message:response.message||'Please enter 2FA Code',
                    };
                }
            localStorage.setItem(STORAGE_KEYS.TOKEN,response.access_token);
            const userData={
                username:credentials.username,};
                localStorage.setItem(STORAGE_KEYS.USER,JSON.stringify(userData));
                setUser(userData);
                return{
                    success:true,
                    requires2FA:false,
                    user:userData,
                    };
            }
        catch(error){
            return{
                success:false,
                requires2FA:false,
                error:error || 'Login failed',
                };
            }
        };
    const verify2FA=async (data)=>{
        try{
            const response=await login2FA(data);
            localStorage.setItem(STORAGE_KEYS.TOKEN,response.access_token);
            const userData={
                username:data.username||'User',
                };
            localStorage.setItem(STORAGE_KEYS.USER,JSON.stringify(userData));
            setUser(userData);
            return {
                success:true,
                user:userData,};
            }
        catch(error){
            return {
                success: false,
                error: error || '2FA verification failed',
                };
            }
        };

    const register=async (userData)=>{
        try{
            const response=await registerUser(userData);
            return{
                success:true,
                message:response.message||'Registration successful',
                };
            }
        catch(error){
            return{
                success:false,
                error:error||'Registration failed',};
            }
        };

    const forgotPassword =async (email)=>{
        try{
            const response=await requestPasswordReset(email);
            return {
                success:true,
                message:response.message||'Reset code sent to your email',
                expiresInMinutes:response.expires_in_minutes,
                };
            }
        catch(error){
            return{
                success:false,
                error:error||'Failed to send reset code';
                };
            }
        };

    const resetPasswordWithCode= async(data)=>{
        try{
            const response=await resetPassword(data);
            return{
                success:true,
                message:response.message||'Password reset successfully',
                };
            }
        catch(error)
        {
            return{
                success:false,
                error:error||'Failed to reset password',
                };
            }
        };

    const logout=async()=>{
        try{
            await logoutUser();
            }
        catch(error){
            console.error('Logout API failed:',error);
            }
        finally{
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
            setUser(null);
            window.location.href='/login';
            }
        };

    const value={
        user,
        isLoggedIn,
        isLoading,
        login,
        verify2FA,
        register,
        forgotPassword,
        resetPassword:resetPasswordWithCode,
        logout,
        checkAuth,
        };

    if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
        );
        }

      return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
       );
    }

export function useAuth(){
    const context=useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
        }
    return context;
    }

export default AuthContext;

