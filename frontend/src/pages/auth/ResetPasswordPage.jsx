import {useState,useEffect} from 'react';
import {Link,useNavigate,useLocation} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext';
import {Input} from '../../components/common/Input';
import {Button} from '../../components/common/Button';

export function ResetPasswordPage(){
    const {resetPassword}=useAuth();
    const navigate=useNavigate();
    const location=useLocation();

    const emailFromState=location.state?.email;
    useEffect(()=>{
        if(!emailFromState)
        {
            navigate('/forgot-password',{
                state:{
                    error:'Please enter your email first.'
                    }
                });
            }
        },[emailFromState,navigate]);

    const [email]=useState(emailFromState||'');
    const [code,setCode]=useState('');
    const [newPassword,setNewPassword]=useState('');
    const [confirmPassword,setConfirmPassword]=useState('');
    const [isLoading,setIsLoading]=useState(false);
    const [error,setError]=useState('');
    const [successMessage,setSuccessMessage]=useState('');
    const [fieldErrors,setFieldErrors]=useState({
        code:'',
        newPassword:'',
        confirmPassword:'',
        });

    const [infoMessage,setInfoMessage]=useState('');
    const [expiresInMinutes,setExpiresInMinutes]=useState(null);

    useEffect(()=>{
        if(location.state?.message){
            setInfoMessage(location.state.message);
            }
        if(location.state?.expiresInMinutes){
            setExpiresInMinutes(location.state.expiresInMinutes);
            }
        },[location.state]);

    const validatePassword=(password)=>{
        if (password.length < 8)
        {
            return 'Password must be at least 8 characters';
        }
        if (!/[A-Z]/.test(password))
        {
            return 'Password must contain at least one uppercase letter';
        }
        if (!/[a-z]/.test(password))
        {
            return 'Password must contain at least one lowercase letter';
        }
        if (!/[0-9]/.test(password))
        {
            return 'Password must contain at least one number';
        }
        return null;
        };

    const handleSubmit=async (e)=>{
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setFieldErrors({
            code:'',
            newPassword:'',
            confirmPassword:'',
            });

        let hasErrors=false;
        const newFieldErrors={
            code:'',
            newPassword:'',
            confirmPassword:'',
            };

        if(!code.trim()){
            newFieldErrors.code='Reset code is required';
            hasErrors=true;
            }
        else if(code.length!== 6||!/^\d+$/.test(code)){
            newFieldErrors.code='Reset code must be 6 digits';
            hasErrors=true;
            }

        if (!newPassword)
        {
            newFieldErrors.newPassword = 'New password is required';
            hasErrors = true;
            }
        else
        {
            const passwordError = validatePassword(newPassword);
            if (passwordError)
            {
                newFieldErrors.newPassword = passwordError;
                hasErrors = true;
                }
            }
        if(!confirmPassword)
        {
            newFieldErrors.confirmPassword='Please confirm your password';
            hasErrors=true;
            }
        else if(newPassword!=confirmPassword)
        {
            newFieldErrors.confirmPassword='Passwords do not match';
            hasErrors=true;
            }
        if(hasErrors){
            setFieldErrors(newFieldErrors);
            return;
            }
        setIsLoading(true);

        try{
            const result=await resetPassword({
                email,
                code,
                new_password:newPassword,
                });

            if(result.success)
            {
                setSuccessMessage('Password reset successfully! Redirecting to login...');
                setTimeout(()=>{
                    navigate('/login',{
                        state:{message:'Password reset successfully! Please login with your new password.'}
                        });
                    },2000);
                }
            else
            {
                setError(result.error||'Failed to reset password.');
                }
            }
        catch(err)
        {
            console.error('Reset password error:',err);
            if(typeof err==='string')
                {
                    setError(err);
                }
                else if (err instanceof Error)
                {
                    setError(err.message);
                }
                else
                {
                    setError('Something went wrong.Please try again.');
                }
            }
        finally{
            setIsLoading(false);
            }

        };
    if(!email)
    {
        return null;
        }

    return(
        <div className="min-h-screen bg-gradient-to-b from-[#0A1F44] via-[#1E3A5F] to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                        Reset
                    </h1>
                    <p className="text-xl text-gray-200">
                        Password
                    </p>
                </div>
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    {infoMessage &&(
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="text-center">
                                <p className="text-blue-600 text-sm font-medium mb-1">
                                    {infoMessage}
                                </p>
                                <p className="text-blue-500 text-xs">
                                    Sent to:<span className="font-semibold">{email}</span>
                                </p>
                                {expiresInMinutes && (
                                    <p className="text-blue-500 text-xs mt-1">
                                        Code expires in {expiresInMinutes} minutes
                                    </p>
                                    )}
                            </div>
                        </div>
                        )}
                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-50 border-green-200 rounded-lg">
                            <p className="text-green-600 text-sm text-center">
                                {successMessage}
                            </p>
                        </div>
                        )}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm text-center">
                                {error}
                            </p>
                        </div>
                        )}
                    {!infoMessage &&(
                        <div className="mb-6">
                            <p className="text-gray-600 text-sm text-center">
                                Enter the 6-digit code sent to your email and your new password.
                            </p>
                        </div>
                        )}

                    <form onSubmit={handleSubmit}>
                        <Input
                            label="Reset Code"
                            type="text"
                            placeholder="123456"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            error={fieldErrors.code}
                            maxLength={6}
                            autoComplete="off"
                        />
                        <Input
                            label="New Password"
                            type="password"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            error={fieldErrors.newPassword}
                            autoComplete="new-password"
                        />
                        <Input
                           label="Confirm Password"
                           type="password"
                           placeholder="••••••••"
                           value={confirmPassword}
                           onChange={(e) => setConfirmPassword(e.target.value)}
                           error={fieldErrors.confirmPassword}
                           autoComplete="new-password"
                        />
                        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600 font-medium mb-2">
                                Password must contain:
                            </p>
                            <ul className="text-xs text-gray-600 space-y-1">
                                <li className={newPassword.length >= 8 ? 'text-green-600' : ''}>
                                    • At least 8 characters
                                </li>
                                <li className={/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}>
                                    • One uppercase letter
                                </li>
                                <li className={/[a-z]/.test(newPassword) ? 'text-green-600' : ''}>
                                    • One lowercase letter
                                </li>
                                <li className={/[0-9]/.test(newPassword) ? 'text-green-600' : ''}>
                                    • One number
                                </li>
                            </ul>
                        </div>
                        <Button
                            type="submit"
                            fullWidth
                            loading={isLoading}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Resetting...' : 'RESET PASSWORD'}
                        </Button>
                    </form>
                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="text-sm text-gray-600 hover:text-primary-600 transition-colors inline-flex items-center gap-1"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                            Back to sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
