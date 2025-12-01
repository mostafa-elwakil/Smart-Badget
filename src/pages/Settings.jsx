import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Bell, Moon, Shield, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';

export default function Settings() {
    const { theme, toggleTheme } = useTheme();
    const { currency, setCurrency } = useCurrency();

    const [user, setUser] = React.useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [name, setName] = React.useState(user.name || '');
    const [email, setEmail] = React.useState(user.email || '');
    const [monthlySalary, setMonthlySalary] = React.useState(user.monthly_salary || '');
    const [expectedSavings, setExpectedSavings] = React.useState(user.expected_savings || '');
    const [salaryDepositDay, setSalaryDepositDay] = React.useState(user.salary_deposit_day || '');
    const [message, setMessage] = React.useState('');

    const handleUpdateProfile = async () => {
        try {
            const updatedUser = await import('../api').then(module => module.api.updateProfile({
                name,
                email,
                monthly_salary: monthlySalary,
                expected_savings: expectedSavings,
                salary_deposit_day: salaryDepositDay
            }));
            setUser(updatedUser.user);
            setMessage('Profile updated successfully');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(err.message);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-secondary-500 dark:text-secondary-400">Manage your account and preferences.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                            Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {message && <div className={`text-sm ${message.includes('success') ? 'text-green-500' : 'text-red-500'}`}>{message}</div>}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Monthly Salary</label>
                                <Input type="number" value={monthlySalary} onChange={(e) => setMonthlySalary(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Expected Savings</label>
                                <Input type="number" value={expectedSavings} onChange={(e) => setExpectedSavings(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Salary Deposit Day</label>
                            <Input type="number" min="1" max="31" value={salaryDepositDay} onChange={(e) => setSalaryDepositDay(e.target.value)} />
                        </div>
                        <Button onClick={handleUpdateProfile}>Save Changes</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                            Security
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Current Password</label>
                            <Input type="password" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">New Password</label>
                            <Input type="password" />
                        </div>
                        <Button variant="secondary">Update Password</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                            Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Email Notifications</span>
                            <input type="checkbox" className="toggle" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Push Notifications</span>
                            <input type="checkbox" className="toggle" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Weekly Reports</span>
                            <input type="checkbox" className="toggle" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Moon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                            Appearance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Dark Mode</span>
                            <input
                                type="checkbox"
                                className="toggle"
                                checked={theme === 'dark'}
                                onChange={toggleTheme}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Currency</label>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="flex h-10 w-full rounded-lg border border-secondary-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-secondary-900 dark:border-secondary-700 dark:text-secondary-50"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="EGP">EGP (E£)</option>
                                <option value="SAR">SAR (ر.س)</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
