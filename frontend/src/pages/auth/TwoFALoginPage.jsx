import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export function TwoFALoginPage() {
    const { verify2FA }= useAuth();
    const navigate= useNavigate();
    const location= useLocation();

    const tempToken= location.state?.tempToken;
    const username= location.state?.username;

    useEffect(() => {
        if (!tempToken) {
            navigate('/login');
        }
    }, [tempToken, navigate]);

    const [code, setCode]= useState('');
    const [isLoading, setIsLoading]= useState(false);
    const [error, setError]= useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!code.trim() || code.length !== 6) {
            setError('Please enter the 6-digit code.');
            return;
        }

        setIsLoading(true);
        try {
            const result = await verify2FA({ temp_token: tempToken, code });
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error || 'Invalid code. Please try again.');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!tempToken) return null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0A1F44] via-[#1E3A5F] to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                        Two-Factor
                    </h1>
                    <p className="text-xl text-gray-200">
                        Authentication
                    </p>
                </div>
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm text-center">{error}</p>
                        </div>
                    )}
                    <div className="mb-6">
                        <p className="text-gray-600 text-sm text-center">
                            Open your <strong>Authenticator app</strong> and enter the 6-digit code for CalorieTracker AI.
                        </p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <Input
                            label="Verification Code"
                            type="text"
                            placeholder="123456"
                            value={code}
                            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            maxLength={6}
                            autoComplete="one-time-code"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            loading={isLoading}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Verifying...' : 'VERIFY'}
                        </Button>
                    </form>
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm text-gray-600 hover:text-primary-600 transition-colors inline-flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Sign In
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}