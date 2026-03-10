import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { BottomNavbar } from '../../components/layout/BottomNavbar';
import { getProfile } from '../../api/profileApi';
import { enable2FA, verify2FASetup, disable2FA } from '../../api/twoFaApi';

export function TwoFASettingsPage() {
    const navigate = useNavigate();

    const [is2FAEnabled, setIs2FAEnabled]= useState(false);
    const [isLoading, setIsLoading]= useState(true);

    const [qrCode, setQrCode]= useState(null);
    const [setupCode, setSetupCode]= useState('');
    const [isEnabling, setIsEnabling]= useState(false);

    const [disableCode, setDisableCode]= useState('');
    const [isDisabling, setIsDisabling]= useState(false);
    const [showDisableForm, setShowDisableForm]= useState(false);

    const [msg, setMsg]= useState(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await getProfile();
                if (res && res.success) {
                    setIs2FAEnabled(res.is_2fa_enabled);
                }
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStatus();
    }, []);

    const handleEnable = async () => {
        setIsEnabling(true);
        setMsg(null);
        try {
            const res = await enable2FA();
            setQrCode(res.qr_code);
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to start 2FA setup.' });
        } finally {
            setIsEnabling(false);
        }
    };

    const handleVerifySetup = async () => {
        if (!setupCode || setupCode.length !== 6) {
            setMsg({ type: 'error', text: 'Please enter the 6-digit code.' });
            return;
        }
        setIsEnabling(true);
        setMsg(null);
        try {
            await verify2FASetup(setupCode);
            setIs2FAEnabled(true);
            setQrCode(null);
            setSetupCode('');
            setMsg({ type: 'success', text: '2FA enabled successfully! ' });
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.detail || 'Invalid code. Try again.' });
        } finally {
            setIsEnabling(false);
        }
    };

    const handleDisable = async () => {
        if (!disableCode || disableCode.length !== 6) {
            setMsg({ type: 'error', text: 'Please enter the 6-digit code from Authenticator.' });
            return;
        }
        setIsDisabling(true);
        setMsg(null);
        try {
            await disable2FA(disableCode);
            setIs2FAEnabled(false);
            setShowDisableForm(false);
            setDisableCode('');
            setMsg({ type: 'success', text: '2FA disabled successfully.' });
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.detail || 'Invalid code. Try again.' });
        } finally {
            setIsDisabling(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0A1F44] via-[#1E3A5F] to-gray-100 pb-20">
            <div className="p-6 max-w-2xl mx-auto">

                <div className="mb-6">
                    <button
                        onClick={() => navigate('/settings')}
                        className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors mb-4"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">Back</span>
                    </button>
                    <h1 className="text-3xl font-bold text-white">2FA Settings</h1>
                </div>

                {msg && (
                    <div className={`rounded-xl p-4 mb-4 ${msg.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        <p className={`text-sm ${msg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                            {msg.text}
                        </p>
                    </div>
                )}

                {isLoading ? (
                    <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                        <div className="h-5 bg-gray-200 rounded w-40 mb-3" />
                        <div className="h-4 bg-gray-100 rounded w-64" />
                    </div>
                ) : (
                    <div className="space-y-4">

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-semibold text-gray-900">
                                        Two-Factor Authentication
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {is2FAEnabled
                                            ? 'Your account is protected with 2FA.'
                                            : 'Add an extra layer of security to your account.'
                                        }
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    is2FAEnabled
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {is2FAEnabled ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>
                        </div>

                        {!is2FAEnabled && (
                            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
                                {!qrCode ? (
                                    <>
                                        <p className="text-sm text-gray-600">
                                            Use an authenticator app like <strong>Google Authenticator</strong> or <strong>Authy</strong> to scan the QR code and secure your account.
                                        </p>
                                        <button
                                            onClick={handleEnable}
                                            disabled={isEnabling}
                                            className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                                        >
                                            {isEnabling ? 'Generating QR...' : 'Enable 2FA'}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm text-gray-700 font-medium">
                                            Scan this QR code with your Authenticator app:
                                        </p>
                                        <div className="flex justify-center">
                                            <img
                                                src={qrCode}
                                                alt="2FA QR Code"
                                                className="w-48 h-48 rounded-xl border border-gray-200"
                                            />
                                        </div>
                                        <p className="text-sm text-gray-500 text-center">
                                            After scanning, enter the 6-digit code below to confirm.
                                        </p>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Verification Code
                                            </label>
                                            <input
                                                type="text"
                                                value={setupCode}
                                                onChange={e => setSetupCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                placeholder="123456"
                                                maxLength={6}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => { setQrCode(null); setSetupCode(''); setMsg(null); }}
                                                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleVerifySetup}
                                                disabled={isEnabling || setupCode.length !== 6}
                                                className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                                            >
                                                {isEnabling ? 'Verifying...' : 'Confirm'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {is2FAEnabled && (
                            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
                                {!showDisableForm ? (
                                    <>
                                        <p className="text-sm text-gray-600">
                                            2FA is currently active. To disable it, you'll need to confirm with your Authenticator code.
                                        </p>
                                        <button
                                            onClick={() => { setShowDisableForm(true); setMsg(null); }}
                                            className="w-full py-3 border-2 border-red-400 text-red-500 rounded-xl font-medium hover:bg-red-50 transition-colors"
                                        >
                                            Disable 2FA
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm text-gray-700 font-medium">
                                            Enter the code from your Authenticator app to disable 2FA:
                                        </p>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Authenticator Code
                                            </label>
                                            <input
                                                type="text"
                                                value={disableCode}
                                                onChange={e => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                placeholder="123456"
                                                maxLength={6}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-red-400"
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => { setShowDisableForm(false); setDisableCode(''); setMsg(null); }}
                                                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleDisable}
                                                disabled={isDisabling || disableCode.length !== 6}
                                                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                                            >
                                                {isDisabling ? 'Disabling...' : 'Disable'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                    </div>
                )}
            </div>
            <BottomNavbar />
        </div>
    );
}