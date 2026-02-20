import {useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext';
import {Input} from '../../components/common/Input';
import {Button} from '../../components/common/Button';

export function RegisterPage(){
    const {register:registerUser,isLoggedIn}=useAuth();
    const navigate=useNavigate();
    const [username,setUsername]=useState('');
    const [password,setPassword]=useState('');
    const [email,setEmail]=useState('');
    const [error,setError]=useState('');
    const [isLoading,setIsLoading]=useState(false);
    const [confirmPassword,setConfirmPassword]=useState('');
    const [successMessage,setSuccessMessage]=useState('');
    const [fieldErrors,setFieldErrors]=useState({
        username:'',
        email:'',
        password:'',
        confirmPassword:'',
        });

    const validateEmail=(email)=>{
        const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
        };

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

    const handleSubmit = async (e)=>{
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setFieldErrors({
            username:'',
            email:'',
            password:'',
            confirmPassword:'',
            });

        let hasErrors=false;
        const newFieldErrors={
            username:'',
            email:'',
            password:'',
            confirmPassword:'',
            };

        if(!username.trim())
        {
            newFieldErrors.username='Username is required';
            hasErrors=true;
            }
        else if(username.length<3)
        {
            newFieldErrors.username='Username must be at least 3 characters';
            hasErrors=true;
            }
        else if(!/^[a-zA-Z0-9_]+$/.test(username))
        {
            newFieldErrors.username='Username can only contain letters, numbers, and underscores';
            hasErrors=true;
            }
        if(!email.trim())
        {
            newFieldErrors.email='Email is required';
            hasErrors=true;
            }
        else if(!validateEmail(email))
        {
            newFieldErrors.email='Invalid email format';
            hasErrors = true;
            }
        if (!password)
        {
            newFieldErrors.password = 'Password is required';
            hasErrors = true;
            }
        else
        {
            const passwordError = validatePassword(password);
            if (passwordError)
            {
                newFieldErrors.password = passwordError;
                hasErrors = true;
                }
            }
        if(!confirmPassword)
        {
            newFieldErrors.confirmPassword='Please confirm your password';
            hasErrors=true;
            }
        else if(password!=confirmPassword)
        {
            newFieldErrors.confirmPassword='Passwords do not match';
            hasErrors=true;
            }
        if(hasErrors)
        {
            setFieldErrors(newFieldErrors);
            return;
            }
        setIsLoading(true);
        try{

            const result=await registerUser({
                username,
                email,
                password,
                })
            if(result.success){
                setSuccessMessage('Account created successfully! Redirecting to login...');
                setTimeout(()=>{navigate('/login',{
                    state:{message:'Account created! Please login.'}
                    });
                },2000);
                }
            else {
                setError(result.error||'Registration failed');
                }
            }
        catch(err){
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
                console.error('Register error:', err);
                }
        finally{
                setIsLoading(false);
                }
            };

    if(isLoggedIn)
    {
        navigate('/dashboard');
        return null;}

    return(
        <div className="min-h-screen bg-gradient-to-b from-[#0A1F44] via-[#1E3A5F] to-gray-100 flex items -center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                        Create your
                    </h1>
                    <p className="text-xl text-gray-200">
                        Account
                    </p>
                </div>
                <div className="bg-white rounded-3xl shadow-2xl p-8">
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
                    <form onSubmit={handleSubmit}>
                        <Input
                            label="Username"
                            type="text"
                            placeholder="JohnDoe"
                            value={username}
                            onChange={(e)=>setUsername(e.target.value)}
                            error={fieldErrors.username}
                            autoComplete="username"
                        />
                        <Input
                            label="Email"
                            type="email"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={fieldErrors.email}
                            autoComplete="email"
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={fieldErrors.password}
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
                                <li className={password.length >= 8 ? 'text-green-600' : ''}>
                                    • At least 8 characters
                                </li>
                                <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                                    • One uppercase letter
                                </li>
                                <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
                                    • One lowercase letter
                                </li>
                                <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
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
                            {isLoading ? 'Creating account...' : 'SIGN UP'}
                        </Button>
                    </form>
                    <div className="mt-6 text-center">
                        <p className="text-gray-600 text-sm">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
        );
    }
