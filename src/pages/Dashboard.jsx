import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ArrowUpRight, ArrowDownRight, DollarSign, CreditCard } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';
import { formatDate } from '../lib/utils';

const SummaryCard = ({ title, amount, icon: Icon, trend, trendValue, type }) => {
    const { formatPrice } = useCurrency();

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">{title}</p>
                    <div className={`p-2 rounded-full ${type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : type === 'expense' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                        <Icon className="h-4 w-4" />
                    </div>
                </div>
                <div className="flex items-baseline justify-between">
                    <h2 className="text-2xl font-bold">{formatPrice(amount)}</h2>
                </div>
            </CardContent>
        </Card>
    );
};

export default function Dashboard() {
    const { formatPrice } = useCurrency();
    const { t } = useLanguage();
    const [stats, setStats] = useState({
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        savings: 0,
    });
    const [chartData, setChartData] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [expenses, income] = await Promise.all([
                api.getExpenses(),
                api.getIncome()
            ]);

            calculateStats(expenses, income);
            prepareChartData(expenses, income);
            prepareRecentTransactions(expenses, income);
        } catch (err) {
            console.error(err);
        }
    };

    const calculateStats = (expenses, income) => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const baseSalary = parseFloat(user.monthly_salary) || 0;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

        // Monthly Income = Base Salary + Income records for this month
        const monthlyIncomeRecords = income
            .filter(item => {
                const date = new Date(item.date);
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            })
            .reduce((sum, item) => sum + item.amount, 0);

        setStats({
            totalBalance: totalIncome - totalExpenses + baseSalary,
            monthlyIncome: totalMonthlyIncome,
            monthlyExpenses,
            savings: totalMonthlyIncome - monthlyExpenses
        });
    };

    const prepareChartData = (expenses, income) => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const baseSalary = parseFloat(user.monthly_salary) || 0;

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const data = months.map((month, index) => {
            const monthIncomeRecords = income
                .filter(item => new Date(item.date).getMonth() === index)
                .reduce((sum, item) => sum + item.amount, 0);

            const monthIncome = monthIncomeRecords + baseSalary;

            const monthExpense = expenses
                .filter(item => new Date(item.date).getMonth() === index)
                .reduce((sum, item) => sum + item.amount, 0);
            return { name: month, income: monthIncome, expense: monthExpense };
        });
        setChartData(data);
    };

    const prepareRecentTransactions = (expenses, income) => {
        const combined = [
            ...expenses.map(e => ({ ...e, type: 'expense' })),
            ...income.map(i => ({ ...i, type: 'income' }))
        ];
        combined.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentTransactions(combined.slice(0, 5));
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{t('dashboard')}</h2>
                <p className="text-secondary-500 dark:text-secondary-400">{t('overview')}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <SummaryCard title={t('totalBalance')} amount={stats.totalBalance} icon={DollarSign} trend="up" trendValue="+0%" type="balance" />
                <SummaryCard title={t('monthlyIncome')} amount={stats.monthlyIncome} icon={ArrowUpRight} trend="up" trendValue="+0%" type="income" />
                <SummaryCard title={t('monthlyExpenses')} amount={stats.monthlyExpenses} icon={ArrowDownRight} trend="down" trendValue="-0%" type="expense" />
                <SummaryCard title={t('savings')} amount={stats.savings} icon={CreditCard} trend="up" trendValue="+0%" type="balance" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>{t('overview')}</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatPrice(value).replace(/\D00(?=\D*$)/, '')} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <Tooltip formatter={(value) => formatPrice(value)} />
                                    <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" />
                                    <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>{t('recentTransactions')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {recentTransactions.map((item, i) => (
                                <div key={i} className="flex items-center">
                                    <div className={`h-9 w-9 rounded-full flex items-center justify-center ${item.type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                        {item.type === 'income' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{item.title || item.name}</p>
                                        <p className="text-xs text-secondary-500 dark:text-secondary-400">{formatDate(item.date)}</p>
                                    </div>
                                    <div className={`ml-auto font-medium ${item.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {item.type === 'income' ? '+' : '-'}{formatPrice(item.amount)}
                                    </div>
                                </div>
                            ))}
                            {recentTransactions.length === 0 && (
                                <p className="text-center text-secondary-500">No recent transactions</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
