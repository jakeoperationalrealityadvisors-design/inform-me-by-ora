import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpClient } from '@/api/httpClient';
import { createPageUrl } from '@/utils';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function VerifyEmail() {
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyToken = async () => {
            const params = new URLSearchParams(window.location.hash.split('?')[1]);
            const token = params.get('token');
            const email = params.get('email');

            if (!token || !email) {
                setStatus('error');
                setMessage('Invalid verification link');
                return;
            }

            try {
                const response = await httpClient.functions.invoke('verifyEmail', {
                    token,
                    email
                });

                if (response.data.success) {
                    setStatus('success');
                    setMessage('Your email has been verified successfully!');
                    
                    // Redirect to home after 3 seconds
                    setTimeout(() => {
                        navigate(createPageUrl('Home'));
                    }, 3000);
                } else {
                    setStatus('error');
                    setMessage(response.data.error || 'Verification failed');
                }
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.error || 'Verification failed. Please try again.');
            }
        };

        verifyToken();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center p-4">
            <Card className="bg-[#0f1419] border-blue-900/30 p-8 max-w-md w-full text-center">
                {status === 'verifying' && (
                    <>
                        <Loader2 className="w-16 h-16 mx-auto mb-4 text-blue-400 animate-spin" />
                        <h1 className="text-2xl font-bold text-white mb-2">Verifying your email...</h1>
                        <p className="text-blue-400">Please wait while we verify your email address.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-950/30 flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-green-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Email Verified!</h1>
                        <p className="text-blue-400 mb-6">{message}</p>
                        <p className="text-sm text-blue-500">Redirecting you to the app...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-950/30 flex items-center justify-center">
                            <XCircle className="w-10 h-10 text-red-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
                        <p className="text-blue-400 mb-6">{message}</p>
                        <Button
                            onClick={() => navigate(createPageUrl('Home'))}
                            className="bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]"
                        >
                            Go to Home
                        </Button>
                    </>
                )}
            </Card>
        </div>
    );
}