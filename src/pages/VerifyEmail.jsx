import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { api } from '../api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token found.');
            return;
        }

        const verify = async () => {
            try {
                await api.verifyEmail(token);
                setStatus('success');
                setMessage('Email verified successfully! You can now login.');
            } catch (err) {
                setStatus('error');
                setMessage(err.message || 'Verification failed.');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">Email Verification</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                    {status === 'verifying' && (
                        <>
                            <Loader2 className="h-12 w-12 text-primary-600 animate-spin" />
                            <p className="text-secondary-600 dark:text-secondary-400">Verifying your email...</p>
                        </>
                    )}
                    {status === 'success' && (
                        <>
                            <CheckCircle className="h-12 w-12 text-green-600" />
                            <p className="text-center text-secondary-600 dark:text-secondary-400">{message}</p>
                            <Button onClick={() => navigate('/login')} className="w-full">
                                Go to Login
                            </Button>
                        </>
                    )}
                    {status === 'error' && (
                        <>
                            <XCircle className="h-12 w-12 text-red-600" />
                            <p className="text-center text-red-600">{message}</p>
                            <Button onClick={() => navigate('/login')} variant="secondary" className="w-full">
                                Back to Login
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
