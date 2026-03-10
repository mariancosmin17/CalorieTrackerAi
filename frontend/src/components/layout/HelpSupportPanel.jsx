import { useState } from 'react';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import apiClient from '../../api/axios';

export function HelpSupportPanel({ onClose }) {
    const [message, setMessage]= useState('');
    const [isLoading, setIsLoading]= useState(false);
    const [success, setSuccess]= useState(false);
    const [error, setError]= useState(null);

    const handleSend = async () => {
        if (!message.trim()) {
            setError('Please write a message before sending.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const formData = new URLSearchParams();
            formData.append('message', message);
            await apiClient.post('/support', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
            setSuccess(true);
            setMessage('');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to send. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>

            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={onClose}
                aria-hidden="true"
            />

            <div className="fixed top-0 right-0 h-full w-64 bg-white z-50 shadow-2xl flex flex-col">

                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-[#1E3A5F]">Help & Support</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Close"
                    >
                        <XMarkIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                <div className="flex-1 flex flex-col p-5 overflow-y-auto">
                    {success ? (

                        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircleIcon className="w-9 h-9 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Message Sent!
                            </h3>
                            <p className="text-sm text-gray-500">
                                We received your message and will get back to you as soon as possible.
                            </p>
                            <button
                                onClick={onClose}
                                className="mt-4 w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    ) : (

                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Send us an email and we'll help you with your problem as soon as possible.
                            </p>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Your message
                                </label>
                                <textarea
                                    value={message}
                                    onChange={e => { setMessage(e.target.value); setError(null); }}
                                    placeholder="Describe your issue or question..."
                                    rows={8}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            {error && (
                                <p className="text-red-500 text-xs">{error}</p>
                            )}

                            <button
                                onClick={handleSend}
                                disabled={isLoading || !message.trim()}
                                className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Sending...' : 'Send Message'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}