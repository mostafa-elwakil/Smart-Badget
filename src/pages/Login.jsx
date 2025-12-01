import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Wallet } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary-50 p-4 dark:bg-secondary-950">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto bg-primary-100 p-3 rounded-full w-fit dark:bg-primary-900/20">
                        <Wallet className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-primary-900 dark:text-primary-100">Welcome Back</CardTitle>
                    <p className="text-secondary-500 dark:text-secondary-400">Sign in to your account</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex justify-end">
                            <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline dark:text-primary-400">
                                Forgot Password?
                            </Link>
                        </div>
                        <Button className="w-full" type="submit">Sign In</Button>
                    </form>
                    <div className="text-center text-sm text-secondary-500 dark:text-secondary-400">
                        Don't have an account? <Link to="/register" className="text-primary-600 hover:underline dark:text-primary-400">Sign up</Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
