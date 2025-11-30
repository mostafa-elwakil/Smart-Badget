import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Wallet } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            await api.register(name, email, password);
            setSuccess(true);
        } catch (err) {
            setError(err.message);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-secondary-50 p-4 dark:bg-secondary-950">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center space-y-2">
                        <div className="mx-auto bg-green-100 p-3 rounded-full w-fit dark:bg-green-900/20">
                            <Wallet className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-primary-900 dark:text-primary-100">Registration Successful</CardTitle>
                        <p className="text-secondary-500 dark:text-secondary-400">Please check your email to verify your account.</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button className="w-full" onClick={() => navigate('/login')}>Go to Login</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary-50 p-4 dark:bg-secondary-950">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto bg-primary-100 p-3 rounded-full w-fit dark:bg-primary-900/20">
                        <Wallet className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-primary-900 dark:text-primary-100">Create Account</CardTitle>
                    <p className="text-secondary-500 dark:text-secondary-400">Sign up to get started</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <Input
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
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
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Confirm Password</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button className="w-full" type="submit">Sign Up</Button>
                    </form>
                    <div className="text-center text-sm text-secondary-500 dark:text-secondary-400">
                        Already have an account? <Link to="/login" className="text-primary-600 hover:underline dark:text-primary-400">Sign in</Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
