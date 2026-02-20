import {useState,useEffect} from 'react';
import {Link,useNavigate,useLocation} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext';
import {Input} from '../../components/common/Input';
import {Button} from '../../components/common/Button';

export function ForgotPasswordPage(){
    const {forgotPassword}=useAuth();
    const navigate=useNavigate();
    const location=useLocation();
    useEffect(()=>{
        if(location.state?.error)
        {
            setError(location.state.error);
            }
        },[location.state]);
    const [email,setEmail]=useState('');
    const [isLoading,setIsLoading]=useState(false);
    const [error,setError]=useState('');
    const [fieldErrors,setFieldErrors]=useState({email:''});

    const validateEmail=(email)=>{
        const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
        };

    const handleSubmit=async (e)=>{
        e.preventDefault();
        setError('');
        setFieldErrors({email:''});

        if(!email.trim())
        {
            setFieldErrors({email:"Email is required"});
            return;
            }

        if(!validateEmail(email))
        {
            setFieldErrors({email:"Invalid email format"});
            return;
            }
        setIsLoading(true);

        try{
            const result=await forgotPassword(email);
            if(result.success)
            {
                navigate('/reset-password',{
                    state:{
                        email,
                        message:result.message,
                        expiresInMinutes:result.expiresInMinutes
                        }
                    });
                }
            else{
                setError(result.error||'Failed to send reset code.');
                }
            }
        catch(err){
            console.error('Forgot password error:',err);
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

    return(
        <div className="min-h-screen bg-gradient-to-b from-[#0A1F44] via-[#1E3A5F] to-gray-100 flex items -center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                        Forgot
                    </h1>
                    <p className="text-xl text-gray-200">
                        password?
                    </p>
                </div>
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm text-center">
                                {error}
                            </p>
                        </div>
                        )}
                    <div className="mb-6">
                        <p className="text-gray-600 text-sm text-center">
                            Enter your email and we'll send you a code to reset your password.
                        </p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <Input
                            label="Email"
                            type="email"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={fieldErrors.email}
                            autoComplete="email"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            loading={isLoading}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sending...' : 'SEND RESET CODE'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                          to="/login"
                          className="text-sm text-gray-600 hover:text-primary-600 transition-colors inline-flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}