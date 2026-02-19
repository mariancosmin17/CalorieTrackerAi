import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export function LoginPage() {
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setFieldErrors({ username: '', password: '' });
    
    let hasErrors = false;
    const newFieldErrors = { username: '', password: '' };
    
    if (!username.trim()) {
      newFieldErrors.username = 'Username is required';
      hasErrors = true;
    }
    
    if (!password) {
      newFieldErrors.password = 'Password is required';
      hasErrors = true;
    }
    
    if (hasErrors) {
      setFieldErrors(newFieldErrors);
      return;
    }

    try {
      setIsLoading(true);
      
      const result = await login({ username, password });
      
      // Check result
      if (result.success) {
        navigate('/dashboard');
      } else if (result.requires2FA) {

        alert('2FA required! (mai tz)');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoggedIn) {
    navigate('/dashboard');
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1F44] via-[#1E3A5F] to-gray-100 flex items-center justify-center p-4">

      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Hello
          </h1>
          <p className="text-xl text-gray-200">
            Sign In
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <Input
              label="Username or Email"
              type="text"
              placeholder="john@example.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={fieldErrors.username}
              autoComplete="username"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              autoComplete="current-password"
            />

            <div className="text-right mb-6">
              <Link
                to="/forgot-password"
                className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
              >
                Forget password?
              </Link>
            </div>
            

            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'SIGN IN'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}